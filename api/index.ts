import express, { Request, Response } from 'express';
import cors from 'cors';
import { FilterRequest, ProcesadorFormularios, ProcessingOptions } from './procesador.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/process', async (req: Request, res: Response): Promise<void> => {
    try {
        const { urls, filter } = req.body;

        if (!urls || !Array.isArray(urls)) {
            res.status(400).json({ error: 'La propiedad "urls" debe ser un array de strings.' });
            return;
        }

        if (!filter || typeof filter !== 'object' || typeof filter.type !== 'string') {
            res.status(400).json({ error: 'La propiedad "filter" es obligatoria y debe incluir al menos un "type" válido.' });
            return;
        }

        const normalizedFilter: FilterRequest = {
            presetId: typeof filter.presetId === 'string' ? filter.presetId : undefined,
            type: filter.type,
            label: typeof filter.label === 'string' ? filter.label : filter.type,
            params: filter.params && typeof filter.params === 'object' ? filter.params : {}
        };

        const procesador = new ProcesadorFormularios();
        const options: ProcessingOptions = {
            formUrls: urls,
            filter: normalizedFilter
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
