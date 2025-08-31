"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const cesta_1 = __importDefault(require("../models/cesta"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Configuração do multer para uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // pasta onde vão as imagens
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// Middleware para buscar cesta por ID
async function getCesta(req, res, next) {
    let cesta;
    try {
        cesta = await cesta_1.default.findById(req.params.id);
        if (cesta == null) {
            return res.status(404).json({ message: 'Cesta não encontrada' });
        }
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.cesta = cesta;
    next();
}
// Rota: Pesquisar cesta pelo nome
router.get('/buscar/nome', async (req, res) => {
    try {
        const nome = req.query.nome;
        if (!nome) {
            return res.status(400).json({ message: 'Parâmetro nome é obrigatório' });
        }
        // Busca parcial (ex: pesquisar por número)
        const cestas = await cesta_1.default.find({ nome: { $regex: nome, $options: 'i' } });
        if (!cestas || cestas.length === 0) {
            return res.status(404).json({ message: 'Cesta não encontrada' });
        }
        res.json(cestas);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Rota: Obter todas as cestas
router.get('/', async (req, res) => {
    try {
        const cestas = await cesta_1.default.find().populate('csa', 'cidade');
        res.json(cestas);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Rota pegar uma cesta específica
router.get('/:id', getCesta, (req, res) => {
    res.json(res.cesta);
});
// Rota: Criar uma nova cesta (com imagem) - APENAS CO-AGRICULTORES
router.post('/', auth_1.autenticarToken, (0, auth_1.autorizarRole)(['co-agricultor']), upload.single('imagem'), async (req, res) => {
    const { nome, descricao, produtos, preco, csa } = req.body;
    const cesta = new cesta_1.default({
        nome,
        descricao,
        produtos,
        preco,
        csa,
        imagem: req.file ? req.file.filename : undefined
    });
    try {
        const novaCesta = await cesta.save();
        res.status(201).json(novaCesta);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.patch('/:id', auth_1.autenticarToken, (0, auth_1.autorizarRole)(['co-agricultor']), upload.single('imagem'), getCesta, async (req, res) => {
    if (res.cesta) {
        if (req.body.nome && req.body.nome.trim() !== "")
            res.cesta.nome = req.body.nome;
        if (req.body.descricao && req.body.descricao.trim() !== "")
            res.cesta.descricao = req.body.descricao;
        if (req.body.produtos && req.body.produtos.length > 0)
            res.cesta.produtos = req.body.produtos;
        if (req.body.preco && !isNaN(req.body.preco))
            res.cesta.preco = req.body.preco;
        if (req.body.csa && req.body.csa.trim() !== "")
            res.cesta.csa = req.body.csa; // Cast to any for ObjectId assignment
        if (req.file)
            res.cesta.imagem = req.file.filename;
        try {
            const cestaAtualizada = await res.cesta.save();
            res.json(cestaAtualizada);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    else {
        res.status(404).json({ message: 'Cesta não encontrada para atualização.' });
    }
});
// Rota deletar uma cesta - APENAS CO-AGRICULTORES
router.delete('/:id', auth_1.autenticarToken, (0, auth_1.autorizarRole)(['co-agricultor']), getCesta, async (req, res) => {
    if (res.cesta) {
        try {
            await cesta_1.default.deleteOne({ _id: res.cesta._id });
            res.json({ message: 'Cesta excluída com sucesso' });
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
    else {
        res.status(404).json({ message: 'Cesta não encontrada para exclusão.' });
    }
});
exports.default = router;
