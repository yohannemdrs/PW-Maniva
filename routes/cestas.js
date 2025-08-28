const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Cesta = require('../models/cesta');
const { autenticarToken, autorizarRole } = require('../middleware/auth');

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
async function getCesta(req, res, next) {
let cesta;
try {
cesta = await Cesta.findById(req.params.id);
if (cesta == null) {
return res.status(404).json({ message: 'Cesta não encontrada' });
}
} catch (err) {
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
        const cesta = await Cesta.find({ nome: { $regex: nome, $options: 'i' } });
        if (!cesta || cesta.length === 0) {
            return res.status(404).json({ message: 'Cesta não encontrada' });
        }
        res.json(cesta);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota: Obter todas as cestas
router.get('/', async (req, res) => {
try {
const cestas = await Cesta.find().populate('csa', 'cidade');
res.json(cestas);
} catch (err) {
res.status(500).json({ message: err.message });
}
});

// Rota: Obter uma cesta específica
router.get('/:id', getCesta, (req, res) => {
res.json(res.cesta);
});

// Rota: Criar uma nova cesta (com imagem) - APENAS CO-AGRICULTORES
router.post('/', autenticarToken, autorizarRole(['co-agricultor']), upload.single('imagem'), async (req, res) => {
const { nome, descricao, produtos, preco, csa } = req.body;
const cesta = new Cesta({
nome,
descricao,
produtos,
preco,
csa,
imagem: req.file ? req.file.filename : null
});
try {
const novaCesta = await cesta.save();
res.status(201).json(novaCesta);
} catch (err) {
res.status(400).json({ message: err.message });
}
});

// Rota: Atualizar uma cesta - APENAS CO-AGRICULTORES
router.patch('/:id', autenticarToken, autorizarRole(['co-agricultor']), upload.single('imagem'), getCesta, async (req, res) => {
if (req.body.nome != null) res.cesta.nome = req.body.nome;
if (req.body.descricao != null) res.cesta.descricao = req.body.descricao;
if (req.body.produtos != null) res.cesta.produtos = req.body.produtos;
if (req.body.preco != null) res.cesta.preco = req.body.preco;
if (req.body.csa != null) res.cesta.csa = req.body.csa;
if (req.file) res.cesta.imagem = req.file.filename;


try {
const cestaAtualizada = await res.cesta.save();
res.json(cestaAtualizada);
} catch (err) {
res.status(400).json({ message: err.message });
}
});

// Rota: Deletar uma cesta - APENAS CO-AGRICULTORES
router.delete('/:id', autenticarToken, autorizarRole(['co-agricultor']), getCesta, async (req, res) => {
try {
await Cesta.deleteOne({ _id: res.cesta._id });
res.json({ message: 'Cesta excluída com sucesso' });
} catch (err) {
res.status(500).json({ message: err.message });
}
});

module.exports = router;