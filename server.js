require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; 

// Middlewares
app.use(cors()); 
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Conectado ao MongoDB Atlas!"))
    .catch(err => console.error("Erro de conexão com MongoDB Atlas:", err));

const propriedadesRouter = require('./routes/propriedades');
const usuariosRouter = require('./routes/usuarios');
const csaRouter = require('./routes/csa');
const authRouter = require('./routes/auth');
const cestasRouter = require('./routes/cestas');

app.use('/cestas', cestasRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/csa', csaRouter);
app.use('/api/propriedades', propriedadesRouter); 
app.use('/api/auth', authRouter);

app.get("/", (req, res) => {
    res.send("API de Propriedades está funcionando!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
