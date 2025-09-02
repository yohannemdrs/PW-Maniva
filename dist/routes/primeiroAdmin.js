"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Usuario_1 = __importDefault(require("../models/Usuario"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
// Rota para criar o primeiro admin
router.post("/primeiro-admin", async (req, res) => {
    try {
        const totalUsuarios = await Usuario_1.default.countDocuments();
        if (totalUsuarios > 0) {
            return res.status(403).json({ message: "Admin já criado" });
        }
        const { nome, email, senha } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(senha, 10);
        const admin = new Usuario_1.default({
            nome,
            email,
            senha: hashedPassword,
            role: "admin"
        });
        await admin.save();
        res.status(201).json({ message: "Admin criado com sucesso!" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
