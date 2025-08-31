import mongoose, { Schema, Document } from 'mongoose';

interface ILocalizacao {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface IPropriedadeDocument extends Document {
    nome: string;
    descricao?: string;
    areaHectares: number;
    culturaPrincipal?: string;
    localizacao: ILocalizacao;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const PropriedadeSchema = new Schema<IPropriedadeDocument>({
    nome: {
        type: String,
        required: [true, 'O nome da propriedade é obrigatório'],
        trim: true
    },
    descricao: {
        type: String,
        trim: true
    },
    areaHectares: {
        type: Number,
        required: [true, 'A área em hectares é obrigatória'],
        min: [0, 'A área não pode ser negativa']
    },
    culturaPrincipal: {
        type: String,
        trim: true
    },
    localizacao: {
        type: {
            type: String, 
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // longitude, latitude
            required: true,
            validate: {
                validator: function(v: any) {
                    return Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number';
                },
                message: 'As coordenadas devem ser um array de [longitude, latitude]'
            }
        }
    },
    tags: {
        type: [String],
        index: true 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

PropriedadeSchema.index({ localizacao: '2dsphere' });

PropriedadeSchema.index({ 
    nome: 'text', 
    descricao: 'text', 
    culturaPrincipal: 'text', 
    tags: 'text' 
}, { 
    weights: { 
        nome: 10, 
        descricao: 5, 
        culturaPrincipal: 3, 
        tags: 8 
    }, 
    name: 'text_search_index' 
});

export default mongoose.model<IPropriedadeDocument>('Propriedade', PropriedadeSchema);


