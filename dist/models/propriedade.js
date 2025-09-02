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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PropriedadeSchema = new mongoose_1.Schema({
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
        min: [3, 'A área não pode ser negativa']
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
                validator: function (v) {
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
exports.default = mongoose_1.default.model('Propriedade', PropriedadeSchema);
