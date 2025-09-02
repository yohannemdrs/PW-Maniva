import express, { Request, Response } from 'express';
import CSA, { ICSADocument } from '../models/csa';
import { autenticarToken, autorizarRole } from '../middleware/auth';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const { cidade, estado } = req.body;
    
    try {
        const novaCSA: ICSADocument = new CSA({
            cidade: cidade.toLowerCase(),
            estado: estado.toLowerCase()
        });

        await novaCSA.save();
        res.status(201).json({ message: 'CSA registrada com sucesso!', data: novaCSA });

    } catch (err: any) {
        if (err.code === 11000) { //chave duplicada
            return res.status(409).json({ message: 'Uma CSA para esta cidade e estado já existe.' });
        }
        res.status(400).json({ message: err.message });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const csas: ICSADocument[] = await CSA.find();
        res.json(csas);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const csa = await CSA.findByIdAndDelete(req.params.id);
        if (!csa) {
            return res.status(404).json({ message: 'CSA não encontrada' });
        }
        res.json({ message: 'CSA excluída com sucesso' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;