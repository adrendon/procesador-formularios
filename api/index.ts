import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { ProcesadorFormularios, ProcessingOptions } from './procesador';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/process', async (req: Request, res: Response): Promise<void> => {
    try {
        const { urls, filters } = req.body;

        if (!urls || !Array.isArray(urls)) {
            res.status(400).json({ error: 'La propiedad "urls" debe ser un array de strings.' });
            return;
        }

        const procesador = new ProcesadorFormularios();
        const options: ProcessingOptions = {
            formUrls: urls,
            filters: {
                searchPlaintext: filters?.searchPlaintext === true,
                searchTiposDocumento: filters?.searchTiposDocumento === true,
                searchGeo: filters?.searchGeo === true,
                searchSignature: filters?.searchSignature === true,
                searchTooltip: filters?.searchTooltip === true,
                searchBotones: filters?.searchBotones === true,
                searchPanels: filters?.searchPanels === true,
                searchNombresClave: filters?.searchNombresClave === true,
                searchFlags: filters?.searchFlags === true
            }
        };

        console.log("Iniciando procesamiento backend...");
        const result = await procesador.processUrls(options);
        
        console.log(`Procesamiento finalizado. Exitosos: ${result.procesadosExitosamente}, Errores: ${result.conErrores}`);
        res.json(result);
    } catch (error: any) {
        console.error("Error global en procesamiento:", error);
        res.status(500).json({ error: 'Error del servidor procesando los formularios.', detalles: error?.message || String(error) });
    }
});

app.get('/api/preload-urls', (req: Request, res: Response): void => {
    try {
        // Try different paths depending on whether we are in Vercel or local
        const pathsToTry = [
            path.join(process.cwd(), 'urls.txt'),
            path.join(process.cwd(), 'api', 'urls.txt'),
            path.join(process.cwd(), '../urls.txt')
        ];
        
        let filePath = pathsToTry.find(p => fs.existsSync(p));

        if (filePath) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.send(content);
        } else {
            console.log('No se encontro el archivo urls.txt en ninguna ruta.');
            res.status(404).send('Archivo urls.txt no encontrado en la raiz del proyecto');
        }
    } catch (error: any) {
        console.error("Error leyendo urls.txt:", error);
        res.status(500).send('Error leyendo el archivo');
    }
});

// Development server check
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`✅ Servidor Backend corriendo en http://localhost:${port}`);   
    });
}
export default app;
