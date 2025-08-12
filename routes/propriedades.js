const express = require('express');
const router = express.Router();
const Propriedade = require('../models/propriedade');

// Middleware para buscar propriedade por ID
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

// Rota: Obter todas as propriedades (READ ALL)
router.get('/', async (req, res) => {
    try {
        const propriedades = await Propriedade.find();
        res.json(propriedades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota: Obter uma propriedade específica (READ ONE)
router.get('/:id', getPropriedade, (req, res) => {
    res.json(res.propriedade);
});

// Rota: Criar uma nova propriedade (CREATE)
router.post('/', async (req, res) => {
    const { nome, descricao, areaHectares, culturaPrincipal, localizacao, tags } = req.body;

    // Validação básica para GeoJSON Point
    if (!localizacao || localizacao.type !== 'Point' || !Array.isArray(localizacao.coordinates) || localizacao.coordinates.length !== 2) {
        return res.status(400).json({ message: 'Formato de localização inválido. Esperado { type: "Point", coordinates: [longitude, latitude] }' });
    }

    const propriedade = new Propriedade({
        nome,
        descricao,
        areaHectares,
        culturaPrincipal,
        localizacao,
        tags
    });

    try {
        const novaPropriedade = await propriedade.save();
        res.status(201).json(novaPropriedade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota: Atualizar uma propriedade (UPDATE)
router.patch('/:id', getPropriedade, async (req, res) => {
    // Atualiza apenas os campos que foram enviados na requisição
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
        // Validação básica para GeoJSON Point na atualização
        if (req.body.localizacao.type !== 'Point' || !Array.isArray(req.body.localizacao.coordinates) || req.body.localizacao.coordinates.length !== 2) {
            return res.status(400).json({ message: 'Formato de localização inválido na atualização.' });
        }
        res.propriedade.localizacao = req.body.localizacao;
    }
    if (req.body.tags != null) {
        res.propriedade.tags = req.body.tags;
    }

    res.propriedade.updatedAt = Date.now(); // Atualiza o timestamp de atualização

    try {
        const propriedadeAtualizada = await res.propriedade.save();
        res.json(propriedadeAtualizada);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota: Deletar uma propriedade (DELETE)
router.delete('/:id', getPropriedade, async (req, res) => {
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
