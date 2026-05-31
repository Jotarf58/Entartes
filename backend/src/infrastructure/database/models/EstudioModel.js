const mongoose = require("mongoose");

const estudioSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
            trim: true
        },

        capacidade: {
            type: Number,
            required: true,
            min: 1
        },

        modalidadesPermitidas: {
            type: [String],
            default: []
        },

        estado: {
            type: String,
            enum: ["ATIVO", "INATIVO", "EM_CONSTRUCAO"],
            default: "ATIVO"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Estudio", estudioSchema);