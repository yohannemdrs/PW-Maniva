const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CestaSchema = new mongoose.Schema({
nome: {
type: String,
required: [true, 'O nome da cesta é obrigatório'],
trim: true
},
descricao: {
type: String,
trim: true
},
produtos: [{
type: String,
trim: true
}],
preco: {
type: Number,
required: [true, 'O preço é obrigatório'],
min: [0, 'O preço não pode ser negativo']
},
csa: {
type: Schema.Types.ObjectId,
ref: 'CSA',
required: [true, 'A CSA da cesta é obrigatória']
},
imagem: {
type: String, 
trim: true
},
createdAt: {
type: Date,
default: Date.now
}
});


module.exports = mongoose.model('Cesta', CestaSchema);