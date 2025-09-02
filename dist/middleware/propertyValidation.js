"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOverlap = checkOverlap;
const geolib_1 = require("geolib");
const propriedade_1 = __importDefault(require("../models/propriedade"));
// Função pra calcular o raio de uma área em hectares
function calculateRadius(areaHectares) {
    const areaSqMeters = areaHectares * 10000;
    return Math.sqrt(areaSqMeters / Math.PI);
}
// Middleware pra verificar sobreposição de propriedades.
async function checkOverlap(req, res, next) {
    const { areaHectares, localizacao } = req.body;
    const currentPropId = req.params.id;
    if (!localizacao || !localizacao.coordinates || !areaHectares) {
        // Se os dados essenciais pra validação não estiverem presentes, 
        // deixa a validação de esquema cuidar disso ou assume que não tem sobreposição pra verificar.
        return next();
    }
    const newPropLat = localizacao.coordinates[1];
    const newPropLon = localizacao.coordinates[0];
    const newPropRadius = calculateRadius(areaHectares);
    try {
        const existingPropriedades = await propriedade_1.default.find({});
        for (const existingProp of existingPropriedades) {
            // Ignora a própria propriedade se for uma operação de atualização
            if (currentPropId && existingProp._id.toString() === currentPropId) {
                continue;
            }
            if (existingProp.localizacao && existingProp.localizacao.coordinates && existingProp.areaHectares) {
                const existingPropLat = existingProp.localizacao.coordinates[1];
                const existingPropLon = existingProp.localizacao.coordinates[0];
                const existingPropRadius = calculateRadius(existingProp.areaHectares);
                const distance = (0, geolib_1.getDistance)({ latitude: newPropLat, longitude: newPropLon }, { latitude: existingPropLat, longitude: existingPropLon });
                // Se a distância entre os centros for menor que a soma dos raios, há sobreposição
                if (distance < (newPropRadius + existingPropRadius)) {
                    return res.status(400).json({ message: 'A nova propriedade se sobrepõe a uma propriedade existente.' });
                }
            }
        }
        next(); // Nenhuma sobreposição encontrada
    }
    catch (error) {
        console.error('Erro ao verificar sobreposição:', error);
        res.status(500).json({ message: 'Erro interno ao verificar sobreposição de propriedades.' });
    }
}
