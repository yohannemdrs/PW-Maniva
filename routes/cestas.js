const express = require('express');
const router = express.Router();
const Cesta = require('../models/cesta');
const { autenticarToken, autorizarRole } = require('../middleware/auth');

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

// Rota: Criar uma nova cesta - APENAS CO-AGRICULTORES
router.post('/', autenticarToken, autorizarRole(['co-agricultor']), async (req, res) => {
    const { nome, descricao, produtos, preco, csa } = req.body;
    const cesta = new Cesta({
        nome, descricao, produtos, preco, csa
    });
    try {
        const novaCesta = await cesta.save();
        res.status(201).json(novaCesta);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota: Atualizar uma cesta - APENAS CO-AGRICULTORES
router.patch('/:id', autenticarToken, autorizarRole(['co-agricultor']), getCesta, async (req, res) => {
    if (req.body.nome != null) res.cesta.nome = req.body.nome;
    if (req.body.descricao != null) res.cesta.descricao = req.body.descricao;
    if (req.body.produtos != null) res.cesta.produtos = req.body.produtos;
    if (req.body.preco != null) res.cesta.preco = req.body.preco;
    if (req.body.csa != null) res.cesta.csa = req.body.csa;

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