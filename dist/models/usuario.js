"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const UsuarioSchema = new mongoose_1.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'O email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Por favor, insira um email válido']
    },
    senha: {
        type: String,
        required: [true, 'A senha é obrigatória'],
        minlength: [6, 'A senha deve ter no mínimo 6 caracteres']
    },
    csa: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CSA',
        default: null
    },
    role: {
        type: String,
        enum: ['agricultor', 'co-agricultor'],
        default: 'co-agricultor'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
//verifica se a senha do usuário foi modificada e gera uma
// sequência aleatória de caracteres
UsuarioSchema.pre('save', async function (next) {
    if (!this.isModified('senha')) {
        return next();
    }
    try {
        const salt = await bcrypt_1.default.genSalt(10);
        this.senha = await bcrypt_1.default.hash(this.senha, salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
//usa a biblioteca bcrypt para comparar a senha que o usuário digitou 
//  com a senha que está criptografada no banco de dados
UsuarioSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt_1.default.compare(candidatePassword, this.senha);
};
exports.default = mongoose_1.default.model('Usuario', UsuarioSchema);
