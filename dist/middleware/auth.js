"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticarToken = autenticarToken;
exports.autorizarRole = autorizarRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function autenticarToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header Recebido:", authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ message: "Token de autenticação não fornecido." });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "meu-segredo-super-secreto", (err, usuario) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido ou expirado." });
        }
        req.usuario = usuario;
        next();
    });
}
function autorizarRole(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
            return res.status(403).json({ message: "Acesso negado: você não tem permissão para esta ação." });
        }
        next();
    };
}
