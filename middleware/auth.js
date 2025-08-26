const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header Recebido:', authHeader); // <<< ADICIONE ESTA LINHA

    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

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

// Middleware para verificar se o usuário tem um dos papéis permitidos
function autorizarRole(rolesPermitidos) {
    return (req, res, next) => {
        // Verifica se o array de papéis permitidos inclui o papel do usuário
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