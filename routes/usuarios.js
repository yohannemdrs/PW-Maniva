const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const CSA = require('../models/csa'); 

router.post('/', async (req, res) => {
    try {
        const { nome, email, senha, cidade_csa } = req.body;
        
        let csaId = null;
        if (cidade_csa) {
            let csaExistente = await CSA.findOne({ cidade: cidade_csa.toLowerCase() });
            if (!csaExistente) {
                return res.status(404).json({ message: 'CSA para esta cidade não encontrada.' });
            }
            csaId = csaExistente._id;
        }

        const novoUsuario = new Usuario({ nome, email, senha, csa: csaId });
        await novoUsuario.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Este email já está em uso.' });
        }
        res.status(400).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        // Popula o campo 'csa' com os dados da CSA em vez do ID
        const usuarios = await Usuario.find().select('-senha').populate('csa', 'cidade');
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-senha').populate('csa', 'cidade');
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (req.body.nome != null) {
            usuario.nome = req.body.nome;
        }
        if (req.body.email != null) {
            const emailExistente = await Usuario.findOne({ email: req.body.email.toLowerCase() });
            if (emailExistente && emailExistente._id.toString() !== usuario._id.toString()) {
                return res.status(409).json({ message: 'Este email já está em uso.' });
            }
            usuario.email = req.body.email;
        }
        if (req.body.senha != null) {
            usuario.senha = req.body.senha;
        }
        if (req.body.cidade_csa != null) {
            const csaExistente = await CSA.findOne({ cidade: req.body.cidade_csa.toLowerCase() });
            if (!csaExistente) {
                return res.status(404).json({ message: 'CSA para esta cidade não encontrada.' });
            }
            usuario.csa = csaExistente._id;
        }

        const usuarioAtualizado = await usuario.save();
        res.json(usuarioAtualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;