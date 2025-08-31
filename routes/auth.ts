import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Usuario, { IUsuarioDocument } from '../models/usuario';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;
        const usuario: IUsuarioDocument | null = await Usuario.findOne({ email });

        if (!usuario || !(await usuario.comparePassword(senha))) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login bem-sucedido', token: token });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;


