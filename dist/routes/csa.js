"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const csa_1 = __importDefault(require("../models/csa"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const { cidade, estado } = req.body;
    try {
        const novaCSA = new csa_1.default({
            cidade: cidade.toLowerCase(),
            estado: estado.toLowerCase()
        });
        await novaCSA.save();
        res.status(201).json({ message: 'CSA registrada com sucesso!', data: novaCSA });
    }
    catch (err) {
        if (err.code === 11000) { //chave duplicada
            return res.status(409).json({ message: 'Uma CSA para esta cidade e estado já existe.' });
        }
        res.status(400).json({ message: err.message });
    }
});
router.get('/', async (req, res) => {
    try {
        const csas = await csa_1.default.find();
        res.json(csas);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const csa = await csa_1.default.findByIdAndDelete(req.params.id);
        if (!csa) {
            return res.status(404).json({ message: 'CSA não encontrada' });
        }
        res.json({ message: 'CSA excluída com sucesso' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
