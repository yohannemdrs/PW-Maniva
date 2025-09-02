import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(cors()); 
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log("Conectado ao MongoDB Atlas!"))
    .catch(err => console.error("Erro de conexão com MongoDB Atlas:", err));

import propriedadesRouter from './routes/propriedades';
import usuariosRouter from './routes/usuarios';
import csaRouter from './routes/csa';
import authRouter from './routes/auth';
import cestasRouter from './routes/cestas';

app.use('/cestas', cestasRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/csa', csaRouter);
app.use('/api/propriedades', propriedadesRouter); 
app.use('/api/auth', authRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("API de Propriedades está funcionando!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


