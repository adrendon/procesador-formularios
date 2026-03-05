import axios from 'axios';
import fs from 'fs/promises';

// Tipos para estructurar nuestra información
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
    sourcePath: string; // Ruta de la propiedad
    enumNames?: string[]; // Específico para el nuevo requerimiento
}

interface ResultadoFormulario {
    url: string;
    title: string;
    timestamp: string;
    componentesEncontrados: ComponenteEncontrado[];
    tipoDocumentos: { key: string; label: string; enumNames: string[] }[]; // Extraido directamente
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
}

export interface ProcessingOptions {
    formUrls: string[];
    filters: {
        searchPlaintext?: boolean;
        searchTiposDocumento?: boolean;
        searchGeo?: boolean;
        searchSignature?: boolean;
        searchTooltip?: boolean;
        searchBotones?: boolean;
        searchPanels?: boolean;
        searchNombresClave?: boolean;
        searchFlags?: boolean;
    };
}

export class ProcesadorFormularios {
    private jsonCache: Map<string, any> = new Map();

    private async goFetchUrl(url: string, index: number, total: number): Promise<any> {
        try {
            console.log(`[${index + 1}/${total}] Procesando: ${url}`);
            
            if (this.jsonCache.has(url)) {
                 return { url, data: this.jsonCache.get(url), cached: true };
            }

            const response = await axios.get(url, {
                timeout: 10000,
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
        options: ProcessingOptions
    ) {
        if (typeof obj !== 'object' || obj === null) return;
        
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                this.walkAndFilter(item, `${currentPath}[${index}]`, foundComponents, options);
            });
            return;
        }

        // Buscar textfield o panel content para "searchPlaintext" (el código original de flags)
        if (options.filters.searchPlaintext) {
             const keyToSearch = String(obj.key || obj.name || "").toLowerCase();
             const typeToSearch = String(obj.type || obj.fieldType || "").toLowerCase();

             // match clásico de form.io
             const isOldMatch = (obj.type === 'textfield' || obj.type === 'htmlelement' || obj.type === 'panel') && 
                                (keyToSearch.includes('plaintext') || keyToSearch.includes('plain-text') || keyToSearch.includes('html'));

             // match de AEM adaptive forms
             const isAemMatch = typeToSearch === 'plain-text' || 
                                (obj[':type'] && String(obj[':type']).includes('/text') && typeToSearch !== 'text-input');

             if (isOldMatch || isAemMatch) {
                 if (obj.customClass?.includes('d-none')) {
                     // ignore d-none
                 } else {
                     foundComponents.push({
                            key: obj.key || obj.name || 'N/A',
                            label: obj.label?.value || obj.label || 'N/A',
                            type: obj.type || obj.fieldType || 'plain-text',
                            description: obj.description || 'Plain Text/HTML detectado',
                            sourcePath: currentPath
                        });
                 }
             }
        }

        // Requerimiento nuevo: Componentes desplegables de "Tipo de documento" 
        const typeLower = String(obj.fieldType || obj.type || "").toLowerCase();
        const keyLower = String(obj.key || obj.name || "").toLowerCase();
        
        // Manejar obj.label de forma segura (puede ser string o un objeto con prop 'value')
        let rawLabel = "";
        if (obj.label && typeof obj.label === 'object') {
            rawLabel = obj.label.value || JSON.stringify(obj.label);
        } else if (obj.label !== undefined && obj.label !== null) {
            rawLabel = String(obj.label);
        }
        const labelLower = rawLabel.toLowerCase();

        if (options.filters.searchTiposDocumento) {
            const isDropdown = obj.type === 'select' || obj.type === 'dropdown' || obj.fieldType === 'drop-down';
            
            const matchName = keyLower.includes('documento') || keyLower.includes('identificacion') || keyLower.includes('tipo_doc') || keyLower.includes('tipodoc') || keyLower.includes('tipo_identificacion');
            const matchLabel = labelLower.includes('documento') || labelLower.includes('identificacion') || labelLower.includes('tipo de documento');

            if (isDropdown && (matchName || matchLabel)) {
                let enumNames: string[] = [];
                if (Array.isArray(obj.enumNames)) {
                    enumNames = obj.enumNames;
                } else if (obj.data && Array.isArray(obj.data.values)) {
                    enumNames = obj.data.values.map((v: any) => v.label || v.value);
                }

                if (enumNames.length > 0) {
                    foundComponents.push({
                        key: obj.key || obj.name || 'N/A',
                        label: obj.label?.value || obj.label || 'N/A',
                        type: obj.fieldType || obj.type || 'drop-down',
                        description: 'Dropdown Tipo de Documento',
                        sourcePath: currentPath,
                        enumNames: enumNames
                    });
                }
            }
        }

        // Check searchGeo
        if (options.filters.searchGeo && (typeLower === 'select' || typeLower === 'radio' || typeLower === 'dropdown' || typeLower === 'drop-down' || typeLower === 'text-input' || typeLower === 'string')) {
             if (keyLower.includes('pais') || keyLower.includes('país') || labelLower.includes('pais') || labelLower.includes('país') ||
                 keyLower.includes('departa') || labelLower.includes('departa') ||
                 keyLower.includes('estado') || labelLower.includes('estado') ||
                 keyLower.includes('municipio') || labelLower.includes('municipio') ||
                 keyLower.includes('ciudad') || labelLower.includes('ciudad')) {
                 foundComponents.push({ key: obj.key || obj.name || 'N/A', label: obj.label?.value || obj.label || 'N/A', type: obj.type || obj.fieldType || 'GEO_DROPDOWN', description: 'Campo Geo (País/Depto/Ciudad)', sourcePath: currentPath });
             }
        }

        // Check signature
        if (options.filters.searchSignature && ((obj.signature && String(obj.signature).toLowerCase() === 'yes') || typeLower === 'signature')) {
             foundComponents.push({ key: obj.key || obj.name || 'signature', label: obj.label?.value || obj.label || 'N/A', type: obj.type || obj.fieldType || 'SIGNATURE', description: 'Tiene signature: yes', sourcePath: currentPath });
        }

        // Check tooltip
        const possibleTooltip = obj.tooltip || obj.helpMessage || obj.tooltipMessage || obj.shortDescription || (obj.properties && obj.properties['fd:tooltip']) || (obj.description && String(obj.description).includes('tooltip') ? obj.description : null);
        if (options.filters.searchTooltip && possibleTooltip) {
             foundComponents.push({ key: obj.key || obj.name || 'N/A', label: obj.label?.value || obj.label || 'N/A', type: obj.type || obj.fieldType || 'TOOLTIP', description: `Tooltip detectado en ${typeLower}`, sourcePath: currentPath });
        }

        // Check botones descarga
        if (options.filters.searchBotones && (typeLower === 'button' || obj.type === 'button' || obj.fieldType === 'button' || (obj[':type'] && String(obj[':type']).includes('/actions/')) || keyLower.includes('botón') || keyLower.includes('boton') || keyLower.includes('btn'))) {
             const vDirect = String(obj.value || obj.name || obj.key || "").toLowerCase();
             if (vDirect.includes('descarg') || vDirect.includes('previsualiz') || labelLower.includes('descarg') || labelLower.includes('previsualiz') || vDirect.includes('download')) {
                 foundComponents.push({ key: obj.key || obj.name || 'N/A', label: obj.label?.value || obj.label || obj.value || 'N/A', type: obj.type || obj.fieldType || 'BOTON_ESPECIAL', description: 'Botón Descarga/Previsualizar', sourcePath: currentPath });
             }
        }

        // Check panels no accordion
        if (options.filters.searchPanels && typeLower === 'panel' && !String(obj.name || "").toLowerCase().includes('accordion')) {
             foundComponents.push({ key: obj.key || obj.name || 'N/A', label: obj.label?.value || obj.label || 'N/A', type: obj.type || obj.fieldType || 'PANEL', description: 'Panel (No accordion)', sourcePath: currentPath });
        }

        // Check Nombres Clave
        if (options.filters.searchNombresClave) {
             const claves = ['tipo_documento','no_identificacion','nombre','primer_nombre','segundo_nombre','primer_apellido','segundo_apellido'];
             if (claves.some(c => keyLower.includes(c))) {
                 foundComponents.push({ key: obj.key || obj.name || 'N/A', label: obj.label?.value || obj.label || 'N/A', type: obj.type || 'NOMBRE_CLAVE', description: 'Nombre Clave Detectado', sourcePath: currentPath });
             }
        }

        // Check Flags Especiales en las claves
        if (options.filters.searchFlags) {
             const flags = ['signature', 'signaturetype', 'autentificacion', 'precarga', 'pdfadjunto', 'tipofirmaelectronica'];
             // Buscar en cualquier llave las keys relacionadas
             for (const k in obj) {
                 const lowk = k.toLowerCase().replace(/_/g, '');
                 if (flags.includes(lowk)) {
                     foundComponents.push({ key: k, label: obj[k] ? String(obj[k]) : 'N/A', type: 'FLAG', description: `Flag especial: ${k}=${obj[k]}`, sourcePath: currentPath });
                 }
             }
        }

        // Seguir explorando recursivamente (por ejemplo, buscar components interno)
        for (const property in obj) {
            this.walkAndFilter(obj[property], `${currentPath}.${property}`, foundComponents, options);
        }
    }

    public async processUrls(options: ProcessingOptions): Promise<InformeGeneral> {
        const uniqueUrls = [...new Set(options.formUrls)].filter(u => typeof u === 'string' && u.trim() !== "");
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
        
        if (options.filters.searchPlaintext) {
             info.filtrosAplicados.push({ tipo: "Búsqueda de Campo", valor: "plainText o HTML" });
        }
        if (options.filters.searchTiposDocumento) {
             info.filtrosAplicados.push({ tipo: "Extracción", valor: "Tipos de Documento (enumNames)" });
        }

        for (let i = 0; i < total; i++) {
            const currentUrl = uniqueUrls[i];
            const fetchResult = await this.goFetchUrl(currentUrl, i, total);

            if (fetchResult.error) {
                info.errores.push({ url: currentUrl, error: fetchResult.error });
                info.conErrores++;
                continue;
            }

            const data = fetchResult.data;
            const formTitle = data.title || data.name || "Formulario sin título";
            const foundComponents: ComponenteEncontrado[] = [];
            
            // Si el objeto principal tiene properties / components
            if (data.components) {
                this.walkAndFilter(data.components, 'root', foundComponents, options);
            } else {
                this.walkAndFilter(data, 'root', foundComponents, options);
            }

            if (foundComponents.length > 0) {
                // Separar los que son especificos de documento si se pidio
                const extractedTipos: any[] = [];
                if (options.filters.searchTiposDocumento) {
                    foundComponents.forEach(c => {
                        if (c.enumNames) {
                            extractedTipos.push({
                                key: c.key,
                                label: c.label,
                                enumNames: c.enumNames
                            });
                        }
                    });
                }
                
                info.formulariosDetalle.push({
                    url: currentUrl,
                    title: formTitle,
                    timestamp: new Date().toISOString(),
                    componentesEncontrados: foundComponents,
                    tipoDocumentos: extractedTipos
                });
            }

            info.procesadosExitosamente++;
        }

        return info;
    }
}
