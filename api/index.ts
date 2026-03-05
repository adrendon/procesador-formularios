import express, { Request, Response } from 'express';
import cors from 'cors';
import { ProcesadorFormularios, ProcessingOptions } from './procesador.js';

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

// Development server check (Only for local development)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`✅ Servidor Backend corriendo en http://localhost:${port}`);   
    });
}
export default app;
