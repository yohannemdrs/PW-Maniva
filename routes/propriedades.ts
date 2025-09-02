import express, { Request, Response, NextFunction } from 'express';
import Propriedade, { IPropriedadeDocument } from '../models/propriedade';
import { autenticarToken, autorizarRole } from '../middleware/auth';

const router = express.Router();

declare global {
    namespace Express {
        interface Response {
            propriedade?: IPropriedadeDocument; // Define a propriedade propriedade no objeto Response
        }
    }
}

async function getPropriedade(req: Request, res: Response, next: NextFunction) {
    let propriedade: IPropriedadeDocument | null;
    try {
        propriedade = await Propriedade.findById(req.params.id);
        if (propriedade == null) {
            return res.status(404).json({ message: 'Propriedade não encontrada' });
        }
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
    res.propriedade = propriedade;
    next();
}

// Rota: Obter todas as propriedades (READ ALL) - ACESSO A AMBOS OS PAPÉIS
router.get('/', autenticarToken, async (req: Request, res: Response) => {
    try {
        const propriedades: IPropriedadeDocument[] = await Propriedade.find();
        res.json(propriedades);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Rota: Obter uma propriedade específica (READ ONE) - ACESSO A AMBOS OS PAPÉIS
router.get('/:id', autenticarToken, getPropriedade, (req: Request, res: Response) => {
    res.json(res.propriedade);
});

// Rota: Criar uma nova propriedade (CREATE) - APENAS AGRICULTORES
router.post('/', autenticarToken, autorizarRole(['agricultor']), async (req: Request, res: Response) => {
    const { nome, descricao, areaHectares, culturaPrincipal, localizacao, tags } = req.body;
    const propriedade: IPropriedadeDocument = new Propriedade({
        nome, descricao, areaHectares, culturaPrincipal, localizacao, tags
    });
    try {
        const novaPropriedade: IPropriedadeDocument = await propriedade.save();
        res.status(201).json(novaPropriedade);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Rota: Atualizar uma propriedade (UPDATE) - APENAS AGRICULTORES
router.patch('/:id', autenticarToken, autorizarRole(['agricultor']), getPropriedade, async (req: Request, res: Response) => {
    if (res.propriedade) {
        if (req.body.nome != null) {
            res.propriedade.nome = req.body.nome;
        }
        if (req.body.descricao != null) {
            res.propriedade.descricao = req.body.descricao;
        }
        if (req.body.areaHectares != null) {
            res.propriedade.areaHectares = req.body.areaHectares;
        }
        if (req.body.culturaPrincipal != null) {
            res.propriedade.culturaPrincipal = req.body.culturaPrincipal;
        }
        if (req.body.localizacao != null) {
            res.propriedade.localizacao = req.body.localizacao;
        }
        if (req.body.tags != null) {
            res.propriedade.tags = req.body.tags;
        }

        res.propriedade.updatedAt = new Date();
        try {
            const propriedadeAtualizada: IPropriedadeDocument = await res.propriedade.save();
            res.json(propriedadeAtualizada);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    } else {
        res.status(404).json({ message: 'Propriedade não encontrada para atualização.' });
    }
});

// Rota: Deletar uma propriedade (DELETE) - APENAS AGRICULTORES
router.delete('/:id', autenticarToken, autorizarRole(['agricultor']), getPropriedade, async (req: Request, res: Response) => {
    if (res.propriedade) {
        try {
            await Propriedade.deleteOne({ _id: res.propriedade._id });
            res.json({ message: 'Propriedade excluída com sucesso' });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    } else {
        res.status(404).json({ message: 'Propriedade não encontrada para exclusão.' });
    }
});

// Rota: Busca textual completa (Full-text Search)
router.get('/search/:text', async (req: Request, res: Response) => {
    try {
        const searchText = req.params.text;
        const propriedades: IPropriedadeDocument[] = await Propriedade.find({
            $text: { $search: searchText }
        }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });

        res.json(propriedades);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;


