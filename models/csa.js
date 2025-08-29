const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CSASchema = new Schema({
    cidade: {
        type: String,
        required: [true, 'A cidade da CSA é obrigatória'],
        lowercase: true,
        trim: true
    },
    estado: {
        type: String,
        required: [true, 'O estado da CSA é obrigatório'],
        lowercase: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

CSASchema.index({ cidade: 1, estado: 1 }, { unique: true });

module.exports = mongoose.model('CSA', CSASchema);