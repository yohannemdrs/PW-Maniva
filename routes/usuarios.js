const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const CSA = require('../models/csa'); 
const { autenticarToken, autorizarRole } = require('../middleware/auth'); 
const yup = require('yup');

const usuarioSchema = yup.object().shape({
    nome: yup.string().required('O nome é obrigatório'),
    email: yup.string().email('Email inválido').required('O email é obrigatório'),
    senha: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres').required('A senha é obrigatória'),
    role: yup.string().oneOf(['co-agricultor', 'agricultor', 'admin']).required('A role é obrigatória'),
    cidade_csa: yup.string().required('A cidade da CSA é obrigatória'),
    estado_csa: yup.string().required('O estado da CSA é obrigatório')
});

router.post('/', async (req, res) => {
    try {
        await usuarioSchema.validate(req.body, { abortEarly: false });
        const { nome, email, senha, role, cidade_csa, estado_csa } = req.body;
        
        let csaId = null;
        if (cidade_csa && estado_csa) {
            let csaExistente = await CSA.findOne({ 
                cidade: cidade_csa.toLowerCase(),
                estado: estado_csa.toLowerCase() 
            });
            if (!csaExistente) {
                return res.status(404).json({ message: 'CSA para esta cidade e estado não encontrada.' });
            }
            csaId = csaExistente._id;
        }
        const novoUsuario = new Usuario({ nome, email, senha, role, csa: csaId });
        await novoUsuario.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Este email já está em uso.' });
        }
        res.status(500).json({ message: err.message });
    }
});

// Rota para listar todos os usuários de uma CSA específica
router.get('/csa/:csaId', async (req, res) => {
    try {
        const csaId = req.params.csaId;
        const usuarios = await Usuario.find({ csa: csaId }).select('-senha').populate('csa', 'cidade estado');
        
        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Nenhum usuário encontrado para esta CSA.' });
        }
        
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter todos os usuários
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-senha').populate('csa', 'cidade estado');
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter um usuário específico
router.get('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-senha').populate('csa', 'cidade estado');
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para atualizar um usuário (Sem proteção)
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
        if (req.body.cidade_csa != null && req.body.estado_csa != null) {
            const csaExistente = await CSA.findOne({ 
                cidade: req.body.cidade_csa.toLowerCase(),
                estado: req.body.estado_csa.toLowerCase()
            });
            if (!csaExistente) {
                return res.status(404).json({ message: 'CSA para esta cidade e estado não encontrada.' });
            }
            usuario.csa = csaExistente._id;
        }

        const usuarioAtualizado = await usuario.save();
        res.json(usuarioAtualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para deletar um usuário (Sem proteção)
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