# Procesador de Formularios

Aplicacion web para analizar formularios JSON remotos a partir de una lista de URLs. El objetivo principal es inspeccionar la estructura de cada formulario y encontrar componentes o propiedades especificas, por ejemplo:

- dropdowns de tipo de documento
- plaintext con HTML
- campos de pais, departamento o ciudad
- campos con signature
- dropdowns con tooltip
- botones de descargar o previsualizar
- paneles que no sean accordion
- nombres clave de identificacion y nombres propios
- flags especiales como `signatureType`, `precarga` o `pdfAdjunto`

La app tiene interfaz web y backend propio. El frontend recibe las URLs, las agrupa en lotes de 30 contra el backend y luego muestra resultados, errores y exportes descargables con detalle por URL.

## Stack

- Vite para servir y construir el frontend
- TypeScript en frontend y backend
- Express para la API
- Axios para descargar los JSON remotos
- Tailwind CSS para estilos utilitarios
- Vercel para despliegue web y funcion serverless

La interfaz esta construida manualmente en [src/main.ts](./src/main.ts), sin framework de componentes en uso.

## Estructura

```text
app/
  api/
    index.ts          # API Express y endpoint POST /api/process
    procesador.ts     # Logica de negocio para descargar y analizar formularios
  public/
    urls.txt          # Archivo precargable desde la interfaz
  src/
    main.ts           # UI, eventos, render de resultados y exportes
    style.css         # Tailwind base/components/utilities
  index.html          # Entrada del frontend
  vite.config.ts      # Proxy local de /api hacia Express
  vercel.json         # Rewrites para frontend y API en Vercel
```

## Flujo funcional

1. El usuario pega URLs o carga un TXT desde la interfaz.
2. El frontend limpia y deduplica las URLs.
3. El usuario selecciona un filtro principal de analisis.
4. El frontend envia varios `POST /api/process` en lotes de hasta 30 URLs.
5. El backend descarga en paralelo las URLs de cada lote y recorre cada JSON remoto de forma recursiva.
6. Si encuentra coincidencias, agrega el formulario al resultado.
7. El frontend muestra estadisticas, tabla de formularios exitosos, errores y JSON completo.
8. El usuario puede descargar resultados en JSON, TXT o CSV.

## Filtros soportados

La interfaz usa un selector de motores únicos. Los ejemplos de uso viven en los textos de ayuda y en los placeholders del formulario.

### Motores incluidos

- `tipos-documento`: listas desplegables por términos, por ejemplo `tipo de documento` o `tipo de identificación`
- `plain-text`: bloques de texto o HTML embebido
- `fields-by-terms`: campos por términos, por ejemplo `pais`, `ciudad`, `tipo_documento`, `actividad económica`, `código ciiu`, `profesion`
- `signature`: componentes o flags de firma
- `tooltip`: tooltips, ayudas o textos auxiliares
- `buttons-by-terms`: botones por texto o clave, por ejemplo `descargar`, `previsualizar`, `enviar`
- `panels`: paneles sin accordion
- `nombres-clave`: flags técnicas por clave, por ejemplo `signatureType`, `precarga`, `pdfAdjunto`
- `checkbox-groups`: formularios con al menos un grupo de varios checkboxs

### Qué se parametriza

- Lista de términos o claves
- Modo de coincidencia: `all` o `any`
- Targets a inspeccionar como `key`, `name`, `label`, `value` o `description`
- Tipos de componente permitidos en presets específicos
- Cantidad mínima de opciones para grupos de checkboxs

## Ejecucion local

### Requisitos

- Node.js 20 o superior recomendado
- npm

### Instalar dependencias

```bash
cd app
npm install
```

### Levantar frontend y backend

```bash
npm run dev
```

Esto inicia:

- Vite en desarrollo para el frontend
- un servidor Express en `http://localhost:3001`

En local, Vite redirige `/api/*` al backend con la configuracion de [vite.config.ts](./vite.config.ts).

### Construir frontend

```bash
npm run build
```

### Previsualizar build

```bash
npm run preview
```

## Endpoint principal

### `POST /api/process`

Body esperado:

```json
{
  "urls": [
    "https://example.com/form-a.model.json",
    "https://example.com/form-b.model.json"
  ],
  "filter": {
    "presetId": "actividad-economica-ciiu-profesion",
    "type": "fields-by-terms",
    "label": "Actividad económica + CIIU + profesión",
    "params": {
      "terms": ["actividad económica", "código ciiu", "profesion"],
      "mode": "all",
      "targets": ["key", "name", "label", "placeholder", "description", "title", "value"]
    }
  }
}
```

Ejemplo para grupos de checkboxs:

```json
{
  "urls": ["https://example.com/form-a.model.json"],
  "filter": {
    "presetId": "checkbox-groups",
    "type": "checkbox-group",
    "label": "Grupo de varios checkboxs",
    "params": {
      "minOptions": 3
    }
  }
}
```

Respuesta resumida:

```json
{
  "fechaEjecucion": "2026-03-06T00:00:00.000Z",
  "totalUrls": 2,
  "procesadosExitosamente": 2,
  "conErrores": 0,
  "filtrosAplicados": [],
  "formulariosDetalle": [],
  "errores": []
}
```

## Consideraciones tecnicas

- El frontend procesa las URLs en lotes de 30 para mantener acotado el tiempo por request en Vercel y seguir mostrando progreso visible.
- Cada descarga usa timeout de 5 segundos.
- Existe cache en memoria por URL durante la ejecucion actual.
- Solo se incluyen en `formulariosDetalle` los formularios que tuvieron coincidencias con el preset activo y cumplieron sus parámetros.
- La interfaz permite precargar [public/urls.txt](./public/urls.txt) o cargar un archivo local.

## Despliegue

La app esta preparada para Vercel.

- [vercel.json](./vercel.json) enruta `/api/*` a [api/index.ts](./api/index.ts)
- el resto de rutas apunta a [index.html](./index.html)

## Historia del repositorio

En la raiz del workspace existe un script legacy en [../index.js](../index.js). Ese script no forma parte del flujo de la app web actual; es una herramienta separada, orientada a ejecucion por consola y generacion de archivos de salida usando variables de entorno.

## Arquitectura

La vista general de system design del repositorio esta en [../docs/SYSTEM-DESIGN.md](../docs/SYSTEM-DESIGN.md).
El detalle tecnico especifico de la app web sigue en [../docs/APP-ARCHITECTURE.md](../docs/APP-ARCHITECTURE.md).
