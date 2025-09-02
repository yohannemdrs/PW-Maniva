import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

//
declare global {
    namespace Express {
        interface Request {
            usuario?: any; 
            // Define a propriedade usuario Isso permite que o middleware
            //'autenticarToken' anexe a informação do usuário à requisição
        }
    }
}

function autenticarToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header Recebido:", authHeader); 

    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ message: "Token de autenticação não fornecido." });
    }

    jwt.verify(token, process.env.JWT_SECRET || "meu-segredo-super-secreto", (err: any, usuario: any) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido ou expirado." });
        }
        req.usuario = usuario;
        next();
    });
}
//autorizar com base na sua função 
function autorizarRole(rolesPermitidos: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
            return res.status(403).json({ message: "Acesso negado: você não tem permissão para esta ação." });
        }
        next();
    };
}

export { autenticarToken, autorizarRole };