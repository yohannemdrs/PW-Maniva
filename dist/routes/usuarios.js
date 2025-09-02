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
const express_1 = require("express");
const yup = __importStar(require("yup"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const usuarioSchema = new mongoose_1.default.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: {
        type: String,
        enum: ["co-agricultor", "agricultor"],
        default: "co-agricultor"
    }
});
const Usuario = mongoose_1.default.model("usuario", usuarioSchema);
const usuarioValidation = yup.object().shape({
    nome: yup.string().required("Nome é obrigatório"),
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    senha: yup.string().min(6, "Senha deve ter no mínimo 6 caracteres").required("Senha é obrigatória"),
    role: yup.string().oneOf(["admin", "co-agricultor", "agricultor"]).optional()
});
router.post("/", async (req, res) => {
    try {
        await usuarioValidation.validate(req.body);
        // Criptografar senha antes de salvar
        const hashedPassword = await bcrypt_1.default.hash(req.body.senha, 10);
        const novoUsuario = new Usuario({
            ...req.body,
            senha: hashedPassword // substitui pela senha criptografada
        });
        await novoUsuario.save();
        res.status(201).json({ message: "Usuário criado com sucesso!" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Listar todos usuários 
router.get("/", async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    }
    catch (err) {
        res.status(500).json({ message: "Erro ao buscar usuários" });
    }
});
// Buscar usuário por ID
router.get("/:id", auth_1.autenticarToken, async (req, res) => {
    try {
        // Validação de ID
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID inválido fornecido" });
        }
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario)
            return res.status(404).json({ message: "Usuário não encontrado" });
        res.json(usuario);
    }
    catch (err) {
        res.status(500).json({ message: "Erro ao buscar usuário" });
    }
});
// Atualizar usuário 
router.put("/:id", auth_1.autenticarToken, async (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID inválido fornecido" });
        }
        // Se não for admin, só pode atualizar o próprio usuário
        if (req.user.role !== "admin" && req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Sem permissão para atualizar esse usuário" });
        }
        if (req.body.senha) {
            req.body.senha = await bcrypt_1.default.hash(req.body.senha, 10); // recriptografa a nova senha
        }
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!usuario)
            return res.status(404).json({ message: "Usuário não encontrado" });
        res.json(usuario);
    }
    catch (err) {
        res.status(400).json({ message: "Erro ao atualizar usuário" });
    }
});
// Deletar usuário 
router.delete("/:id", auth_1.autenticarToken, async (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID inválido fornecido" });
        }
        if (req.user.role !== "admin" && req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Sem permissão para deletar esse usuário" });
        }
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario)
            return res.status(404).json({ message: "Usuário não encontrado" });
        res.json({ message: "Usuário deletado com sucesso" });
    }
    catch (err) {
        res.status(500).json({ message: "Erro ao deletar usuário" });
    }
});
exports.default = router;
