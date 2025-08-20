const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Rota de login (Autenticação)
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (!usuario || !(await usuario.comparePassword(senha))) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Cria o token com o ID do usuário e seu papel (role)
        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET || 'meu-segredo-super-secreto',
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.json({ message: 'Login bem-sucedido', token: token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;