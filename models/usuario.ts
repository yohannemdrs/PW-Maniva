import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUsuarioDocument extends Document {
    nome: string;
    email: string;
    senha: string;
    csa?: mongoose.Types.ObjectId;
    role: 'agricultor' | 'co-agricultor';
    createdAt: Date;
    comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UsuarioSchema = new Schema<IUsuarioDocument>({
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

UsuarioSchema.pre<IUsuarioDocument>('save', async function(next) {
    if (!this.isModified('senha')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

UsuarioSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.senha);
};

export default mongoose.model<IUsuarioDocument>('Usuario', UsuarioSchema);


