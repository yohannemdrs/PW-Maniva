"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => console.log("Conectado ao MongoDB Atlas!"))
    .catch(err => console.error("Erro de conexão com MongoDB Atlas:", err));
const propriedades_1 = __importDefault(require("./routes/propriedades"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const csa_1 = __importDefault(require("./routes/csa"));
const auth_1 = __importDefault(require("./routes/auth"));
const cestas_1 = __importDefault(require("./routes/cestas"));
app.use('/cestas', cestas_1.default);
app.use('/api/usuarios', usuarios_1.default);
app.use('/api/csa', csa_1.default);
app.use('/api/propriedades', propriedades_1.default);
app.use('/api/auth', auth_1.default);
app.get("/", (req, res) => {
    res.send("API de Propriedades está funcionando!");
});
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
