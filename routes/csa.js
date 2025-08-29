const express = require('express');
const router = express.Router();
const CSA = require('../models/csa');
const { autenticarToken } = require('../middleware/auth'); 

router.post('/', async (req, res) => {
    const { cidade, estado } = req.body;
    
    try {
        const novaCSA = new CSA({ 
            cidade: cidade.toLowerCase(), 
            estado: estado.toLowerCase()
        });

        await novaCSA.save();
        res.status(201).json({ message: 'CSA registrada com sucesso!', data: novaCSA });

    } catch (err) {
        // Agora, o erro de conflito (11000) será para a combinação de cidade e estado
        if (err.code ==1000) {
            return res.status(409).json({ message: 'Uma CSA para esta cidade e estado já existe.' });
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

module.exports = router;