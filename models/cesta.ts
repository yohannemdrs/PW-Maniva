import mongoose, { Schema, Document } from 'mongoose';

export interface ICestaDocument extends Document {
    nome: string;
    descricao?: string;
    produtos: string[];
    preco: number;
    csa: mongoose.Types.ObjectId;
    imagem?: string;
    createdAt: Date;
}

const CestaSchema = new Schema<ICestaDocument>({
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

export default mongoose.model<ICestaDocument>('Cesta', CestaSchema);


