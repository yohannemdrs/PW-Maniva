"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usuario_1 = __importDefault(require("../models/usuario"));
const csa_1 = __importDefault(require("../models/csa"));
const yup = __importStar(require("yup"));
const router = express_1.default.Router();
const usuarioSchema = yup.object().shape({
    nome: yup.string().required('O nome é obrigatório'),
    email: yup.string().email('Email inválido').required('O email é obrigatório'),
    senha: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres'), // Senha não é required aqui para permitir patch sem senha
    role: yup.string().oneOf(['co-agricultor', 'agricultor', 'admin']).required('A role é obrigatória'),
    cidade_csa: yup.string().when('role', {
        is: (role) => role === 'co-agricultor' || role === 'agricultor',
        then: (schema) => schema.required('A cidade da CSA é obrigatória para co-agricultores e agricultores'),
        otherwise: (schema) => schema.notRequired()
    }),
    estado_csa: yup.string().when('role', {
        is: (role) => role === 'co-agricultor' || role === 'agricultor',
        then: (schema) => schema.required('O estado da CSA é obrigatório para co-agricultores e agricultores'),
        otherwise: (schema) => schema.notRequired()
    })
});
router.post('/', async (req, res) => {
    try {
        await usuarioSchema.validate(req.body, { abortEarly: false });
        const { nome, email, senha, role, cidade_csa, estado_csa } = req.body;
        let csaId = null;
        if (cidade_csa && estado_csa) {
            const csaExistente = await csa_1.default.findOne({
                cidade: cidade_csa.toLowerCase(),
                estado: estado_csa.toLowerCase()
            });
            if (!csaExistente) {
                return res.status(404).json({ message: 'CSA para esta cidade e estado não encontrada.' });
            }
            csaId = csaExistente._id;
        }
        const novoUsuario = new usuario_1.default({ nome, email, senha, role, csa: csaId });
        await novoUsuario.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    }
    catch (err) {
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
        const usuarios = await usuario_1.default.find({ csa: csaId }).select('-senha').populate('csa', 'cidade estado');
        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Nenhum usuário encontrado para esta CSA.' });
        }
        res.json(usuarios);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Rota para obter todos os usuários
router.get('/', async (req, res) => {
    try {
        const usuarios = await usuario_1.default.find().select('-senha').populate('csa', 'cidade estado');
        res.json(usuarios);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Rota para obter um usuário específico
router.get('/:id', async (req, res) => {
    try {
        const usuario = await usuario_1.default.findById(req.params.id).select('-senha').populate('csa', 'cidade estado');
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(usuario);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Rota para atualizar um usuário (Sem proteção)
router.patch('/:id', async (req, res) => {
    try {
        const usuario = await usuario_1.default.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        if (req.body.nome != null) {
            usuario.nome = req.body.nome;
        }
        if (req.body.email != null) {
            const emailExistente = await usuario_1.default.findOne({ email: req.body.email.toLowerCase() });
            if (emailExistente && emailExistente._id.toString() !== usuario._id.toString()) {
                return res.status(409).json({ message: 'Este email já está em uso.' });
            }
            usuario.email = req.body.email;
        }
        if (req.body.cidade_csa != null && req.body.estado_csa != null) {
            const csaExistente = await csa_1.default.findOne({
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
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Rota para deletar um usuário (Sem proteção)
router.delete('/:id', async (req, res) => {
    try {
        const usuario = await usuario_1.default.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
