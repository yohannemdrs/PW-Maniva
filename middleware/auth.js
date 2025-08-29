const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header Recebido:', authHeader); 

    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'meu-segredo-super-secreto', (err, usuario) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }
        req.usuario = usuario;
        next();
    });
}

function autorizarRole(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
            return res.status(403).json({ message: 'Acesso negado: você não tem permissão para esta ação.' });
        }
        next();
    };
}

module.exports = {
    autenticarToken,
    autorizarRole
};