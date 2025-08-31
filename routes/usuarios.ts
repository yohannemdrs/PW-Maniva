import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Usuario, { IUsuarioDocument } from '../models/usuario';
import CSA, { ICSADocument } from '../models/csa';
import { autenticarToken, autorizarRole } from '../middleware/auth';
import * as yup from 'yup';

const router = express.Router();

interface IUsuarioRequestBody {
    nome: string;
    email: string;
    senha?: string; // Senha é opcional para atualização
    role: 'co-agricultor' | 'agricultor' | 'admin';
    cidade_csa?: string;
    estado_csa?: string;
}

const usuarioSchema = yup.object().shape({
    nome: yup.string().required('O nome é obrigatório'),
    email: yup.string().email('Email inválido').required('O email é obrigatório'),
    senha: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres'), // Senha não é required aqui para permitir patch sem senha
    role: yup.string().oneOf(['co-agricultor', 'agricultor', 'admin']).required('A role é obrigatória'),
    cidade_csa: yup.string().when('role', {
        is: (role: string) => role === 'co-agricultor' || role === 'agricultor',
        then: (schema) => schema.required('A cidade da CSA é obrigatória para co-agricultores e agricultores'),
        otherwise: (schema) => schema.notRequired()
    }),
    estado_csa: yup.string().when('role', {
        is: (role: string) => role === 'co-agricultor' || role === 'agricultor',
        then: (schema) => schema.required('O estado da CSA é obrigatório para co-agricultores e agricultores'),
        otherwise: (schema) => schema.notRequired()
    })
});

router.post('/', async (req: Request<{}, {}, IUsuarioRequestBody>, res: Response) => {
    try {
        await usuarioSchema.validate(req.body, { abortEarly: false });
        const { nome, email, senha, role, cidade_csa, estado_csa } = req.body;
        
        let csaId: mongoose.Types.ObjectId | null = null;
        if (cidade_csa && estado_csa) {
            const csaExistente: ICSADocument | null = await CSA.findOne({ 
                cidade: cidade_csa.toLowerCase(),
                estado: estado_csa.toLowerCase() 
            });
            if (!csaExistente) {
                return res.status(404).json({ message: 'CSA para esta cidade e estado não encontrada.' });
            }
            csaId = csaExistente._id as mongoose.Types.ObjectId;
        }
        const novoUsuario: IUsuarioDocument = new Usuario({ nome, email, senha, role, csa: csaId });
        await novoUsuario.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (err: any) {
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
router.get('/csa/:csaId', async (req: Request<{ csaId: string }>, res: Response) => {
    try {
        const csaId: string = req.params.csaId;
        const usuarios: IUsuarioDocument[] = await Usuario.find({ csa: csaId }).select('-senha').populate('csa', 'cidade estado');
        
        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Nenhum usuário encontrado para esta CSA.' });
        }
        
        res.json(usuarios);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter todos os usuários
router.get('/', async (req: Request, res: Response) => {
    try {
        const usuarios: IUsuarioDocument[] = await Usuario.find().select('-senha').populate('csa', 'cidade estado');
        res.json(usuarios);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para obter um usuário específico
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const usuario: IUsuarioDocument | null = await Usuario.findById(req.params.id).select('-senha').populate('csa', 'cidade estado');
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Rota para atualizar um usuário (Sem proteção)
router.patch('/:id', async (req: Request<{ id: string }, {}, IUsuarioRequestBody>, res: Response) => {
    try {
        const usuario: IUsuarioDocument | null = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (req.body.nome != null) {
            usuario.nome = req.body.nome;
        }
        if (req.body.email != null) {
            const emailExistente: IUsuarioDocument | null = await Usuario.findOne({ email: req.body.email.toLowerCase() });
            if (emailExistente && (emailExistente._id as mongoose.Types.ObjectId).toString() !== (usuario._id as mongoose.Types.ObjectId).toString()) {
                return res.status(409).json({ message: 'Este email já está em uso.' });
            }
            usuario.email = req.body.email;
        }
        if (req.body.cidade_csa != null && req.body.estado_csa != null) {
            const csaExistente: ICSADocument | null = await CSA.findOne({ 
                cidade: req.body.cidade_csa.toLowerCase(),
                estado: req.body.estado_csa.toLowerCase()
            });
            if (!csaExistente) {
                return res.status(404).json({ message: 'CSA para esta cidade e estado não encontrada.' });
            }
            usuario.csa = csaExistente._id as mongoose.Types.ObjectId;
        }

        const usuarioAtualizado: IUsuarioDocument = await usuario.save();
        res.json(usuarioAtualizado);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Rota para deletar um usuário (Sem proteção)
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const usuario: IUsuarioDocument | null = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;

