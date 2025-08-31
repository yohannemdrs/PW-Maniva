import mongoose, { Schema, Document } from 'mongoose';

export interface ICSADocument extends Document {
    cidade: string;
    estado: string;
    createdAt: Date;
}

const CSASchema = new Schema<ICSADocument>({
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

export default mongoose.model<ICSADocument>('CSA', CSASchema);


