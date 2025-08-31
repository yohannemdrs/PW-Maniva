import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import multer from 'multer';
import Cesta, { ICestaDocument } from '../models/cesta';
import { autenticarToken, autorizarRole } from '../middleware/auth';

const router = express.Router();

interface CestaRequestBody {
    nome: string;
    descricao?: string;
    produtos: string[];
    preco: number;
    csa: string; // Assuming CSA ID is passed as a string
}

declare global {
    namespace Express {
        interface Response {
            cesta?: ICestaDocument; // Define a propriedade cesta no objeto Response
        }
        interface Request {
            file?: Express.Multer.File; // Define a propriedade file no objeto Request para multer
        }
    }
}

// Configuração do multer para uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // pasta onde vão as imagens
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware para buscar cesta por ID
async function getCesta(req: Request, res: Response, next: NextFunction) {
    let cesta: ICestaDocument | null;
    try {
        cesta = await Cesta.findById(req.params.id);
        if (cesta == null) {
            return res.status(404).json({ message: 'Cesta não encontrada' });
        }
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
    res.cesta = cesta;
    next();
}

// Rota: Pesquisar cesta pelo nome
router.get('/buscar/nome', async (req: Request, res: Response) => {
    try {
        const nome = req.query.nome as string;
        if (!nome) {
            return res.status(400).json({ message: 'Parâmetro nome é obrigatório' });
        }

        // Busca parcial (ex: pesquisar por número)
        const cestas: ICestaDocument[] = await Cesta.find({ nome: { $regex: nome, $options: 'i' } });
        if (!cestas || cestas.length === 0) {
            return res.status(404).json({ message: 'Cesta não encontrada' });
        }
        res.json(cestas);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Rota: Obter todas as cestas
router.get('/', async (req: Request, res: Response) => {
    try {
        const cestas: ICestaDocument[] = await Cesta.find().populate('csa', 'cidade');
        res.json(cestas);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Rota pegar uma cesta específica
router.get('/:id', getCesta, (req: Request, res: Response) => {
    res.json(res.cesta);
});

// Rota: Criar uma nova cesta (com imagem) - APENAS CO-AGRICULTORES
router.post('/', autenticarToken, autorizarRole(['co-agricultor']), upload.single('imagem'), async (req: Request<{}, {}, CestaRequestBody>, res: Response) => {
    const { nome, descricao, produtos, preco, csa } = req.body;
    const cesta: ICestaDocument = new Cesta({
        nome,
        descricao,
        produtos,
        preco,
        csa,
        imagem: req.file ? req.file.filename : undefined
    });
    try {
        const novaCesta: ICestaDocument = await cesta.save();
        res.status(201).json(novaCesta);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id', autenticarToken, autorizarRole(['co-agricultor']), upload.single('imagem'), getCesta, async (req: Request<{}, {}, CestaRequestBody>, res: Response) => {
    if (res.cesta) {
        if (req.body.nome && req.body.nome.trim() !== "") res.cesta.nome = req.body.nome;
        if (req.body.descricao && req.body.descricao.trim() !== "") res.cesta.descricao = req.body.descricao;
        if (req.body.produtos && req.body.produtos.length > 0) res.cesta.produtos = req.body.produtos;
        if (req.body.preco && !isNaN(req.body.preco)) res.cesta.preco = req.body.preco;
        if (req.body.csa && req.body.csa.trim() !== "") res.cesta.csa = req.body.csa as any; // Cast to any for ObjectId assignment
        if (req.file) res.cesta.imagem = req.file.filename;

        try {
            const cestaAtualizada: ICestaDocument = await res.cesta.save();
            res.json(cestaAtualizada);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    } else {
        res.status(404).json({ message: 'Cesta não encontrada para atualização.' });
    }
});

// Rota deletar uma cesta - APENAS CO-AGRICULTORES
router.delete('/:id', autenticarToken, autorizarRole(['co-agricultor']), getCesta, async (req: Request, res: Response) => {
    if (res.cesta) {
        try {
            await Cesta.deleteOne({ _id: res.cesta._id });
            res.json({ message: 'Cesta excluída com sucesso' });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    } else {
        res.status(404).json({ message: 'Cesta não encontrada para exclusão.' });
    }
});

export default router;


