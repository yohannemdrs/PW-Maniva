const express = require('express');
const router = express.Router();
const CSA = require('../models/csa');

router.post('/', async (req, res) => {
    try {
        const { cidade } = req.body;
        const novaCSA = new CSA({ cidade });
        await novaCSA.save();
        res.status(201).json({ message: 'CSA registrada com sucesso!', data: novaCSA });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Uma CSA para esta cidade já existe.' });
        }
        res.status(400).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const csas = await CSA.find();
        res.json(csas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const csa = await CSA.findByIdAndDelete(req.params.id);
        if (!csa) {
            return res.status(404).json({ message: 'CSA não encontrada' });
        }
        res.json({ message: 'CSA excluída com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/cidade/:cidade', async (req, res) => {
    try {
        const csa = await CSA.findOne({ cidade: req.params.cidade.toLowerCase() });
        if (!csa) {
            return res.status(404).json({ message: 'CSA não encontrada para esta cidade' });
        }
        res.json(csa);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;