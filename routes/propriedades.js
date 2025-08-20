const express = require('express');
const router = express.Router();
const Propriedade = require('../models/propriedade');
const { autenticarToken, autorizarRole } = require('../middleware/auth'); 

async function getPropriedade(req, res, next) {
    let propriedade;
    try {
        propriedade = await Propriedade.findById(req.params.id);
        if (propriedade == null) {
            return res.status(404).json({ message: 'Propriedade não encontrada' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.propriedade = propriedade;
    next();
}

// Rota: Obter todas as propriedades (READ ALL) - ACESSO A AMBOS OS PAPÉIS
router.get('/', autenticarToken, autorizarRole(['agricultor', 'co-agricultor']), async (req, res) => {
    try {
        const propriedades = await Propriedade.find();
        res.json(propriedades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota: Obter uma propriedade específica (READ ONE) - ACESSO A AMBOS OS PAPÉIS
router.get('/:id', autenticarToken, autorizarRole(['agricultor', 'co-agricultor']), getPropriedade, (req, res) => {
    res.json(res.propriedade);
});

// Rota: Criar uma nova propriedade (CREATE) - APENAS AGRICULTORES
router.post('/', autenticarToken, autorizarRole(['agricultor']), async (req, res) => {
    const { nome, descricao, areaHectares, culturaPrincipal, localizacao, tags } = req.body;
    const propriedade = new Propriedade({
        nome, descricao, areaHectares, culturaPrincipal, localizacao, tags
    });
    try {
        const novaPropriedade = await propriedade.save();
        res.status(201).json(novaPropriedade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota: Atualizar uma propriedade (UPDATE) - APENAS AGRICULTORES
router.patch('/:id', autenticarToken, autorizarRole(['agricultor']), getPropriedade, async (req, res) => {
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

    res.propriedade.updatedAt = Date.now();
    try {
        const propriedadeAtualizada = await res.propriedade.save();
        res.json(propriedadeAtualizada);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota: Deletar uma propriedade (DELETE) - APENAS AGRICULTORES
router.delete('/:id', autenticarToken, autorizarRole(['agricultor']), getPropriedade, async (req, res) => {
    try {
        await Propriedade.deleteOne({ _id: res.propriedade._id });
        res.json({ message: 'Propriedade excluída com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota: Busca textual completa (Full-text Search)
router.get('/search/:text', async (req, res) => {
    try {
        const searchText = req.params.text;
        // O $text operador usa o índice de texto definidos no schema
        const propriedades = await Propriedade.find({
            $text: { $search: searchText }
        }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } }); // Ordena por relevância

        res.json(propriedades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
