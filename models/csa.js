const mongoose = require('mongoose');

const CSASchema = new mongoose.Schema({
    cidade: {
        type: String,
        required: [true, 'O nome da cidade é obrigatório para a CSA'],
        unique: true, // Garante que apenas uma CSA exista por cidade
        trim: true,
        lowercase: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('CSA', CSASchema);