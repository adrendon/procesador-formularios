import './style.css';

type FilterType =
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

type FilterUiKind = 'none' | 'term-list' | 'checkbox-group';

type FilterPreset = {
    id: string;
    label: string;
    help: string;
    type: FilterType;
    ui: FilterUiKind;
    defaultTerms?: string[];
    defaultMode?: 'all' | 'any';
    termsLabel?: string;
    termsPlaceholder?: string;
    minOptionsDefault?: number;
    params?: Record<string, unknown>;
};

type FilterRequest = {
    presetId: string;
    type: FilterType;
    label: string;
    params: Record<string, unknown>;
};

const FILTER_PRESETS: FilterPreset[] = [
    {
        id: 'tipos-documento',
        label: 'Listas desplegables por términos',
        help: 'Úsalo para combos o dropdowns. Ejemplos: tipo de documento, tipo de producto, tipo de identificación.',
        type: 'dropdown-with-terms',
        ui: 'term-list',
        defaultTerms: ['documento', 'identificacion', 'tipo_doc', 'tipodoc', 'tipo_identificacion'],
        defaultMode: 'any',
        termsLabel: 'Términos para dropdowns',
        termsPlaceholder: 'documento\nidentificacion\ntipo_doc\ntipo_producto',
        params: {
            componentTypes: ['select', 'dropdown', 'drop-down'],
            targets: ['key', 'name', 'label'],
            extractEnumNames: true
        }
    },
    {
        id: 'plain-text',
        label: 'Bloques de texto / HTML',
        help: 'Busca plain-text, HTML embebido y bloques informativos equivalentes en AEM u otros esquemas.',
        type: 'plain-text',
        ui: 'none'
    },
    {
        id: 'fields-by-terms',
        label: 'Campos por términos',
        help: 'Motor genérico para buscar campos por texto. Ejemplos: país, ciudad, tipo_documento, actividad económica, código ciiu, profesión.',
        type: 'fields-by-terms',
        ui: 'term-list',
        defaultTerms: ['país', 'ciudad', 'tipo_documento', 'actividad económica', 'código ciiu', 'profesión'],
        defaultMode: 'any',
        termsLabel: 'Términos a buscar',
        termsPlaceholder: 'pais\nciudad\ntipo_documento\nactividad económica\ncódigo ciiu\nprofesion',
        params: {
            targets: ['key', 'name', 'label', 'placeholder', 'description', 'title', 'value']
        }
    },
    {
        id: 'signature',
        label: 'Campos de firma',
        help: 'Busca componentes o flags relacionados con signature y captura de firma.',
        type: 'signature',
        ui: 'none'
    },
    {
        id: 'tooltip',
        label: 'Tooltips y ayudas',
        help: 'Busca tooltip, helpMessage, tooltipMessage, shortDescription y ayudas equivalentes.',
        type: 'tooltip',
        ui: 'none'
    },
    {
        id: 'buttons-by-terms',
        label: 'Botones por texto o clave',
        help: 'Busca botones por términos. Ejemplos: descargar, previsualizar, enviar, continuar, download.',
        type: 'buttons-by-terms',
        ui: 'term-list',
        defaultTerms: ['descarg', 'previsualiz', 'download'],
        defaultMode: 'any',
        termsLabel: 'Términos para botones',
        termsPlaceholder: 'descarg\nprevisualiz\nenviar\ncontinuar',
        params: {
            targets: ['value', 'key', 'name', 'label']
        }
    },
    {
        id: 'panels',
        label: 'Paneles sin accordion',
        help: 'Encuentra paneles y excluye los que tengan naming o estructura de accordion.',
        type: 'panel-non-accordion',
        ui: 'none'
    },
    {
        id: 'nombres-clave',
        label: 'Flags técnicas por clave',
        help: 'Busca claves técnicas dentro del JSON. Ejemplos: signatureType, precarga, pdfAdjunto, tipoFirmaElectronica.',
        type: 'flags-by-keys',
        ui: 'term-list',
        defaultTerms: ['signature', 'signaturetype', 'autentificacion', 'precarga', 'pdfadjunto', 'tipofirmaelectronica'],
        defaultMode: 'any',
        termsLabel: 'Claves o flags a buscar',
        termsPlaceholder: 'signature\nsignaturetype\nprecarga\npdfadjunto'
    },
    {
        id: 'checkbox-groups',
        label: 'Grupos de checkbox',
        help: 'Busca formularios con grupos de checkbox y permite ajustar el mínimo de opciones requeridas.',
        type: 'checkbox-group',
        ui: 'checkbox-group',
        minOptionsDefault: 3
    },
    {
        id: 'fieldtype-search',
        label: 'Buscar por fieldType específico',
        help: 'Busca formularios que contengan campos de un tipo específico. Ejemplos: text, email, checkbox, select, date, number.',
        type: 'fieldtype-search',
        ui: 'term-list',
        defaultTerms: ['text', 'email', 'checkbox', 'select', 'radio', 'date', 'number', 'password', 'textarea', 'dropdown', 'button', 'submit', 'input', 'textfield', 'signature', 'plaintext', 'richtext', 'html', 'panel'],
        defaultMode: 'any',
        termsLabel: 'Tipos de field a buscar',
        termsPlaceholder: 'text\nemail\ncheckbox\nselect\nradio\ndate\nnumber\npassword\ntextarea\ndropdown\nbutton\nsubmit\ninput\nsignature\npanel',
        params: {
            extractCounts: true
        }
    },
    {
        id: 'all-fieldtypes-summary',
        label: 'Resumen total de fieldTypes (sin filtro)',
        help: 'No filtra formularios: genera el inventario completo de fieldTypes y cantidades sobre todas las URLs procesadas.',
        type: 'all-fieldtypes-summary',
        ui: 'none'
    }
];

function getFilterPreset(presetId: string): FilterPreset | undefined {
    return FILTER_PRESETS.find((preset) => preset.id === presetId);
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gray-50 flex flex-col py-10">
    <div class="max-w-4xl w-full mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Procesador de Formularios</h1>
      
      <div class="mb-6 relative">
        <label for="urlsInput" class="block text-sm font-medium text-gray-700 mb-2">
          URLs a procesar (Pega las URLs de los formularios JSON)
        </label>
        <div class="absolute top-0 right-0 flex space-x-2">
            <button 
            id="btnPreloadUrls" 
            class="px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs font-medium rounded shadow-sm border border-indigo-200 transition-colors"
            >
            ⚡ Precargar urls.txt
            </button>
            <button 
            id="btnLoadFile" 
            class="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs font-medium rounded shadow-sm border border-gray-300 transition-colors"
            >
            📂 Cargar archivo TXT
            </button>
        </div>
        <input type="file" id="fileInput" accept=".txt" class="hidden" />
        
        <textarea 
          id="urlsInput" 
          rows="8" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="https://formulariosdigitales.bancolombia.com/form1.json\nhttps://formulariosdigitales.bancolombia.com/form2.json"
        ></textarea>
        <p class="mt-1 text-sm text-gray-500">Puedes pegar múltiples URLs separadas por salto de línea.</p>
      </div>

      <div class="mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 class="text-lg font-medium text-gray-700 mb-3">Opciones de Filtrado</h3>

        <div class="grid grid-cols-1 gap-4">
          <div>
                        <label for="filterSelect" class="block text-sm font-medium text-gray-700 mb-2">Motor de filtro</label>
                        <select id="filterSelect" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                            <option value="">Selecciona una opción</option>
                            ${FILTER_PRESETS.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join('')}
                        </select>
                        <p id="filterHelpText" class="mt-2 text-sm text-gray-500">Selecciona un motor único y usa los ejemplos como guía.</p>
          </div>

          <div id="filterArgumentsContainer" class="hidden bg-white border border-gray-200 rounded-md p-4">
                        <div id="termListGroup" class="hidden">
                            <label id="termListLabel" for="termListInput" class="block text-sm font-medium text-gray-700 mb-2">Términos o campos a buscar</label>
                            <textarea id="termListInput" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" placeholder="actividad económica\ncódigo ciiu\nprofesion"></textarea>
              <div class="mt-3">
                                <label for="termListMode" class="block text-sm font-medium text-gray-700 mb-2">Condición de coincidencia</label>
                                <select id="termListMode" class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="all">El formulario debe tener todos los términos</option>
                  <option value="any">El formulario puede tener al menos uno</option>
                </select>
              </div>
            </div>

            <div id="checkboxGroupConfig" class="hidden">
              <label for="checkboxGroupMinInput" class="block text-sm font-medium text-gray-700 mb-2">Cantidad mínima de opciones en el grupo de checkboxs</label>
              <input id="checkboxGroupMinInput" type="number" min="2" value="3" class="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
              <p class="mt-2 text-sm text-gray-500">Ejemplo: usa 3 para encontrar grupos con tres o más checkboxs.</p>
            </div>
          </div>

        </div>
      </div>

      <div class="flex items-center space-x-4 mb-8">
        <button 
          id="btnProcess" 
          class="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm leading-tight rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Procesar URLs
        </button>
        <div id="loadingIndicator" class="hidden items-center text-blue-600 text-sm font-medium">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Procesando... (<span id="progressText">0/0</span>)
        </div>
      </div>

      <div id="realTimeLogs" class="hidden mb-6 bg-gray-900 rounded-lg p-4 shadow-inner max-h-48 overflow-y-auto font-mono text-sm">
         <ul id="logsList" class="space-y-1"></ul>
      </div>

      <div id="resultsContainer" class="hidden">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Resultados</h2>
        
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <span class="block text-sm text-blue-600 font-medium">Total URLs</span>
            <span id="statTotal" class="block text-2xl font-bold text-blue-900 mt-1">-</span>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <span class="block text-sm text-green-600 font-medium">Leídos OK</span>
            <span id="statOk" class="block text-2xl font-bold text-green-900 mt-1">-</span>
          </div>
                    <div class="bg-amber-50 p-4 rounded-lg border border-amber-100 text-center">
                        <span class="block text-sm text-amber-700 font-medium">Filtrados</span>
                        <span id="statFiltered" class="block text-2xl font-bold text-amber-900 mt-1">-</span>
                    </div>
          <div class="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            <span class="block text-sm text-red-600 font-medium">Errores</span>
            <span id="statError" class="block text-2xl font-bold text-red-900 mt-1">-</span>
          </div>
        </div>

        <div id="downloadActions" class="flex flex-wrap gap-3 mb-6">
          <button id="btnDownloadJson" class="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700 transition shadow-sm">
            📄 Descargar JSON
          </button>
          <button id="btnDownloadTxt" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition shadow-sm">
            🔗 Descargar URLs (TXT)
          </button>
          <button id="btnDownloadCsv" class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition shadow-sm">
            📊 Descargar CSV Mapeado
          </button>
                    <button id="btnDownloadCsvDetailed" class="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded hover:bg-teal-600 transition shadow-sm">
                        🧾 Descargar CSV Detallado
                    </button>
        </div>

        <!-- Estadísticas globales de fieldType -->
        <div id="fieldTypeStatsContainer" class="hidden bg-gray-900 rounded-lg p-4 mb-6 shadow-inner">
          <div class="mb-4 flex justify-between items-center text-gray-400 text-xs border-b border-gray-700 pb-2">
            <span class="font-semibold uppercase tracking-wider">ESTADÍSTICAS POR TIPO</span>
          </div>
          <div id="fieldTypeStatsList" class="space-y-3">
            <!-- Estadísticas inyectadas dinámicamente -->
          </div>
        </div>

        <!-- Previsualizador de Formularios / URLs -->
        <div class="bg-gray-900 rounded-lg p-4 mb-6 shadow-inner">
          <div class="mb-2 flex justify-between items-center text-gray-400 text-xs border-b border-gray-700 pb-2">
            <span class="font-semibold uppercase tracking-wider">VISUALIZADOR DE URLs PROCESADAS</span>
                        <div class="flex items-center gap-3">
                            <div id="summarySortContainer" class="hidden items-center gap-2">
                                <label for="summarySortSelect" class="text-[11px] text-gray-400">Orden</label>
                                <select id="summarySortSelect" class="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="desc">Mayor a menor</option>
                                    <option value="asc">Menor a mayor</option>
                                </select>
                            </div>
                            <span id="formsCount" class="font-bold text-gray-300">0</span>
                        </div>
          </div>
          <div class="max-h-80 overflow-y-auto w-full">
            <table class="w-full text-left text-gray-300 text-xs">
                <thead id="formsTableHead" class="text-gray-400 uppercase bg-gray-800 sticky top-0 bg-opacity-90 backdrop-blur">
                </thead>
                <tbody id="formsTableBody" class="divide-y divide-gray-700">
                    <!-- Formularios inyectados dinámicamente -->
                </tbody>
            </table>
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg p-4 mb-6 shadow-inner">
          <div class="mb-2 flex justify-between items-center text-gray-400 text-xs">
            <span class="font-semibold uppercase tracking-wider">PREVISUALIZADOR JSON COMPLETO</span>
          </div>
          <pre id="jsonPreview" class="text-green-400 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto w-full whitespace-pre-wrap word-break"></pre>
        </div>

        <!-- Sección de Errores -->
        <div id="errorsContainer" class="hidden mb-6">
            <h3 class="text-lg font-bold text-red-700 mb-3 border-b border-red-200 pb-2">Reporte de Errores (<span id="errorCountHeader">0</span>)</h3>
            <div class="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                <table class="w-full text-sm text-left">
                    <thead class="bg-red-100 text-red-800 font-medium">
                        <tr>
                            <th class="px-4 py-3 border-b border-red-200 w-1/2">URL Fallida</th>
                            <th class="px-4 py-3 border-b border-red-200 w-1/2">Causa del Error / Status</th>
                        </tr>
                    </thead>
                    <tbody id="errorsTableBody" class="divide-y divide-red-100 text-red-900 bg-white">
                        <!-- Errores inyectados dinámicamente -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Sección de URLs Repetidas -->
        <div id="duplicatesContainer" class="hidden">
            <h3 class="text-lg font-bold text-yellow-700 mb-3 border-b border-yellow-200 pb-2">URLs Repetidas (Omitidas del proceso) (<span id="duplicateCountHeader">0</span>)</h3>
            <div class="bg-yellow-50 rounded-lg border border-yellow-200 overflow-hidden">
                <table class="w-full text-sm text-left">
                    <thead class="bg-yellow-100 text-yellow-800 font-medium">
                        <tr>
                            <th class="px-4 py-3 border-b border-yellow-200 w-3/4">URL</th>
                            <th class="px-4 py-3 border-b border-yellow-200 w-1/4">Líneas</th>
                        </tr>
                    </thead>
                    <tbody id="duplicatesTableBody" class="divide-y divide-yellow-100 text-yellow-900 bg-white min-w-full">
                        <!-- Repetidas inyectadas dinámicamente -->
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  </div>
`;

// Logic
const btnProcess = document.getElementById('btnProcess') as HTMLButtonElement;
const urlsInput = document.getElementById('urlsInput') as HTMLTextAreaElement;

const filterSelect = document.getElementById('filterSelect') as HTMLSelectElement;
const filterHelpText = document.getElementById('filterHelpText') as HTMLParagraphElement;
const filterArgumentsContainer = document.getElementById('filterArgumentsContainer') as HTMLDivElement;
const termListGroup = document.getElementById('termListGroup') as HTMLDivElement;
const termListLabel = document.getElementById('termListLabel') as HTMLLabelElement;
const termListInput = document.getElementById('termListInput') as HTMLTextAreaElement;
const termListMode = document.getElementById('termListMode') as HTMLSelectElement;
const checkboxGroupConfig = document.getElementById('checkboxGroupConfig') as HTMLDivElement;
const checkboxGroupMinInput = document.getElementById('checkboxGroupMinInput') as HTMLInputElement;

const progressText = document.getElementById('progressText') as HTMLSpanElement;
const realTimeLogs = document.getElementById('realTimeLogs') as HTMLDivElement;
const logsList = document.getElementById('logsList') as HTMLUListElement;
const loadingIndicator = document.getElementById('loadingIndicator') as HTMLDivElement;
const resultsContainer = document.getElementById('resultsContainer') as HTMLDivElement;
const jsonPreview = document.getElementById('jsonPreview') as HTMLPreElement;const formsCount = document.getElementById('formsCount') as HTMLSpanElement;
const formsTableHead = document.getElementById('formsTableHead') as HTMLTableSectionElement;
const formsTableBody = document.getElementById('formsTableBody') as HTMLTableSectionElement;
const summarySortContainer = document.getElementById('summarySortContainer') as HTMLDivElement;
const summarySortSelect = document.getElementById('summarySortSelect') as HTMLSelectElement;
const fieldTypeStatsContainer = document.getElementById('fieldTypeStatsContainer') as HTMLDivElement;
const fieldTypeStatsList = document.getElementById('fieldTypeStatsList') as HTMLDivElement;
const statTotal = document.getElementById('statTotal') as HTMLSpanElement;
const statOk = document.getElementById('statOk') as HTMLSpanElement;
const statFiltered = document.getElementById('statFiltered') as HTMLSpanElement;
const statError = document.getElementById('statError') as HTMLSpanElement;
const btnDownloadJson = document.getElementById('btnDownloadJson') as HTMLButtonElement;
const btnDownloadTxt = document.getElementById('btnDownloadTxt') as HTMLButtonElement;
const btnDownloadCsv = document.getElementById('btnDownloadCsv') as HTMLButtonElement;
const btnDownloadCsvDetailed = document.getElementById('btnDownloadCsvDetailed') as HTMLButtonElement;
const errorsContainer = document.getElementById('errorsContainer') as HTMLDivElement;
const errorCountHeader = document.getElementById('errorCountHeader') as HTMLSpanElement;
const errorsTableBody = document.getElementById('errorsTableBody') as HTMLTableSectionElement;

const btnPreloadUrls = document.getElementById('btnPreloadUrls') as HTMLButtonElement;
const btnLoadFile = document.getElementById('btnLoadFile') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const duplicatesContainer = document.getElementById('duplicatesContainer') as HTMLDivElement;
const duplicateCountHeader = document.getElementById('duplicateCountHeader') as HTMLSpanElement;
const duplicatesTableBody = document.getElementById('duplicatesTableBody') as HTMLTableSectionElement;

let currentResult: any = null;
let summarySortOrder: 'asc' | 'desc' = 'desc';

function sanitizeUnicodeSeparators(value: unknown): unknown {
    if (typeof value === 'string') {
        return value.replace(/[\u2028\u2029]/g, ' ');
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeUnicodeSeparators(item));
    }

    if (value && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
            result[key] = sanitizeUnicodeSeparators(val);
        });
        return result;
    }

    return value;
}

function getDetectedFieldTypes(): string[] {
    const stats = currentResult?.estadisticasGlobalesFieldType?.porTipo;
    if (!stats || typeof stats !== 'object') {
        return [];
    }

    return (Object.entries(stats) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .map(([tipo]) => tipo);
}

function buildRenderResult(data: any): any {
    return sanitizeUnicodeSeparators(data);
}

function buildExportResult(data: any): any {
    const safeData = sanitizeUnicodeSeparators(data) as any;

    const pruneValue = (value: any, key?: string): any => {
        if (Array.isArray(value)) {
            const nextArray = value.map((item) => pruneValue(item)).filter((item) => item !== undefined);
            return nextArray.length > 0 ? nextArray : undefined;
        }

        if (value && typeof value === 'object') {
            if (key === 'estadisticasAllFieldTypes' || key === 'componentesData' || key === 'filterMeta') {
                return undefined;
            }

            if ((key === 'estadisticasFieldType' || key === 'estadisticasGlobalesFieldType') && (!value.total || value.total <= 0)) {
                return undefined;
            }

            const nextObject: Record<string, unknown> = {};
            Object.entries(value).forEach(([childKey, childValue]) => {
                const prunedChild = pruneValue(childValue, childKey);
                if (prunedChild !== undefined) {
                    nextObject[childKey] = prunedChild;
                }
            });

            return Object.keys(nextObject).length > 0 ? nextObject : undefined;
        }

        return value;
    };

    return pruneValue(safeData) || {};
}

function escapeCsvCell(value: unknown): string {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getTypeBadgeClass(type: string): string {
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('button')) return 'bg-amber-500/20 text-amber-200 border border-amber-400/30';
    if (normalizedType.includes('checkbox') || normalizedType.includes('radio')) return 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30';
    if (normalizedType.includes('date') || normalizedType.includes('number')) return 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30';
    if (normalizedType.includes('tooltip') || normalizedType.includes('plain') || normalizedType.includes('html')) return 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30';
    if (normalizedType.includes('signature') || normalizedType.includes('flag')) return 'bg-rose-500/20 text-rose-200 border border-rose-400/30';
    return 'bg-blue-500/20 text-blue-200 border border-blue-400/30';
}

function getTypeBadgeHtml(type: unknown): string {
    const safeType = escapeHtml(type || 'sin-tipo');
    return `<span class="inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold ${getTypeBadgeClass(String(type || 'sin-tipo'))}">${safeType}</span>`;
}

function getExpandableMatchHtml(components?: Array<{ type?: string; description?: string; label?: string; sourcePath?: string }>): string {
    if (!Array.isArray(components) || components.length === 0) {
        return '<span class="text-gray-500">Sin detalle</span>';
    }

    const firstComponent = components[0];
    const summaryText = escapeHtml(formatFirstMatchSummary(components));
    const descriptionText = escapeHtml(firstComponent.description || 'Sin descripción');
    const labelText = escapeHtml(firstComponent.label || 'Sin label');
    const pathText = escapeHtml(firstComponent.sourcePath || 'Sin ruta');

    return `
        <details class="group">
            <summary class="cursor-pointer list-none text-sky-300 hover:text-sky-200 text-xs">${summaryText}</summary>
            <div class="mt-2 space-y-1 text-[11px] text-gray-300 bg-gray-800/70 rounded p-2 border border-gray-700">
                <div><span class="text-gray-400">Tipo:</span> ${getTypeBadgeHtml(firstComponent.type)}</div>
                <div><span class="text-gray-400">Label:</span> ${labelText}</div>
                <div><span class="text-gray-400">Descripción:</span> ${descriptionText}</div>
                <div><span class="text-gray-400">Ruta:</span> <span class="font-mono">${pathText}</span></div>
            </div>
        </details>
    `;
}

function formatTypeStatsSummary(stats?: { porTipo?: Record<string, number>; total?: number }): string {
    if (!stats?.porTipo) {
        return 'Sin datos';
    }

    const entries = Object.entries(stats.porTipo) as [string, number][];
    if (entries.length === 0) {
        return 'Sin datos';
    }

    return entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tipo, count]) => `${tipo}: ${count}`)
        .join(' | ');
}

function formatFirstMatchSummary(components?: Array<{ type?: string; description?: string; label?: string }>): string {
    if (!Array.isArray(components) || components.length === 0) {
        return 'Sin detalle';
    }

    const firstComponent = components[0];
    const typeLabel = firstComponent.type || 'sin-tipo';
    const detailLabel = firstComponent.label || firstComponent.description || '';
    const rawSummary = detailLabel ? `${typeLabel} | ${detailLabel}` : typeLabel;

    return rawSummary.length > 100 ? `${rawSummary.slice(0, 97)}...` : rawSummary;
}

function formatComponentTypesSummary(components?: Array<{ type?: string }>): string {
    if (!Array.isArray(components) || components.length === 0) {
        return 'Sin detalle';
    }

    const uniqueTypes = [...new Set(components.map((component) => component.type || 'sin-tipo'))];
    return uniqueTypes.slice(0, 4).join(' | ');
}

function formatFirstComponentPath(components?: Array<{ sourcePath?: string }>): string {
    if (!Array.isArray(components) || components.length === 0) {
        return 'Sin ruta';
    }

    const path = components[0]?.sourcePath || 'Sin ruta';
    return path.length > 80 ? `${path.slice(0, 77)}...` : path;
}

function updateSummarySortVisibility(filterType?: string): void {
    const shouldShow = filterType === 'all-fieldtypes-summary';
    summarySortContainer.classList.toggle('hidden', !shouldShow);
    summarySortContainer.classList.toggle('flex', shouldShow);
}

function renderResultsView(): void {
    if (!currentResult) {
        return;
    }

    const renderResult = buildRenderResult(currentResult) as any;
    const safeResult = buildExportResult(currentResult) as any;

    statTotal.textContent = currentResult.totalUrls.toString();
    statOk.textContent = currentResult.procesadosExitosamente.toString();
    statFiltered.textContent = (currentResult.formulariosDetalle?.length || 0).toString();
    statError.textContent = currentResult.conErrores.toString();

    resultsContainer.classList.remove('hidden');
    jsonPreview.textContent = JSON.stringify(safeResult, null, 2);

    updateSummarySortVisibility(renderResult.filterMeta?.type);
    renderFormsTable(renderResult);

    if (renderResult.filterMeta?.type === 'all-fieldtypes-summary' && renderResult.estadisticasGlobalesFieldType && renderResult.estadisticasGlobalesFieldType.porTipo) {
        const globalStats = renderResult.estadisticasGlobalesFieldType;
        fieldTypeStatsContainer.classList.remove('hidden');
        const statsEntries = (Object.entries(globalStats.porTipo) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([tipo, count]) => `
                <div class="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                    <span class="font-semibold text-gray-300">${tipo}</span>
                    <span class="px-3 py-1 bg-blue-600 text-white rounded font-bold text-sm">${count}</span>
                </div>
            `).join('');
        fieldTypeStatsList.innerHTML = `
            <div class="mb-4 p-3 bg-gray-700 rounded border border-gray-600">
                <span class="text-gray-300 font-semibold">Total de componentes: </span>
                <span class="text-white font-bold text-lg">${globalStats.total}</span>
            </div>
            ${statsEntries}
        `;
    } else {
        fieldTypeStatsContainer.classList.add('hidden');
    }
}

function renderFormsTable(result: any) {
    const forms = Array.isArray(result.formulariosDetalle) ? result.formulariosDetalle : [];
    const filterType = result.filterMeta?.type;

    if (forms.length === 0) {
        formsCount.textContent = '0';
        formsTableHead.innerHTML = '<tr><th colspan="2" class="px-3 py-2 border-b border-gray-700">Resultados</th></tr>';
        formsTableBody.innerHTML = '<tr><td colspan="2" class="px-3 py-4 text-center text-gray-500 text-sm">No se pudieron procesar formularios válidos.</td></tr>';
        return;
    }

    if (filterType === 'all-fieldtypes-summary') {
        const sortedForms = [...forms].sort((a: any, b: any) => {
            const totalA = Number(a?.estadisticasFieldType?.total) || 0;
            const totalB = Number(b?.estadisticasFieldType?.total) || 0;
            return summarySortOrder === 'asc' ? totalA - totalB : totalB - totalA;
        });

        formsCount.textContent = `${sortedForms.length} formularios resumidos`;
        formsTableHead.innerHTML = `
            <tr>
                <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">URL</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Total Campos ${summarySortOrder === 'asc' ? '↑' : '↓'}</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[280px]">Top FieldTypes</th>
            </tr>
        `;

        formsTableBody.innerHTML = sortedForms.map((form: any) => `
            <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
                <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
                <td class="px-3 py-2 font-mono text-[9px] min-w-[180px]"><div class="truncate max-w-[420px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                <td class="px-3 py-2 text-xs">${form.estadisticasFieldType?.total || 0}</td>
                <td class="px-3 py-2 text-xs text-gray-300">${escapeHtml(formatTypeStatsSummary(form.estadisticasFieldType))}</td>
            </tr>
        `).join('');
        return;
    }

    if (filterType === 'dropdown-with-terms') {
        formsCount.textContent = `${forms.length} formularios filtrados`;
        formsTableHead.innerHTML = `
            <tr>
                <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">URL</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[220px]">Dropdowns Detectados</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Opciones</th>
            </tr>
        `;

        formsTableBody.innerHTML = forms.map((form: any) => {
            const items = Array.isArray(form.tipoDocumentos) ? form.tipoDocumentos : [];
            const labels = items.map((item: any) => item.label || item.key).filter(Boolean).join(' | ') || 'Sin detalle';
            const optionCount = items.reduce((sum: number, item: any) => sum + (Array.isArray(item.enumNames) ? item.enumNames.length : 0), 0);
            return `
                <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
                    <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
                    <td class="px-3 py-2 font-mono text-[9px] min-w-[180px]"><div class="truncate max-w-[420px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                    <td class="px-3 py-2 text-xs text-gray-300">${escapeHtml(labels)}</td>
                    <td class="px-3 py-2 text-xs">${optionCount}</td>
                </tr>
            `;
        }).join('');
        return;
    }

    if (filterType === 'fieldtype-search') {
        formsCount.textContent = `${forms.length} formularios filtrados`;
        formsTableHead.innerHTML = `
            <tr>
                <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">URL</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Coincidencias</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[280px]">Tipos Encontrados</th>
            </tr>
        `;

        formsTableBody.innerHTML = forms.map((form: any) => `
            <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
                <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
                <td class="px-3 py-2 font-mono text-[9px] min-w-[180px]"><div class="truncate max-w-[420px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                <td class="px-3 py-2 text-xs">${form.estadisticasFieldType?.total || 0}</td>
                <td class="px-3 py-2 text-xs text-gray-300">${escapeHtml(formatTypeStatsSummary(form.estadisticasFieldType))}</td>
            </tr>
        `).join('');
        return;
    }

    if (filterType === 'plain-text' || filterType === 'tooltip') {
        formsCount.textContent = `${forms.length} formularios filtrados`;
        formsTableHead.innerHTML = `
            <tr>
                <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">URL</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Coincidencias</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Tipo Principal</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[280px]">Detalle</th>
            </tr>
        `;

        formsTableBody.innerHTML = forms.map((form: any) => {
            const components = Array.isArray(form.componentesEncontrados) ? form.componentesEncontrados : [];
            return `
                <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
                    <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
                    <td class="px-3 py-2 font-mono text-[9px] min-w-[180px]"><div class="truncate max-w-[420px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                    <td class="px-3 py-2 text-xs">${components.length}</td>
                    <td class="px-3 py-2 text-xs text-gray-300">${getTypeBadgeHtml(components[0]?.type || 'N/A')}</td>
                    <td class="px-3 py-2 text-xs text-gray-300">${getExpandableMatchHtml(components)}</td>
                </tr>
            `;
        }).join('');
        return;
    }

    if (filterType === 'buttons-by-terms' || filterType === 'fields-by-terms') {
        formsCount.textContent = `${forms.length} formularios filtrados`;
        formsTableHead.innerHTML = `
            <tr>
                <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">URL</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Coincidencias</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">Tipos Detectados</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[280px]">Primer Match</th>
            </tr>
        `;

        formsTableBody.innerHTML = forms.map((form: any) => {
            const components = Array.isArray(form.componentesEncontrados) ? form.componentesEncontrados : [];
            return `
                <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
                    <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
                    <td class="px-3 py-2 font-mono text-[9px] min-w-[180px]"><div class="truncate max-w-[420px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                    <td class="px-3 py-2 text-xs">${components.length}</td>
                    <td class="px-3 py-2 text-xs text-gray-300">${escapeHtml(formatComponentTypesSummary(components))}</td>
                    <td class="px-3 py-2 text-xs text-gray-300">${getExpandableMatchHtml(components)}</td>
                </tr>
            `;
        }).join('');
        return;
    }

    if (filterType === 'panel-non-accordion' || filterType === 'checkbox-group') {
        formsCount.textContent = `${forms.length} formularios filtrados`;
        formsTableHead.innerHTML = `
            <tr>
                <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">URL</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Coincidencias</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[160px]">Tipo Principal</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[280px]">Ruta</th>
            </tr>
        `;

        formsTableBody.innerHTML = forms.map((form: any) => {
            const components = Array.isArray(form.componentesEncontrados) ? form.componentesEncontrados : [];
            return `
                <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
                    <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
                    <td class="px-3 py-2 font-mono text-[9px] min-w-[180px]"><div class="truncate max-w-[420px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                    <td class="px-3 py-2 text-xs">${components.length}</td>
                    <td class="px-3 py-2 text-xs text-gray-300">${getTypeBadgeHtml(components[0]?.type || 'N/A')}</td>
                    <td class="px-3 py-2 text-xs text-gray-300 font-mono">${escapeHtml(formatFirstComponentPath(components))}</td>
                </tr>
            `;
        }).join('');
        return;
    }

    if (filterType === 'flags-by-keys' || filterType === 'signature') {
        formsCount.textContent = `${forms.length} formularios filtrados`;
        formsTableHead.innerHTML = `
            <tr>
                <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[180px]">URL</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Coincidencias</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[160px]">Tipo Principal</th>
                <th class="px-3 py-2 whitespace-nowrap min-w-[280px]">Detalle Técnico</th>
            </tr>
        `;

        formsTableBody.innerHTML = forms.map((form: any) => {
            const components = Array.isArray(form.componentesEncontrados) ? form.componentesEncontrados : [];
            return `
                <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
                    <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
                    <td class="px-3 py-2 font-mono text-[9px] min-w-[180px]"><div class="truncate max-w-[420px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                    <td class="px-3 py-2 text-xs">${components.length}</td>
                    <td class="px-3 py-2 text-xs text-gray-300">${getTypeBadgeHtml(components[0]?.type || 'N/A')}</td>
                    <td class="px-3 py-2 text-xs text-gray-300">${getExpandableMatchHtml(components)}</td>
                </tr>
            `;
        }).join('');
        return;
    }

    formsCount.textContent = `${forms.length} formularios filtrados`;
    formsTableHead.innerHTML = `
        <tr>
            <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título de Formulario</th>
            <th class="px-3 py-2 whitespace-nowrap min-w-[200px]">URL Completa</th>
            <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Coincidencias</th>
            <th class="px-3 py-2 whitespace-nowrap min-w-[120px]">Tipo Principal</th>
            <th class="px-3 py-2 whitespace-nowrap min-w-[280px]">Primer Match</th>
        </tr>
    `;

    formsTableBody.innerHTML = forms.map((form: any) => {
        const components = Array.isArray(form.componentesEncontrados) ? form.componentesEncontrados : [];
        const firstType = components[0]?.type || 'N/A';
        const firstMatchSummary = formatFirstMatchSummary(components);

        return `
        <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700 align-top">
            <td class="px-3 py-2 font-medium text-xs">${form.title || 'N/A'}</td>
            <td class="px-3 py-2 font-mono text-[9px] min-w-[200px]"><div class="truncate max-w-[500px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
            <td class="px-3 py-2 text-xs">${components.length}</td>
            <td class="px-3 py-2 text-xs text-gray-300">${getTypeBadgeHtml(firstType)}</td>
            <td class="px-3 py-2 text-xs text-gray-300">${getExpandableMatchHtml(components)}</td>
        </tr>
    `}).join('');
}

function buildFilterRequest(selectedPreset: FilterPreset | undefined): FilterRequest | null {
    if (!selectedPreset) {
        showToast('Debes seleccionar un filtro antes de procesar.', 'error');
        return null;
    }

    const termList = termListInput.value
        .split(/[\n,]+/)
        .map((term) => term.trim())
        .filter(Boolean);

    if (selectedPreset.ui === 'term-list' && termList.length === 0) {
        showToast('Debes ingresar al menos un término o clave para este filtro.', 'error');
        return null;
    }

    const parsedCheckboxMin = Number(checkboxGroupMinInput.value);
    const checkboxGroupMinOptions = Number.isFinite(parsedCheckboxMin) && parsedCheckboxMin >= 2 ? parsedCheckboxMin : 3;

    return {
        presetId: selectedPreset.id,
        type: selectedPreset.type,
        label: selectedPreset.label,
        params: {
            ...(selectedPreset.params || {}),
            ...(selectedPreset.ui === 'term-list'
                ? {
                    terms: termList,
                    mode: termListMode.value
                }
                : {}),
            ...(selectedPreset.ui === 'checkbox-group'
                ? {
                    minOptions: checkboxGroupMinOptions
                }
                : {})
        }
    };
}

function syncFilterArgumentUI() {
    const selectedPreset = getFilterPreset(filterSelect.value);
    filterHelpText.textContent = selectedPreset?.help || 'Selecciona un preset reutilizable o un caso parametrizable.';

    const usesTerms = selectedPreset?.ui === 'term-list';
    const usesCheckboxGroups = selectedPreset?.ui === 'checkbox-group';
    const shouldShowArguments = Boolean(usesTerms || usesCheckboxGroups);

    filterArgumentsContainer.classList.toggle('hidden', !shouldShowArguments);
    termListGroup.classList.toggle('hidden', !usesTerms);
    checkboxGroupConfig.classList.toggle('hidden', !usesCheckboxGroups);

    if (selectedPreset?.ui === 'term-list') {
        termListLabel.textContent = selectedPreset.termsLabel || 'Términos o campos a buscar';
        termListInput.placeholder = selectedPreset.termsPlaceholder || '';

        const detectedFieldTypes = selectedPreset.id === 'fieldtype-search'
            ? getDetectedFieldTypes()
            : [];

        termListInput.value = (detectedFieldTypes.length > 0
            ? detectedFieldTypes
            : (selectedPreset.defaultTerms || [])).join('\n');

        termListMode.value = selectedPreset.defaultMode || 'any';

        if (selectedPreset.id === 'fieldtype-search' && detectedFieldTypes.length > 0) {
            filterHelpText.textContent = `Catálogo detectado automáticamente (${detectedFieldTypes.length} tipos). Edita la lista si quieres filtrar por uno o varios específicos.`;
        }
    }

    if (selectedPreset?.ui === 'checkbox-group') {
        checkboxGroupMinInput.value = String(selectedPreset.minOptionsDefault || 3);
    }
}

filterSelect.addEventListener('change', syncFilterArgumentUI);
summarySortSelect.addEventListener('change', () => {
    summarySortOrder = summarySortSelect.value === 'asc' ? 'asc' : 'desc';
    renderResultsView();
});
syncFilterArgumentUI();

// Toast functionality
function showToast(message: string, type: 'error' | 'success' | 'warning' = 'error') {
    const duration = 3000; // 3 segundos exactos

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 rounded-lg shadow-lg font-medium text-white transition-opacity duration-300 z-50 max-w-lg flex flex-col overflow-hidden ${
        type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-yellow-600'
    }`;
    
    // Contenedor interno del texto y botón
    const content = document.createElement('div');
    content.className = 'px-6 py-3 flex items-start justify-between gap-4';

    const textSpan = document.createElement('span');
    textSpan.className = 'whitespace-pre-line';
    textSpan.textContent = message;

    const removeToast = () => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    };

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'text-xl leading-none font-bold hover:text-gray-200 focus:outline-none ml-2';

    content.appendChild(textSpan);
    content.appendChild(closeBtn);
    toast.appendChild(content);

    // Barra de progreso con Web Animations API para soportar pausas
    const progressBar = document.createElement('div');
    progressBar.className = 'h-1 bg-white opacity-50 w-full';
    toast.appendChild(progressBar);

    document.body.appendChild(toast);

    const anim = progressBar.animate([
        { width: '100%' },
        { width: '0%' }
    ], {
        duration: duration,
        fill: 'forwards'
    });

    anim.onfinish = () => {
        if (toast.parentNode) removeToast();
    };

    closeBtn.onclick = () => {
        anim.cancel();
        removeToast();
    };

    // Pausar y reanudar timer al pasar el mouse
    toast.addEventListener('mouseenter', () => anim.pause());
    toast.addEventListener('mouseleave', () => anim.play());
}

// Preload logic
btnPreloadUrls.addEventListener('click', async () => {
    try {
        const response = await fetch('/urls.txt');
        if (!response.ok) {
            throw new Error('Error al cargar el archivo desde el servidor');
        }
        const text = await response.text();
        urlsInput.value = text;
        showToast('urls.txt pre-cargado desde el servidor.', 'success');
    } catch (err: any) {
        showToast(err.message || 'Error pre-cargando urls.txt', 'error');
    }
});

// Load file logic
btnLoadFile.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string') {
                urlsInput.value = content;
                showToast(`Archivo cargado exitosamente.`, 'success');
            }
        };
        reader.onerror = () => {
            showToast('Error al leer el archivo.', 'error');
        };
        reader.readAsText(file);
    }
    // reset input so the same file can be selected again if needed
    fileInput.value = '';
});

function chunkUrls(urls: string[], size: number): string[][] {
    const chunks: string[][] = [];
    for (let index = 0; index < urls.length; index += size) {
        chunks.push(urls.slice(index, index + size));
    }
    return chunks;
}

btnProcess.addEventListener('click', async () => {
    const rawText = urlsInput.value.trim();
    if (!rawText) {
        showToast('Por favor inserta al menos una URL.', 'error');
        return;
    }

    const selectedPreset = getFilterPreset(filterSelect.value);
    const filter = buildFilterRequest(selectedPreset);
    if (!filter) {
        return;
    }

    let rawLines = rawText.split('\n');
    let urls: string[] = [];
    let urlMap = new Map<string, number[]>();
    
    rawLines.forEach((line, index) => {
        let cleaned = line.trim().replace(/,$/, '').replace(/["']/g, '');
        if (cleaned.startsWith('[') || cleaned.endsWith(']')) {
             cleaned = cleaned.replace(/[\[\]]/g, '');
        }
        if (cleaned.length > 0) {
            urls.push(cleaned);
            if (!urlMap.has(cleaned)) {
                urlMap.set(cleaned, []);
            }
            urlMap.get(cleaned)!.push(index + 1);
        }
    });

    let hasDuplicates = false;
    let duplicateData: {url: string, lines: number[]}[] = [];
    let duplicateMessages: string[] = [];
    urlMap.forEach((lines, url) => {
        if (lines.length > 1) {
            hasDuplicates = true;
            duplicateData.push({ url, lines });
            const shortUrl = url.substring(0, 40) + '...';
            duplicateMessages.push(`Líneas [${lines.join(', ')}]: ${shortUrl}`);
        }
    });

    // Resetting duplicate UI section first
    duplicatesContainer.classList.add('hidden');
    duplicatesTableBody.innerHTML = '';
    duplicateCountHeader.textContent = '0';

    if (hasDuplicates) {
        showToast(`Se encontraron URLs repetidas:\n${duplicateMessages.join('\n')}`, 'warning');
        // Deduplicate
        urls = Array.from(urlMap.keys());
        
        // Render Duplicates in UI
        duplicatesContainer.classList.remove('hidden');
        duplicateCountHeader.textContent = duplicateData.length.toString();
        duplicatesTableBody.innerHTML = duplicateData.map(dup => `
            <tr>
                <td class="px-4 py-2 border-b border-yellow-100 font-mono text-xs break-all text-yellow-900">${dup.url}</td>
                <td class="px-4 py-2 border-b border-yellow-100 font-mono text-xs font-bold text-yellow-700">${dup.lines.join(', ')}</td>
            </tr>
        `).join('');
    }

    if (urls.length === 0) {
        showToast('No se encontraron URLs válidas.', 'error');
        return;
    }

    btnProcess.disabled = true;
    loadingIndicator.classList.remove('hidden');
    loadingIndicator.classList.add('flex');
    resultsContainer.classList.add('hidden');
    realTimeLogs.classList.remove('hidden');
    logsList.innerHTML = '';
    
    currentResult = {
        fechaEjecucion: new Date().toISOString(),
        totalUrls: urls.length,
        procesadosExitosamente: 0,
        conErrores: 0,
        filtrosAplicados: [],
        formulariosDetalle: [],
        errores: [],
        filterMeta: {
            presetId: filter.presetId,
            type: filter.type,
            label: filter.label
        },
        estadisticasGlobalesFieldType: filter.type === 'all-fieldtypes-summary'
            ? {
                porTipo: {},
                total: 0
            }
            : undefined
    };

    const batchSize = 30;
    const urlBatches = chunkUrls(urls, batchSize);
    
    progressText.textContent = `Preparando ${urls.length} URLs en ${urlBatches.length} lote(s) de hasta ${batchSize}...`;
    logsList.innerHTML += `<li class="text-blue-400">⏳ Procesando URLs en lotes de hasta ${batchSize} en el servidor...</li>`;

    try {
        currentResult.filtrosAplicados = [{
            tipo: filter.label,
            valor: JSON.stringify(filter.params)
        }];

        for (let batchIndex = 0; batchIndex < urlBatches.length; batchIndex++) {
            const currentBatch = urlBatches[batchIndex];
            const startPosition = batchIndex * batchSize + 1;
            const endPosition = startPosition + currentBatch.length - 1;
            progressText.textContent = `Lote ${batchIndex + 1}/${urlBatches.length} - URLs ${startPosition} a ${endPosition} de ${urls.length}`;
            logsList.innerHTML += `<li class="text-sky-400">📦 [LOTE ${batchIndex + 1}/${urlBatches.length}] ${currentBatch.length} URL(s)</li>`;

            try {
                const response = await fetch('/api/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        urls: currentBatch,
                        filter: filter
                    })
                });

                if (!response.ok) {
                    throw new Error(`Status ${response.status}`);
                }

                const data = await response.json();
                currentResult.procesadosExitosamente += data.procesadosExitosamente || 0;
                currentResult.conErrores += data.conErrores || 0;
                currentResult.formulariosDetalle.push(...(data.formulariosDetalle || []));
                currentResult.errores.push(...(data.errores || []));
                currentResult.filtrosAplicados = data.filtrosAplicados || currentResult.filtrosAplicados;

                if (filter.type === 'all-fieldtypes-summary' && currentResult.estadisticasGlobalesFieldType) {
                    const batchGlobalStats = data.estadisticasGlobalesFieldType?.porTipo || {};
                    Object.entries(batchGlobalStats).forEach(([tipo, count]) => {
                        const numericCount = Number(count) || 0;
                        currentResult.estadisticasGlobalesFieldType.porTipo[tipo] =
                            (currentResult.estadisticasGlobalesFieldType.porTipo[tipo] || 0) + numericCount;
                    });
                }

                const okUrls = new Set((data.formulariosDetalle || []).map((item: any) => item.url));
                const errorMap = new Map((data.errores || []).map((item: any) => [item.url, item.error]));

                currentBatch.forEach((currentUrl) => {
                    if (errorMap.has(currentUrl)) {
                        logsList.innerHTML += `<li class="text-red-400">❌ [ERROR] ${currentUrl} - ${errorMap.get(currentUrl)}</li>`;
                        return;
                    }

                    if (okUrls.has(currentUrl)) {
                        logsList.innerHTML += `<li class="text-green-400">✅ [OK] ${currentUrl}</li>`;
                        return;
                    }

                    logsList.innerHTML += `<li class="text-gray-400">ℹ️ [SIN COINCIDENCIA] ${currentUrl}</li>`;
                });
            } catch (batchError: any) {
                currentResult.conErrores += currentBatch.length;
                currentBatch.forEach((currentUrl) => {
                    currentResult.errores.push({ url: currentUrl, error: batchError.message || 'Error de lote' });
                    logsList.innerHTML += `<li class="text-red-400">❌ [ERROR LOTE] ${currentUrl} - ${batchError.message || 'Error de lote'}</li>`;
                });
            }

            realTimeLogs.scrollTop = realTimeLogs.scrollHeight;
        }

    } catch (error: any) {
        currentResult.conErrores += 1;
        currentResult.errores.push({ url: 'Global', error: error.message });
        logsList.innerHTML += `<li class="text-red-400">❌ [ERROR GLOBAL] ${error.message}</li>`;
    }
    
    // Auto-scroll logs
    realTimeLogs.scrollTop = realTimeLogs.scrollHeight;

    // Al finalizar, renderizar tabla
    try {
        if (currentResult.estadisticasGlobalesFieldType) {
            currentResult.estadisticasGlobalesFieldType.total = Object.values(currentResult.estadisticasGlobalesFieldType.porTipo)
                .reduce((sum: number, count: any) => sum + (Number(count) || 0), 0);
        }

        renderResultsView();

        if (filterSelect.value === 'fieldtype-search') {
            syncFilterArgumentUI();
        }

        // Render Errores
        if (currentResult.errores && currentResult.errores.length > 0) {
            errorsContainer.classList.remove('hidden');
            errorCountHeader.textContent = currentResult.errores.length.toString();
            errorsTableBody.innerHTML = currentResult.errores.map((err: any) => `
                <tr>
                    <td class="px-4 py-2 border-b border-red-100 font-mono text-xs break-all">${err.url}</td>
                    <td class="px-4 py-2 border-b border-red-100 font-mono text-xs text-red-600">${err.error}</td>
                </tr>
            `).join('');
        } else {
            errorsContainer.classList.add('hidden');
            errorsTableBody.innerHTML = '';
        }

    } catch (error: any) {
        showToast(`Ocurrió un error al renderizar: ${error.message}`, 'error');
    } finally {
        btnProcess.disabled = false;
        loadingIndicator.classList.add('hidden');
        loadingIndicator.classList.remove('flex');
    }
});

btnDownloadJson.addEventListener('click', () => {
    if (!currentResult) return;

    const safeResult = buildExportResult(currentResult);
    const blob = new Blob([JSON.stringify(safeResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado-procesamiento-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

btnDownloadTxt.addEventListener('click', () => {
    if (!currentResult || !currentResult.formulariosDetalle) return;

    const urls = currentResult.formulariosDetalle.map((f: any) => f.url).join('\n');
    const blob = new Blob([urls], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `urls-filtradas-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

function generarCSV(data: any): string {
    if (!data || !data.formulariosDetalle) return "";

    const safeData = sanitizeUnicodeSeparators(data) as any;
    const formularios = safeData.formulariosDetalle;
    const filterType = safeData.filterMeta?.type;

    if (filterType === 'dropdown-with-terms') {
        const headers = ['URL Completa', 'Titulo', 'Key', 'Label', 'Opciones'];
        const rows = [headers.join(',')];

        formularios.forEach((form: any) => {
            const items = Array.isArray(form.tipoDocumentos) ? form.tipoDocumentos : [];
            if (items.length === 0) {
                rows.push([
                    escapeCsvCell(form.url || ''),
                    escapeCsvCell(form.title || ''),
                    escapeCsvCell(''),
                    escapeCsvCell(''),
                    escapeCsvCell('')
                ].join(','));
                return;
            }

            items.forEach((item: any) => {
                rows.push([
                    escapeCsvCell(form.url || ''),
                    escapeCsvCell(form.title || ''),
                    escapeCsvCell(item.key || ''),
                    escapeCsvCell(item.label || ''),
                    escapeCsvCell(Array.isArray(item.enumNames) ? item.enumNames.join(' | ') : '')
                ].join(','));
            });
        });

        return rows.join('\n');
    }

    if (filterType === 'all-fieldtypes-summary' || filterType === 'fieldtype-search') {
        const todosLosTipos = new Set<string>();
        formularios.forEach((form: any) => {
            Object.keys(form.estadisticasFieldType?.porTipo || {}).forEach((tipo) => todosLosTipos.add(tipo));
        });

        const tiposArray = Array.from(todosLosTipos).sort();
        const totalLabel = filterType === 'fieldtype-search' ? 'Total Coincidencias' : 'Total Campos';
        const headers = ['URL Completa', 'Titulo', ...tiposArray, totalLabel];
        const rows = [headers.join(',')];

        formularios.forEach((form: any) => {
            const statsByType = form.estadisticasFieldType?.porTipo || {};
            const row = [
                escapeCsvCell(form.url || ''),
                escapeCsvCell(form.title || '')
            ];

            tiposArray.forEach((tipo) => row.push(String(statsByType[tipo] || 0)));
            row.push(String(form.estadisticasFieldType?.total || 0));
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    const headers = ['URL Completa', 'Titulo', 'Key', 'Label', 'Tipo', 'Descripcion', 'Ruta'];
    const rows = [headers.join(',')];

    formularios.forEach((form: any) => {
        const components = Array.isArray(form.componentesEncontrados) ? form.componentesEncontrados : [];

        if (components.length === 0) {
            rows.push([
                escapeCsvCell(form.url || ''),
                escapeCsvCell(form.title || ''),
                escapeCsvCell(''),
                escapeCsvCell(''),
                escapeCsvCell(''),
                escapeCsvCell(''),
                escapeCsvCell('')
            ].join(','));
            return;
        }

        components.forEach((component: any) => {
            rows.push([
                escapeCsvCell(form.url || ''),
                escapeCsvCell(form.title || ''),
                escapeCsvCell(component.key || ''),
                escapeCsvCell(component.label || ''),
                escapeCsvCell(component.type || ''),
                escapeCsvCell(component.description || ''),
                escapeCsvCell(component.sourcePath || '')
            ].join(','));
        });
    });

    return rows.join('\n');
}

function generarCSVDetallado(data: any): string {
    if (!data || !data.formulariosDetalle) return "";

    const safeData = sanitizeUnicodeSeparators(data) as any;
    const formularios = safeData.formulariosDetalle;
    const headers = ['URL Completa', 'Titulo', 'Key', 'Label', 'Tipo', 'Descripcion', 'Ruta'];
    const rows = [headers.join(',')];

    formularios.forEach((form: any) => {
        const components = Array.isArray(form.componentesEncontrados) ? form.componentesEncontrados : [];

        if (components.length === 0) {
            rows.push([
                escapeCsvCell(form.url || ''),
                escapeCsvCell(form.title || ''),
                escapeCsvCell(''),
                escapeCsvCell(''),
                escapeCsvCell(''),
                escapeCsvCell(''),
                escapeCsvCell('')
            ].join(','));
            return;
        }

        components.forEach((component: any) => {
            rows.push([
                escapeCsvCell(form.url || ''),
                escapeCsvCell(form.title || ''),
                escapeCsvCell(component.key || ''),
                escapeCsvCell(component.label || ''),
                escapeCsvCell(component.type || ''),
                escapeCsvCell(component.description || ''),
                escapeCsvCell(component.sourcePath || '')
            ].join(','));
        });
    });

    return rows.join('\n');
}

btnDownloadCsv.addEventListener('click', () => {
    if (!currentResult) return;
    const csvString = generarCSV(currentResult);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen-formularios-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

btnDownloadCsvDetailed.addEventListener('click', () => {
    if (!currentResult) return;
    const csvString = generarCSVDetallado(currentResult);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detalle-formularios-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
