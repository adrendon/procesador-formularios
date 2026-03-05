import './style.css';

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
          placeholder="https://test.com/form1.json\nhttps://test.com/form2.json"
        ></textarea>
        <p class="mt-1 text-sm text-gray-500">Puedes pegar múltiples URLs separadas por salto de línea.</p>
      </div>

      <div class="mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 class="text-lg font-medium text-gray-700 mb-3">Opciones de Filtrado</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterTiposDoc" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterTiposDoc" class="font-medium text-gray-700">Extraer "Tipo de Documento"</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterPlaintext" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterPlaintext" class="font-medium text-gray-700">Plaintext con HTML</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterGeo" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterGeo" class="font-medium text-gray-700">Dropdowns País/Depto/Ciudad</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterSignature" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterSignature" class="font-medium text-gray-700">Campos con Signature</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterTooltip" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterTooltip" class="font-medium text-gray-700">Dropdowns con Tooltip</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterBotones" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterBotones" class="font-medium text-gray-700">Botones Descargar/Previsualizar</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterPanels" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterPanels" class="font-medium text-gray-700">Paneles (No Accordion)</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterNombresClave" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterNombresClave" class="font-medium text-gray-700">Nombres Clave (nombres, apellidos)</label>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="filterFlags" type="radio" name="mainFilter" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="filterFlags" class="font-medium text-gray-700">Flags específicas de firma/adjuntos</label>
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
        <div id="loadingIndicator" class="hidden flex items-center text-blue-600 text-sm font-medium">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Procesando... (<span id="progressText">0/0</span>)
        </div>
      </div>

      <div id="realTimeLogs" class="hidden mb-6 bg-gray-900 rounded-lg p-4 shadow-inner max-h-48 overflow-y-auto font-mono text-sm">
         <ul id="logsList" class="space-y-1"></ul>
      </div>

      <div id="resultsContainer" class="hidden">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Resultados</h2>
        
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <span class="block text-sm text-blue-600 font-medium">Total URLs</span>
            <span id="statTotal" class="block text-2xl font-bold text-blue-900 mt-1">-</span>
          </div>
          <div class="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <span class="block text-sm text-green-600 font-medium">Procesados OK</span>
            <span id="statOk" class="block text-2xl font-bold text-green-900 mt-1">-</span>
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
        </div>

        <!-- Previsualizador de Formularios / URLs -->
        <div class="bg-gray-900 rounded-lg p-4 mb-6 shadow-inner">
          <div class="mb-2 flex justify-between items-center text-gray-400 text-xs border-b border-gray-700 pb-2">
            <span class="font-semibold uppercase tracking-wider">VISUALIZADOR DE URLs PROCESADAS</span>
            <span id="formsCount" class="font-bold text-gray-300">0</span>
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

const filterPlaintext = document.getElementById('filterPlaintext') as HTMLInputElement;
const filterTiposDoc = document.getElementById('filterTiposDoc') as HTMLInputElement;
const filterGeo = document.getElementById('filterGeo') as HTMLInputElement;
const filterSignature = document.getElementById('filterSignature') as HTMLInputElement;
const filterTooltip = document.getElementById('filterTooltip') as HTMLInputElement;
const filterBotones = document.getElementById('filterBotones') as HTMLInputElement;
const filterPanels = document.getElementById('filterPanels') as HTMLInputElement;
const filterNombresClave = document.getElementById('filterNombresClave') as HTMLInputElement;
const filterFlags = document.getElementById('filterFlags') as HTMLInputElement;

const progressText = document.getElementById('progressText') as HTMLSpanElement;
const realTimeLogs = document.getElementById('realTimeLogs') as HTMLDivElement;
const logsList = document.getElementById('logsList') as HTMLUListElement;
const loadingIndicator = document.getElementById('loadingIndicator') as HTMLDivElement;
const resultsContainer = document.getElementById('resultsContainer') as HTMLDivElement;
const jsonPreview = document.getElementById('jsonPreview') as HTMLPreElement;const formsCount = document.getElementById('formsCount') as HTMLSpanElement;
const formsTableHead = document.getElementById('formsTableHead') as HTMLTableSectionElement;
const formsTableBody = document.getElementById('formsTableBody') as HTMLTableSectionElement;
const statTotal = document.getElementById('statTotal') as HTMLSpanElement;
const statOk = document.getElementById('statOk') as HTMLSpanElement;
const statError = document.getElementById('statError') as HTMLSpanElement;
const btnDownloadJson = document.getElementById('btnDownloadJson') as HTMLButtonElement;
const btnDownloadTxt = document.getElementById('btnDownloadTxt') as HTMLButtonElement;
const btnDownloadCsv = document.getElementById('btnDownloadCsv') as HTMLButtonElement;
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
        const response = await fetch('http://localhost:3001/api/preload-urls');
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

btnProcess.addEventListener('click', async () => {
    const rawText = urlsInput.value.trim();
    if (!rawText) {
        showToast('Por favor inserta al menos una URL.', 'error');
        return;
    }

    const filters = {
        searchPlaintext: filterPlaintext.checked,
        searchTiposDocumento: filterTiposDoc.checked,
        searchGeo: filterGeo.checked,
        searchSignature: filterSignature.checked,
        searchTooltip: filterTooltip.checked,
        searchBotones: filterBotones.checked,
        searchPanels: filterPanels.checked,
        searchNombresClave: filterNombresClave.checked,
        searchFlags: filterFlags.checked
    };

    const hasAnyFilter = Object.values(filters).some(v => v === true);
    if (!hasAnyFilter) {
        showToast('Debes seleccionar al menos una opción de filtrado antes de procesar.', 'error');
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
        errores: []
    };

    for (let i = 0; i < urls.length; i++) {
        const urlToProcess = urls[i];
        progressText.textContent = `${i + 1}/${urls.length}`;
        
        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    urls: [urlToProcess],
                    filters: filters
                })
            });

            if (!response.ok) {
                throw new Error(`Status ${response.status}`);
            }

            const data = await response.json();
            
            // Si el backend agregó info del filtro, la copiamos 1 sola vez
            if (i === 0 && data.filtrosAplicados) {
                currentResult.filtrosAplicados = data.filtrosAplicados;
            }

            if (data.conErrores > 0) {
                currentResult.conErrores++;
                if (data.errores && data.errores.length > 0) {
                    currentResult.errores.push(data.errores[0]);
                } else {
                    currentResult.errores.push({ url: urlToProcess, error: 'Error desconocido' });
                }
                logsList.innerHTML += `<li class="text-red-400">❌ [ERROR] ${urlToProcess}</li>`;
            } else {
                currentResult.procesadosExitosamente++;
                if (data.formulariosDetalle && data.formulariosDetalle.length > 0) {
                    currentResult.formulariosDetalle.push(data.formulariosDetalle[0]);
                }
                logsList.innerHTML += `<li class="text-green-400">✅ [OK] ${urlToProcess}</li>`;
            }

        } catch (error: any) {
            currentResult.conErrores++;
            currentResult.errores.push({ url: urlToProcess, error: error.message });
            logsList.innerHTML += `<li class="text-red-400">❌ [ERROR] ${urlToProcess} - ${error.message}</li>`;
        }
        
        // Auto-scroll logs
        realTimeLogs.scrollTop = realTimeLogs.scrollHeight;
    }

    // Al finalizar, renderizar tabla
    try {
        statTotal.textContent = currentResult.totalUrls.toString();
        statOk.textContent = currentResult.procesadosExitosamente.toString();
        statError.textContent = currentResult.conErrores.toString();
        
        resultsContainer.classList.remove('hidden');

        jsonPreview.textContent = JSON.stringify(currentResult, null, 2);

        // Preprocesar forms para crear `componentesData` que alimenta la tabla
        currentResult.formulariosDetalle.forEach((form: any) => {
            if (!form.componentesData) form.componentesData = {};
            
            // Recontar desde `componentesEncontrados`
            if (form.componentesEncontrados) {
                form.componentesEncontrados.forEach((c: any) => {
                    const tipo = c.type || c.label || "unknown";
                    form.componentesData[tipo] = (form.componentesData[tipo] || 0) + 1;
                });
            }
            
            // Recontar desde `tipoDocumentos` si se sacó especifico
            if (form.tipoDocumentos) {
                form.tipoDocumentos.forEach((c: any) => {
                    const tipo = "Tipo_Documento_" + (c.key || c.label || "unknown");
                    form.componentesData[tipo] = (form.componentesData[tipo] || 0) + 1;
                });
            }
        });

        // Render Formularios (Visualizador)
        if (currentResult.formulariosDetalle && currentResult.formulariosDetalle.length > 0) {
            formsCount.textContent = `${currentResult.formulariosDetalle.length} formularios exitosos`;

            formsTableHead.innerHTML = `
                <tr>
                    <th class="px-3 py-2 whitespace-nowrap min-w-[150px]">Título de Formulario</th>
                    <th class="px-3 py-2 whitespace-nowrap min-w-[200px]">URL Completa</th>
                </tr>
            `;

            formsTableBody.innerHTML = currentResult.formulariosDetalle.map((form: any) => `
                <tr class="hover:bg-gray-800 transition-colors border-b border-gray-700">
                    <td class="px-3 py-2 font-medium text-xs">${form.title || form.titulo || form.formName || 'N/A'}</td>
                    <td class="px-3 py-2 font-mono text-[9px] min-w-[200px] hover:overflow-visible relative"><div class="truncate max-w-[500px]"><a href="${form.url}" target="_blank" class="text-blue-400 hover:underline" title="${form.url}">${form.url}</a></div></td>
                </tr>
            `).join('');
        } else {
            formsCount.textContent = '0';
            formsTableHead.innerHTML = '<tr><th colspan="2" class="px-3 py-2 border-b border-gray-700">Resultados</th></tr>';
            formsTableBody.innerHTML = '<tr><td colspan="2" class="px-3 py-4 text-center text-gray-500 text-sm">No se pudieron procesar formularios válidos.</td></tr>';

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
    }
});

btnDownloadJson.addEventListener('click', () => {
    if (!currentResult) return;
    
    const blob = new Blob([JSON.stringify(currentResult, null, 2)], { type: 'application/json' });
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
    
    const formularios = data.formulariosDetalle;
    const todosLosTipos = new Set<string>();
    formularios.forEach((form: any) => {
        if(form.componentesData) {
            Object.keys(form.componentesData).forEach(tipo => todosLosTipos.add(tipo));
        }
    });
    
    const tiposArray = Array.from(todosLosTipos).sort();
    
    const headers = [
        "Path", 
        "URL Completa", 
        "Titulo", 
        "Nombre Formulario (FormName)",
        "Tiene Signature (Flag)",
        "Signature Detectado (Value)",
        ...tiposArray,
        "Total Campos"
    ];
    
    const rows = [headers.join(",")];
    
    formularios.forEach((form: any) => {
        const row = [
            `"${form.path || ''}"`,
            `"${form.url || ''}"`,
            `"${(form.titulo || '').replace(/"/g, '""')}"`,
            `"${form.formName || ''}"`,
            `"${form.tieneSignature ? 'SI' : 'NO'}"`,
            `"${form.signatureDetectado || ''}"`
        ];
        
        tiposArray.forEach(tipo => {
            row.push(form.componentesData?.[tipo] || 0);
        });
        
        row.push(form.totalCampos || 0);
        
        rows.push(row.join(","));
    });
    
    return rows.join("\n");
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
