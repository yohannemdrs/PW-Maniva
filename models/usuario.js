const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UsuarioSchema = new mongoose.Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'CSA', // Referencia o modelo 'CSA'
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UsuarioSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);