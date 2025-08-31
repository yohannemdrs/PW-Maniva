"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuario_1 = __importDefault(require("../models/usuario"));
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await usuario_1.default.findOne({ email });
        if (!usuario || !(await usuario.comparePassword(senha))) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario._id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login bem-sucedido', token: token });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
