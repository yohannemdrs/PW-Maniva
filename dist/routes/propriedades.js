"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propriedade_1 = __importDefault(require("../models/propriedade"));
const auth_1 = require("../middleware/auth");
const propertyValidation_1 = require("../middleware/propertyValidation");
const router = express_1.default.Router();
async function getPropriedade(req, res, next) {
    let propriedade;
    try {
        propriedade = await propriedade_1.default.findById(req.params.id);
        if (propriedade == null) {
            return res.status(404).json({ message: 'Propriedade não encontrada' });
        }
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.propriedade = propriedade;
    next();
}
// Rota: Obter todas as propriedades (READ ALL) - ACESSO A AMBOS OS PAPÉIS
router.get('/', auth_1.autenticarToken, async (req, res) => {
    try {
        const propriedades = await propriedade_1.default.find();
        res.json(propriedades);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Rota: Obter uma propriedade específica (READ ONE) - ACESSO A AMBOS OS PAPÉIS
router.get('/:id', auth_1.autenticarToken, getPropriedade, (req, res) => {
    res.json(res.propriedade);
});
// Rota: Criar uma nova propriedade (CREATE) - APENAS AGRICULTORES
router.post('/', auth_1.autenticarToken, (0, auth_1.autorizarRole)(['agricultor']), propertyValidation_1.checkOverlap, async (req, res) => {
    const { nome, descricao, areaHectares, culturaPrincipal, localizacao, tags } = req.body;
    const propriedade = new propriedade_1.default({
        nome, descricao, areaHectares, culturaPrincipal, localizacao, tags
    });
    try {
        const novaPropriedade = await propriedade.save();
        res.status(201).json(novaPropriedade);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Rota: Atualizar uma propriedade (UPDATE) - APENAS AGRICULTORES
router.patch('/:id', auth_1.autenticarToken, (0, auth_1.autorizarRole)(['agricultor']), getPropriedade, propertyValidation_1.checkOverlap, async (req, res) => {
    if (res.propriedade) {
        if (req.body.nome != null) {
            res.propriedade.nome = req.body.nome;
        }
        if (req.body.descricao != undefined) {
            res.propriedade.descricao = req.body.descricao;
        }
        if (req.body.areaHectares != null) {
            res.propriedade.areaHectares = req.body.areaHectares;
        }
        if (req.body.culturaPrincipal != undefined) {
            res.propriedade.culturaPrincipal = req.body.culturaPrincipal;
        }
        if (req.body.localizacao != null) {
            res.propriedade.localizacao = req.body.localizacao;
        }
        if (req.body.tags != undefined) {
            res.propriedade.tags = req.body.tags;
        }
        res.propriedade.updatedAt = new Date();
        try {
            const propriedadeAtualizada = await res.propriedade.save();
            res.json(propriedadeAtualizada);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    else {
        res.status(404).json({ message: 'Propriedade não encontrada para atualização.' });
    }
});
// Rota: Deletar uma propriedade (DELETE) - APENAS AGRICULTORES
router.delete('/:id', auth_1.autenticarToken, (0, auth_1.autorizarRole)(['agricultor']), getPropriedade, async (req, res) => {
    if (res.propriedade) {
        try {
            await propriedade_1.default.deleteOne({ _id: res.propriedade._id });
            res.json({ message: 'Propriedade excluída com sucesso' });
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
    else {
        res.status(404).json({ message: 'Propriedade não encontrada para exclusão.' });
    }
});
// Rota: Busca textual completa (Full-text Search)
router.get('/search/:text', async (req, res) => {
    try {
        const searchText = req.params.text;
        const propriedades = await propriedade_1.default.find({
            $text: { $search: searchText }
        }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } });
        res.json(propriedades);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = router;
