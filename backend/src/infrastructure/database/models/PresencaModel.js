const mongoose = require("mongoose");

const presencaAlunoSchema = new mongoose.Schema(
    {
        alunoId: {
            type: String,
            required: true
        },

        presenca: {
            type: Boolean,
            required: true
        },

        estadoParticipacao: {
            type: String,
            enum: ["PRESENTE", "FALTOU", "FALTA_JUSTIFICADA"],
            required: true
        }
    },
    { _id: false }
);

const presencaSchema = new mongoose.Schema(
    {
        sessaoId: {
            type: String,
            required: true
        },

        presencas: {
            type: [presencaAlunoSchema],
            required: true
        },

        registadoPor: {
            type: String,
            default: "professor"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Presenca", presencaSchema);