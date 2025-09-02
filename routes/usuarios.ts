import { Router } from "express";
import * as yup from "yup";
import mongoose from "mongoose";
import bcrypt from "bcrypt"; 
import { autenticarToken, autorizarRole } from "../middleware/auth";

const router = Router();

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["co-agricultor", "agricultor"], 
    default: "co-agricultor" 
  }
});

const Usuario = mongoose.model("usuario", usuarioSchema);

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
    const hashedPassword = await bcrypt.hash(req.body.senha, 10);

    const novoUsuario = new Usuario({
      ...req.body,
      senha: hashedPassword // substitui pela senha criptografada
    });

    await novoUsuario.save();
    res.status(201).json({ message: "Usuário criado com sucesso!" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Listar todos usuários 
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});

// Atualizar usuário 
router.put("/:id", autenticarToken, async (req: any, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID inválido fornecido" });
    }

    // Se não for admin, só pode atualizar o próprio usuário
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Sem permissão para atualizar esse usuário" });
    }

    if (req.body.senha) {
      req.body.senha = await bcrypt.hash(req.body.senha, 10); // recriptografa a nova senha
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(usuario);
  } catch (err) {
    res.status(400).json({ message: "Erro ao atualizar usuário" });
  }
});

// Deletar usuário 
router.delete("/:id", autenticarToken, async (req: any, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID inválido fornecido" });
    }

    if ( req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Sem permissão para deletar esse usuário" });
    }

    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

    res.json({ message: "Usuário deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao deletar usuário" });
  }
});

export default router;
