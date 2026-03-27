import axios from 'axios';

interface ErrorProcesamiento {
    url: string;
    error: string;
}

interface ComponenteEncontrado {
    key: string;
    label: string;
    type: string;
    description: string;
    validation?: string;
    sourcePath: string;
    enumNames?: string[];
}

interface ResultadoFormulario {
    url: string;
    title: string;
    timestamp: string;
    componentesEncontrados?: ComponenteEncontrado[];
    tipoDocumentos?: { key: string; label: string; enumNames: string[] }[];
    estadisticasFieldType?: {
        porTipo: Record<string, number>;
        total: number;
    };
}

interface InformeGeneral {
    fechaEjecucion: string;
    totalUrls: number;
    procesadosExitosamente: number;
    conErrores: number;
    filtrosAplicados: {
        tipo: string;
        valor: string;
    }[];
    formulariosDetalle: ResultadoFormulario[];
    errores: ErrorProcesamiento[];
    estadisticasGlobalesFieldType?: {
        porTipo: Record<string, number>;
        total: number;
    };
}

type MatchMode = 'all' | 'any';
type TextTarget = 'key' | 'name' | 'label' | 'placeholder' | 'title' | 'description' | 'value';
type TermBasedFilterType = 'dropdown-with-terms' | 'fields-by-terms' | 'buttons-by-terms';

const ALL_TEXT_TARGETS: TextTarget[] = ['key', 'name', 'label', 'placeholder', 'title', 'description', 'value'];
const DEFAULT_TERM_TARGETS: TextTarget[] = ['key', 'name', 'label'];
const HIDDEN_VISIBILITY_TOKENS = ['d-none', 'display:none', 'hidden', 'sr-only', 'visually-hidden'];
const INTERACTIVE_TYPE_TOKENS = [
    'input',
    'text-input',
    'textfield',
    'textarea',
    'select',
    'dropdown',
    'drop-down',
    'checkbox',
    'radio',
    'button',
    'submit',
    'date',
    'email',
    'number',
    'password',
    'signature'
];
const PLAIN_TEXT_SCHEMA_TOKENS = ['plain-text', '/text', 'richtext', 'rich-text', 'html', 'contentfragment'];
const INFORMATIVE_NAMING_TOKENS = [
    'plaintext',
    'plain-text',
    'richtext',
    'rich-text',
    'html',
    'informacion',
    'informativo',
    'info',
    'message',
    'mensaje',
    'description',
    'descripcion',
    'content',
    'disclaimer',
    'legal'
];
const PLAIN_TEXT_MIN_CONTENT_LENGTH = 40;
const DEFAULT_CHECKBOX_MIN_OPTIONS = 3;
const FETCH_TIMEOUT_MS = 5000;
const DROPDOWN_COMPONENT_TYPES = ['select', 'dropdown', 'drop-down'];
const SIGNATURE_COMPONENT_TOKENS = ['signature', 'signaturepad', 'signature-pad', 'esign', 'e-sign', 'firma'];
const SIGNATURE_NAMING_TOKENS = ['signature', 'signaturepad', 'signature-pad', 'esign', 'e-sign', 'firmaelectronica', 'tipofirmaelectronica'];
const SIGNATURE_FLAG_KEYS = ['signature', 'signaturetype', 'tipofirmaelectronica', 'firmaelectronica'];
const SIGNATURE_POSITIVE_VALUES = ['yes', 'true', 'si', '1', 'simple', 'digital', 'electronica', 'electronic'];
const SIGNATURE_NEGATIVE_VALUES = ['no', 'false', '0', 'no aplica', 'none', 'ninguno', 'n/a', 'na'];
const SIGNATURE_CONFIG_VALUE_TOKENS = [...SIGNATURE_COMPONENT_TOKENS, ...SIGNATURE_POSITIVE_VALUES];
const INVALID_FIELD_TYPE_TOKENS = [
    'string', 'number', 'integer', 'boolean', 'object', 'array',
    'string[]', 'number[]', 'integer[]', 'object[]',
    'form', 'text/css', 'text/javascript', 'application/json',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
];

export type FilterType =
    | 'dropdown-with-terms'
    | 'plain-text'
    | 'fields-by-terms'
    | 'signature'
    | 'tooltip'
    | 'buttons-by-terms'
    | 'panel-non-accordion'
    | 'flags-by-keys'
    | 'checkbox-group'
    | 'fieldtype-search'
    | 'all-fieldtypes-summary';

export interface FilterRequest {
    presetId?: string;
    type: FilterType;
    label?: string;
    params?: Record<string, unknown>;
}

export interface ProcessingOptions {
    formUrls: string[];
    filter: FilterRequest;
}

interface TermFilterParams {
    terms: string[];
    mode: MatchMode;
    targets: TextTarget[];
    componentTypes?: string[];
    extractEnumNames?: boolean;
}

interface FlagFilterParams {
    keys: string[];
    mode: MatchMode;
}

interface CheckboxGroupParams {
    minOptions: number;
}

interface FieldTypeSearchParams {
    fieldTypes: string[];
    mode: MatchMode;
}

interface RuntimeContext {
    matchedTerms: Set<string>;
    matchedFlags: Set<string>;
    matchedFieldTypes: Map<string, number>;
}

export class ProcesadorFormularios {
    private jsonCache: Map<string, any> = new Map();

    private normalizeText(value: unknown): string {
        if (value === undefined || value === null) return '';
        return String(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    private getLabelText(obj: any): string {
        if (obj?.label && typeof obj.label === 'object') {
            return obj.label.value || JSON.stringify(obj.label);
        }

        if (obj?.label !== undefined && obj?.label !== null) {
            return String(obj.label);
        }

        return '';
    }

    private getTextByTarget(obj: any, labelText: string, target: TextTarget): string {
        switch (target) {
            case 'key':
                return this.normalizeText(obj?.key);
            case 'name':
                return this.normalizeText(obj?.name);
            case 'label':
                return this.normalizeText(labelText);
            case 'placeholder':
                return this.normalizeText(obj?.placeholder);
            case 'title':
                return this.normalizeText(obj?.title);
            case 'description':
                return this.normalizeText(obj?.description);
            case 'value':
                return this.normalizeText(obj?.value);
            default:
                return '';
        }
    }

    private getCheckboxOptionCount(obj: any): number {
        const possibleArrays = [obj?.enumNames, obj?.data?.values, obj?.options, obj?.items, obj?.values];
        return possibleArrays.reduce((maxCount: number, currentValue: any) => {
            return Array.isArray(currentValue) ? Math.max(maxCount, currentValue.length) : maxCount;
        }, 0);
    }

    private computeFieldTypeStatistics(components: ComponenteEncontrado[]): { porTipo: Record<string, number>; total: number } {
        const stats: Record<string, number> = {};
        let total = 0;

        components.forEach((component) => {
            const fieldType = component.type || 'sin-tipo';
            stats[fieldType] = (stats[fieldType] || 0) + 1;
            total++;
        });

        return {
            porTipo: stats,
            total
        };
    }

    private countAllFieldTypes(obj: any): { porTipo: Record<string, number>; total: number } {
        const stats: Record<string, number> = {};
        let total = 0;

        const walkAll = (current: any) => {
            if (typeof current !== 'object' || current === null) return;

            if (Array.isArray(current)) {
                current.forEach((item) => walkAll(item));
                return;
            }

            const fieldType = this.getCanonicalFieldType(current);
            if (fieldType) {
                stats[fieldType] = (stats[fieldType] || 0) + 1;
                total++;
            }

            for (const property in current) {
                walkAll(current[property]);
            }
        };

        walkAll(obj);

        return {
            porTipo: stats,
            total
        };
    }

    private getEnumNames(obj: any): string[] {
        if (Array.isArray(obj?.enumNames)) {
            return obj.enumNames;
        }

        if (Array.isArray(obj?.data?.values)) {
            return obj.data.values.map((value: any) => value.label || value.value).filter(Boolean);
        }

        return [];
    }

    private getNodeTypeTokens(obj: any): string[] {
        return [obj?.type, obj?.fieldType, obj?.[':type']]
            .map((value) => this.normalizeText(value))
            .filter(Boolean);
    }

    private normalizeFieldTypeToken(value: unknown): string | null {
        const token = this.normalizeText(value);

        if (!token || INVALID_FIELD_TYPE_TOKENS.includes(token)) {
            return null;
        }

        if (token === 'drop-down') return 'dropdown';
        if (token === 'text-input' || token === 'textfield') return 'text';
        if (token === 'rich-text') return 'richtext';

        return token;
    }

    private getCanonicalFieldType(obj: any): string | null {
        const fieldType = this.normalizeFieldTypeToken(obj?.fieldType);
        if (fieldType) {
            return fieldType;
        }

        const typeToken = this.normalizeFieldTypeToken(obj?.type);
        if (typeToken) {
            const isKnownInteractive = INTERACTIVE_TYPE_TOKENS.some((token) => typeToken.includes(token));
            const isKnownInformative = ['plain-text', 'plaintext', 'richtext', 'html', 'file'].includes(typeToken);

            if (isKnownInteractive || isKnownInformative) {
                return typeToken;
            }
        }

        const schemaTokens = this.getSchemaTypeTokens(obj);
        const plainTextToken = schemaTokens.find((token) =>
            PLAIN_TEXT_SCHEMA_TOKENS.some((schemaToken) => token === schemaToken || token.includes(schemaToken))
        );

        if (plainTextToken) {
            if (plainTextToken.includes('rich')) return 'richtext';
            if (plainTextToken.includes('html')) return 'html';
            return 'plain-text';
        }

        return null;
    }

    private getSchemaTypeTokens(obj: any): string[] {
        return [
            obj?.type,
            obj?.fieldType,
            obj?.[':type'],
            obj?.resourceType,
            obj?.['sling:resourceType'],
            obj?.['jcr:primaryType']
        ]
            .map((value) => this.normalizeText(value))
            .filter(Boolean);
    }

    private getCandidateTextContent(obj: any): string[] {
        return [
            obj?.text,
            obj?.html,
            obj?.content,
            obj?.richText,
            obj?.value,
            obj?.description,
            obj?.title
        ]
            .filter((value): value is string => typeof value === 'string')
            .map((value) => value.trim())
            .filter(Boolean);
    }

    private isHiddenNode(obj: any): boolean {
        if (obj?.hidden === true || obj?.visible === false) {
            return true;
        }

        const visibilityTokens = [obj?.customClass, obj?.className, obj?.cssClass, obj?.style]
            .map((value) => this.normalizeText(value))
            .filter(Boolean)
            .join(' | ');

        return HIDDEN_VISIBILITY_TOKENS.some((token) => visibilityTokens.includes(token));
    }

    private isInteractiveInputNode(obj: any): boolean {
        const typeTokens = this.getSchemaTypeTokens(obj);

        return typeTokens.some((typeToken) => INTERACTIVE_TYPE_TOKENS.some((interactiveToken) => typeToken.includes(interactiveToken)));
    }

    private getPlainTextDescriptor(obj: any, labelText: string): { description: string; labelOverride?: string } | null {
        if (this.isHiddenNode(obj)) {
            return null;
        }

        const schemaTypeTokens = this.getSchemaTypeTokens(obj);
        const primaryType = schemaTypeTokens[0] || '';
        const namingHaystack = [obj?.key, obj?.name, labelText, obj?.title]
            .map((value) => this.normalizeText(value))
            .filter(Boolean)
            .join(' | ');
        const contentCandidates = this.getCandidateTextContent(obj);
        const normalizedContent = contentCandidates.map((value) => this.normalizeText(value));
        const contentPreview = contentCandidates.find((value) => value.length > 0);
        const containsHtmlMarkup = contentCandidates.some((value) => /<[^>]+>/.test(value));
        const hasInformativeCopy = normalizedContent.some((value) => value.length >= PLAIN_TEXT_MIN_CONTENT_LENGTH);
        const isInteractiveInput = this.isInteractiveInputNode(obj);

        const hasPlainTextSchema = schemaTypeTokens.some((token) => PLAIN_TEXT_SCHEMA_TOKENS.some((schemaToken) => token === schemaToken || token.includes(schemaToken)));

        const hasInformativeNaming = INFORMATIVE_NAMING_TOKENS.some((token) => namingHaystack.includes(token));

        if (hasPlainTextSchema && !isInteractiveInput) {
            return {
                description: `Bloque informativo detectado por esquema: ${schemaTypeTokens[0] || 'plain-text'}`,
                labelOverride: contentPreview || obj?.title || labelText || undefined
            };
        }

        if (containsHtmlMarkup && !isInteractiveInput) {
            return {
                description: 'Bloque informativo con HTML embebido',
                labelOverride: contentPreview || obj?.title || labelText || undefined
            };
        }

        if ((hasInformativeNaming || primaryType === 'panel' || primaryType === 'text') && hasInformativeCopy && !isInteractiveInput) {
            return {
                description: 'Bloque informativo detectado por naming/contenido',
                labelOverride: contentPreview || obj?.title || labelText || undefined
            };
        }

        return null;
    }

    private isTruthySignatureValue(value: unknown): boolean {
        const normalizedValue = this.normalizeText(value);
        return SIGNATURE_POSITIVE_VALUES.some((token) => normalizedValue === token || normalizedValue.includes(token));
    }

    private hasConfiguredSignatureValue(value: unknown): boolean {
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
            return false;
        }

        const normalizedValue = this.normalizeText(value);
        if (!normalizedValue) {
            return false;
        }

        if (SIGNATURE_NEGATIVE_VALUES.includes(normalizedValue)) {
            return false;
        }

        return SIGNATURE_CONFIG_VALUE_TOKENS.some((token) => normalizedValue === token || normalizedValue.includes(token));
    }

    private resolveFoundComponentType(obj: any, fallbackType: string): string {
        const canonicalFieldType = this.getCanonicalFieldType(obj);
        if (canonicalFieldType) {
            return canonicalFieldType;
        }

        const normalizedFieldType = this.normalizeFieldTypeToken(obj?.fieldType);
        if (normalizedFieldType) {
            return normalizedFieldType;
        }

        const normalizedType = this.normalizeFieldTypeToken(obj?.type);
        if (normalizedType) {
            return normalizedType;
        }

        return fallbackType;
    }

    private getSignatureDescriptor(obj: any, labelText: string): { description: string; labelOverride?: string; pathSuffix?: string } | null {
        const schemaTypeTokens = this.getSchemaTypeTokens(obj);
        const canonicalFieldType = this.getCanonicalFieldType(obj);
        const namingHaystack = [obj?.key, obj?.name, labelText, obj?.title]
            .map((value) => this.normalizeText(value))
            .filter(Boolean)
            .join(' | ');

        const signatureComponentToken = schemaTypeTokens.find((token) => SIGNATURE_COMPONENT_TOKENS.some((signatureToken) => token.includes(signatureToken)));
        if (signatureComponentToken) {
            return {
                description: `Firma detectada por componente/esquema: ${signatureComponentToken}`,
                labelOverride: labelText || obj?.title || obj?.name || undefined
            };
        }

        const signatureNamingToken = SIGNATURE_NAMING_TOKENS.find((token) => namingHaystack.includes(token));
        const isInputLikeNode = this.isInteractiveInputNode(obj)
            || (canonicalFieldType !== null && canonicalFieldType !== 'panel' && canonicalFieldType !== 'plain-text' && canonicalFieldType !== 'html' && canonicalFieldType !== 'richtext');

        if (signatureNamingToken && isInputLikeNode) {
            return {
                description: `Firma detectada por naming técnico: ${signatureNamingToken}`,
                labelOverride: labelText || obj?.title || obj?.name || undefined
            };
        }

        for (const [rawKey, rawValue] of Object.entries(obj)) {
            const normalizedKey = this.normalizeText(rawKey).replace(/_/g, '');
            if (!SIGNATURE_FLAG_KEYS.includes(normalizedKey)) {
                continue;
            }

            const hasValidSignatureValue = normalizedKey === 'signature'
                ? this.isTruthySignatureValue(rawValue)
                : this.hasConfiguredSignatureValue(rawValue);

            if (hasValidSignatureValue) {
                return {
                    description: `Firma detectada por flag técnico: ${rawKey}=${String(rawValue)}`,
                    labelOverride: String(rawValue ?? 'N/A'),
                    pathSuffix: `.${rawKey}`
                };
            }
        }

        return null;
    }

    private hasAllowedComponentType(obj: any, componentTypes?: string[]): boolean {
        if (!componentTypes || componentTypes.length === 0) return true;
        const nodeTypeTokens = this.getNodeTypeTokens(obj);
        const normalizedComponentTypes = componentTypes.map((componentType) => this.normalizeText(componentType));
        return normalizedComponentTypes.some((componentType) => nodeTypeTokens.some((nodeType) => nodeType.includes(componentType)));
    }

    private parseMatchMode(value: unknown, fallback: MatchMode = 'any'): MatchMode {
        return value === 'all' ? 'all' : value === 'any' ? 'any' : fallback;
    }

    private parseTextTargets(value: unknown, fallback: TextTarget[]): TextTarget[] {
        if (!Array.isArray(value)) return fallback;
        return value.filter((item): item is TextTarget => typeof item === 'string' && ALL_TEXT_TARGETS.includes(item as TextTarget));
    }

    private parseTermFilterParams(params: Record<string, unknown> | undefined, defaults: Partial<TermFilterParams> = {}): TermFilterParams {
        const fallbackTargets: TextTarget[] = defaults.targets || DEFAULT_TERM_TARGETS;
        const terms = Array.isArray(params?.terms)
            ? params!.terms.map((term) => this.normalizeText(term)).filter(Boolean)
            : [];

        return {
            terms,
            mode: this.parseMatchMode(params?.mode, defaults.mode || 'any'),
            targets: this.parseTextTargets(params?.targets, fallbackTargets),
            componentTypes: Array.isArray(params?.componentTypes)
                ? params!.componentTypes.map((componentType) => this.normalizeText(componentType)).filter(Boolean)
                : defaults.componentTypes,
            extractEnumNames: typeof params?.extractEnumNames === 'boolean'
                ? params.extractEnumNames
                : defaults.extractEnumNames
        };
    }

    private parseFlagFilterParams(params: Record<string, unknown> | undefined): FlagFilterParams {
        return {
            keys: Array.isArray(params?.keys)
                ? params!.keys.map((key) => this.normalizeText(key).replace(/_/g, '')).filter(Boolean)
                : Array.isArray(params?.terms)
                    ? params!.terms.map((key) => this.normalizeText(key).replace(/_/g, '')).filter(Boolean)
                    : [],
            mode: this.parseMatchMode(params?.mode, 'any')
        };
    }

    private parseCheckboxGroupParams(params: Record<string, unknown> | undefined): CheckboxGroupParams {
        const minOptions = Number(params?.minOptions);
        return {
            minOptions: Number.isFinite(minOptions) && minOptions >= 2 ? minOptions : DEFAULT_CHECKBOX_MIN_OPTIONS
        };
    }

    private parseFieldTypeSearchParams(params: Record<string, unknown> | undefined): FieldTypeSearchParams {
        return {
            fieldTypes: Array.isArray(params?.terms)
                ? params!.terms.map((ft) => this.normalizeText(ft)).filter(Boolean)
                : Array.isArray(params?.fieldTypes)
                    ? params!.fieldTypes.map((ft) => this.normalizeText(ft)).filter(Boolean)
                    : [],
            mode: this.parseMatchMode(params?.mode, 'any')
        };
    }

    private isTermBasedFilterType(filterType: FilterType): filterType is TermBasedFilterType {
        return filterType === 'dropdown-with-terms'
            || filterType === 'fields-by-terms'
            || filterType === 'buttons-by-terms';
    }

    private getTermFilterParamsForFilter(filter: FilterRequest): TermFilterParams {
        switch (filter.type) {
            case 'dropdown-with-terms':
                return this.parseTermFilterParams(filter.params, {
                    mode: 'any',
                    targets: DEFAULT_TERM_TARGETS,
                    componentTypes: DROPDOWN_COMPONENT_TYPES,
                    extractEnumNames: true
                });
            case 'fields-by-terms':
                return this.parseTermFilterParams(filter.params, {
                    mode: 'any',
                    targets: DEFAULT_TERM_TARGETS
                });
            case 'buttons-by-terms':
                return this.parseTermFilterParams(filter.params, {
                    mode: 'any',
                    targets: ['value', 'key', 'name', 'label']
                });
            default:
                return this.parseTermFilterParams(filter.params, {
                    mode: 'any',
                    targets: DEFAULT_TERM_TARGETS
                });
        }
    }

    private getSummaryTermFilterParams(filter: FilterRequest): TermFilterParams {
        return this.parseTermFilterParams(filter.params, {
            mode: 'any',
            targets: DEFAULT_TERM_TARGETS
        });
    }

    private getMatchedTerms(obj: any, labelText: string, params: TermFilterParams): string[] {
        if (params.terms.length === 0 || !this.hasAllowedComponentType(obj, params.componentTypes)) {
            return [];
        }

        const haystack = params.targets
            .map((target) => this.getTextByTarget(obj, labelText, target))
            .filter(Boolean)
            .join(' | ');

        if (!haystack) return [];
        return params.terms.filter((term) => haystack.includes(term));
    }

    private addFoundComponent(
        foundComponents: ComponenteEncontrado[],
        obj: any,
        currentPath: string,
        description: string,
        fallbackType: string,
        labelOverride?: string,
        enumNames?: string[]
    ) {
        foundComponents.push({
            key: obj?.key || obj?.name || 'N/A',
            label: labelOverride || this.getLabelText(obj) || obj?.value || 'N/A',
            type: this.resolveFoundComponentType(obj, fallbackType),
            description,
            sourcePath: currentPath,
            enumNames
        });
    }

    private buildFormResultByFilter(
        filterType: FilterType,
        baseData: { url: string; title: string; timestamp: string },
        foundComponents: ComponenteEncontrado[],
        extractedTipos: { key: string; label: string; enumNames: string[] }[],
        fieldTypeStats?: { porTipo: Record<string, number>; total: number }
    ): ResultadoFormulario {
        const result: ResultadoFormulario = {
            url: baseData.url,
            title: baseData.title,
            timestamp: baseData.timestamp
        };

        switch (filterType) {
            case 'all-fieldtypes-summary':
                if (fieldTypeStats && fieldTypeStats.total > 0) {
                    result.estadisticasFieldType = fieldTypeStats;
                }
                return result;

            case 'dropdown-with-terms':
                if (foundComponents.length > 0) {
                    result.componentesEncontrados = foundComponents;
                }
                if (extractedTipos.length > 0) {
                    result.tipoDocumentos = extractedTipos;
                }
                return result;

            case 'fieldtype-search':
                if (foundComponents.length > 0) {
                    result.componentesEncontrados = foundComponents;
                }
                if (fieldTypeStats && fieldTypeStats.total > 0) {
                    result.estadisticasFieldType = fieldTypeStats;
                }
                return result;

            default:
                if (foundComponents.length > 0) {
                    result.componentesEncontrados = foundComponents;
                }
                return result;
        }
    }

    private async goFetchUrl(url: string, index: number, total: number): Promise<any> {
        try {
            console.log(`[${index + 1}/${total}] Procesando: ${url}`);
            
            if (this.jsonCache.has(url)) {
                 return { url, data: this.jsonCache.get(url), cached: true };
            }

            const response = await axios.get(url, {
                timeout: FETCH_TIMEOUT_MS, // Menor que el límite de 10s de Vercel para al menos devolver respuesta
                headers: {
                    'User-Agent': 'ProcesadorFormularios/2.0'
                }
            });
            const data = response.data;
            this.jsonCache.set(url, data);
            return { url, data, cached: false };
        } catch (error: any) {
            console.error(`❌ Error en URL ${url}: ${error.message}`);
            return { url, error: error.message };
        }
    }

    private walkAndFilter(
        obj: any,
        currentPath: string,
        foundComponents: ComponenteEncontrado[],
        filter: FilterRequest,
        runtimeContext: RuntimeContext
    ) {
        if (typeof obj !== 'object' || obj === null) return;

        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                this.walkAndFilter(item, `${currentPath}[${index}]`, foundComponents, filter, runtimeContext);
            });
            return;
        }

        const params = filter.params || {};
        const labelText = this.getLabelText(obj);
        const typeLower = this.normalizeText(obj?.type || obj?.fieldType || '');
        const keyLower = this.normalizeText(obj?.key || obj?.name || '');

        switch (filter.type) {
            case 'plain-text': {
                const plainTextMatch = this.getPlainTextDescriptor(obj, labelText);

                if (plainTextMatch) {
                    this.addFoundComponent(
                        foundComponents,
                        obj,
                        currentPath,
                        plainTextMatch.description,
                        'plain-text',
                        plainTextMatch.labelOverride
                    );
                }
                break;
            }

            case 'dropdown-with-terms': {
                const termParams = this.getTermFilterParamsForFilter(filter);
                const matchedTerms = this.getMatchedTerms(obj, labelText, termParams);
                const enumNames = this.getEnumNames(obj);

                if (matchedTerms.length > 0 && (!termParams.extractEnumNames || enumNames.length > 0)) {
                    matchedTerms.forEach((term) => runtimeContext.matchedTerms.add(term));
                    this.addFoundComponent(
                        foundComponents,
                        obj,
                        currentPath,
                        `Dropdown detectado por términos: ${matchedTerms.join(', ')}`,
                        'drop-down',
                        undefined,
                        enumNames.length > 0 ? enumNames : undefined
                    );
                }
                break;
            }

            case 'fields-by-terms': {
                const termParams = this.getTermFilterParamsForFilter(filter);
                const matchedTerms = this.getMatchedTerms(obj, labelText, termParams);

                if (matchedTerms.length > 0) {
                    matchedTerms.forEach((term) => runtimeContext.matchedTerms.add(term));
                    this.addFoundComponent(foundComponents, obj, currentPath, `Campo detectado por términos: ${matchedTerms.join(', ')}`, 'CAMPO_POR_TERMINOS');
                }
                break;
            }

            case 'signature': {
                const signatureMatch = this.getSignatureDescriptor(obj, labelText);

                if (signatureMatch) {
                    this.addFoundComponent(
                        foundComponents,
                        obj,
                        signatureMatch.pathSuffix ? `${currentPath}${signatureMatch.pathSuffix}` : currentPath,
                        signatureMatch.description,
                        'SIGNATURE',
                        signatureMatch.labelOverride
                    );
                }
                break;
            }

            case 'tooltip': {
                const possibleTooltip = obj?.tooltip
                    || obj?.helpMessage
                    || obj?.tooltipMessage
                    || obj?.shortDescription
                    || (obj?.properties && obj.properties['fd:tooltip'])
                    || (obj?.description && String(obj.description).includes('tooltip') ? obj.description : null);
                if (possibleTooltip) {
                    this.addFoundComponent(foundComponents, obj, currentPath, `Tooltip detectado en ${typeLower || 'componente'}`, 'TOOLTIP');
                }
                break;
            }

            case 'buttons-by-terms': {
                const termParams = this.getTermFilterParamsForFilter(filter);
                const matchedTerms = this.getMatchedTerms(obj, labelText, termParams);
                const isButtonLike = typeLower === 'button'
                    || this.getNodeTypeTokens(obj).some((token) => token.includes('/actions/'))
                    || keyLower.includes('boton')
                    || keyLower.includes('btn');

                if (isButtonLike && matchedTerms.length > 0) {
                    matchedTerms.forEach((term) => runtimeContext.matchedTerms.add(term));
                    this.addFoundComponent(foundComponents, obj, currentPath, `Botón detectado por términos: ${matchedTerms.join(', ')}`, 'BOTON_ESPECIAL');
                }
                break;
            }

            case 'panel-non-accordion': {
                if (typeLower === 'panel' && !this.normalizeText(obj?.name).includes('accordion')) {
                    this.addFoundComponent(foundComponents, obj, currentPath, 'Panel (No accordion)', 'PANEL');
                }
                break;
            }

            case 'flags-by-keys': {
                const flagParams = this.parseFlagFilterParams(params);
                for (const key in obj) {
                    const normalizedKey = this.normalizeText(key).replace(/_/g, '');
                    if (flagParams.keys.includes(normalizedKey)) {
                        runtimeContext.matchedFlags.add(normalizedKey);
                        this.addFoundComponent(foundComponents, obj, `${currentPath}.${key}`, `Flag especial: ${key}=${obj[key]}`, 'FLAG', String(obj[key] ?? 'N/A'));
                    }
                }
                break;
            }

            case 'checkbox-group': {
                const checkboxParams = this.parseCheckboxGroupParams(params);
                const isCheckboxLike = this.getNodeTypeTokens(obj).some((token) => token.includes('checkbox'));
                const optionCount = this.getCheckboxOptionCount(obj);
                if (isCheckboxLike && optionCount >= checkboxParams.minOptions) {
                    this.addFoundComponent(foundComponents, obj, currentPath, `Grupo de checkboxs con ${optionCount} opciones`, 'CHECKBOX_GROUP');
                }
                break;
            }

            case 'fieldtype-search': {
                const fieldTypeParams = this.parseFieldTypeSearchParams(params);
                const canonicalFieldType = this.getCanonicalFieldType(obj);

                if (canonicalFieldType) {
                    const matches = fieldTypeParams.fieldTypes.some((ft) => {
                        const normalizedFt = this.normalizeText(ft);
                        return canonicalFieldType === normalizedFt
                            || canonicalFieldType.includes(normalizedFt)
                            || normalizedFt.includes(canonicalFieldType);
                    });

                    if (matches) {
                        const count = (runtimeContext.matchedFieldTypes.get(canonicalFieldType) || 0) + 1;
                        runtimeContext.matchedFieldTypes.set(canonicalFieldType, count);
                        this.addFoundComponent(
                            foundComponents,
                            { ...obj, fieldType: canonicalFieldType, type: canonicalFieldType },
                            currentPath,
                            `Componente de tipo: ${canonicalFieldType}`,
                            canonicalFieldType
                        );
                    }
                }
                break;
            }

            case 'all-fieldtypes-summary': {
                // Este motor no filtra por coincidencia puntual; permite incluir todos los formularios.
                break;
            }
        }

        // Seguir explorando recursivamente (por ejemplo, buscar components interno)
        for (const property in obj) {
            this.walkAndFilter(obj[property], `${currentPath}.${property}`, foundComponents, filter, runtimeContext);
        }
    }

    private shouldIncludeForm(filter: FilterRequest, runtimeContext: RuntimeContext, foundComponents: ComponenteEncontrado[]): boolean {
        if (this.isTermBasedFilterType(filter.type)) {
            const termParams = this.getSummaryTermFilterParams(filter);
            if (termParams.mode === 'all') {
                return termParams.terms.length > 0 && termParams.terms.every((term) => runtimeContext.matchedTerms.has(term));
            }
            return foundComponents.length > 0;
        }

        const params = filter.params || {};

        switch (filter.type) {
            case 'flags-by-keys': {
                const flagParams = this.parseFlagFilterParams(params);
                if (flagParams.mode === 'all') {
                    return flagParams.keys.length > 0 && flagParams.keys.every((key) => runtimeContext.matchedFlags.has(key));
                }
                return foundComponents.length > 0;
            }
            case 'fieldtype-search': {
                const fieldTypeParams = this.parseFieldTypeSearchParams(params);
                if (fieldTypeParams.mode === 'all') {
                    return fieldTypeParams.fieldTypes.length > 0 && fieldTypeParams.fieldTypes.every((ft) => runtimeContext.matchedFieldTypes.has(ft));
                }
                return runtimeContext.matchedFieldTypes.size > 0;
            }
            case 'all-fieldtypes-summary':
                return true;
            default:
                return foundComponents.length > 0;
        }
    }

    private describeAppliedFilter(filter: FilterRequest): { tipo: string; valor: string } {
        if (this.isTermBasedFilterType(filter.type)) {
            const termParams = this.getSummaryTermFilterParams(filter);
            return {
                tipo: filter.label || filter.type,
                valor: `${termParams.mode === 'all' ? 'todos' : 'cualquiera'}: ${termParams.terms.join(', ')}`
            };
        }

        const params = filter.params || {};

        switch (filter.type) {
            case 'flags-by-keys': {
                const flagParams = this.parseFlagFilterParams(params);
                return {
                    tipo: filter.label || filter.type,
                    valor: `${flagParams.mode === 'all' ? 'todas' : 'cualquiera'}: ${flagParams.keys.join(', ')}`
                };
            }
            case 'checkbox-group': {
                const checkboxParams = this.parseCheckboxGroupParams(params);
                return {
                    tipo: filter.label || filter.type,
                    valor: `mínimo ${checkboxParams.minOptions} opciones`
                };
            }
            case 'fieldtype-search': {
                const fieldTypeParams = this.parseFieldTypeSearchParams(params);
                return {
                    tipo: filter.label || filter.type,
                    valor: `${fieldTypeParams.mode === 'all' ? 'todos' : 'cualquiera'}: ${fieldTypeParams.fieldTypes.join(', ')}`
                };
            }
            case 'all-fieldtypes-summary': {
                return {
                    tipo: filter.label || filter.type,
                    valor: 'sin filtro por términos; resume todos los fieldType del universo procesado'
                };
            }
            default:
                return {
                    tipo: filter.label || filter.type,
                    valor: 'preset sin parámetros adicionales'
                };
        }
    }

    public async processUrls(options: ProcessingOptions): Promise<InformeGeneral> {
        // Limpiamos las URLs de posibles comillas, espacios y descartamos vacías
        const cleanUrls = options.formUrls
            .map(u => typeof u === 'string' ? u.replace(/['"]/g, '').trim() : '')
            .filter(u => u !== '');
        const uniqueUrls = [...new Set(cleanUrls)];
        const total = uniqueUrls.length;
        
        const info: InformeGeneral = {
            fechaEjecucion: new Date().toISOString(),
            totalUrls: total,
            procesadosExitosamente: 0,
            conErrores: 0,
            filtrosAplicados: [],
            formulariosDetalle: [],
            errores: []
        };

        info.filtrosAplicados.push(this.describeAppliedFilter(options.filter));

        const fetchResults = await Promise.all(uniqueUrls.map((url, index) => this.goFetchUrl(url, index, total)));

        const shouldIncludeFieldTypeSummary = options.filter.type === 'all-fieldtypes-summary';
        const globalFieldTypeStats: Record<string, number> = {};

        for (const fetchResult of fetchResults) {

            if (fetchResult.error) {
                info.errores.push({ url: fetchResult.url, error: fetchResult.error });
                info.conErrores++;
                continue;
            }

            const data = fetchResult.data;

            if (shouldIncludeFieldTypeSummary) {
                const allFieldTypesInForm = this.countAllFieldTypes(data);
                Object.entries(allFieldTypesInForm.porTipo).forEach(([tipo, count]) => {
                    globalFieldTypeStats[tipo] = (globalFieldTypeStats[tipo] || 0) + count;
                });
            }

            const formTitle = data.title || data.name || "Formulario sin título";
            const foundComponents: ComponenteEncontrado[] = [];
            const extractedTipos: { key: string; label: string; enumNames: string[] }[] = [];

            const runtimeContext: RuntimeContext = {
                matchedTerms: new Set<string>(),
                matchedFlags: new Set<string>(),
                matchedFieldTypes: new Map<string, number>()
            };

            if (data.components) {
                this.walkAndFilter(data.components, 'root', foundComponents, options.filter, runtimeContext);
            } else {
                this.walkAndFilter(data, 'root', foundComponents, options.filter, runtimeContext);
            }

            if (this.shouldIncludeForm(options.filter, runtimeContext, foundComponents)) {
                foundComponents.forEach((component) => {
                    if (component.enumNames) {
                        extractedTipos.push({
                            key: component.key,
                            label: component.label,
                            enumNames: component.enumNames
                        });
                    }
                });

                const estadisticas = this.computeFieldTypeStatistics(foundComponents);
                const allFieldTypesStats = shouldIncludeFieldTypeSummary ? this.countAllFieldTypes(data) : undefined;
                const statsForCurrentFilter = shouldIncludeFieldTypeSummary ? allFieldTypesStats : estadisticas;

                const resultadoFormulario = this.buildFormResultByFilter(
                    options.filter.type,
                    {
                        url: fetchResult.url,
                        title: formTitle,
                        timestamp: new Date().toISOString()
                    },
                    foundComponents,
                    extractedTipos,
                    statsForCurrentFilter
                );

                info.formulariosDetalle.push(resultadoFormulario);
            }

            info.procesadosExitosamente++;
        }

        // Agregar estadísticas globales al informe
        if (shouldIncludeFieldTypeSummary && Object.keys(globalFieldTypeStats).length > 0) {
            info.estadisticasGlobalesFieldType = {
                porTipo: globalFieldTypeStats,
                total: Object.values(globalFieldTypeStats).reduce((sum, count) => sum + count, 0)
            };
        }

        return info;
    }
}
