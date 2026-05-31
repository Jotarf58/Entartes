const mongoose = require("mongoose");

const sessaoCoachingSchema = new mongoose.Schema(
    {
        professorId: {
            type: String,
            required: true
        },

        alunosIds: {
            type: [String],
            required: true,
            validate: {
                validator: function (alunos) {
                    return alunos.length <= 8;
                },
                message: "Uma sessão de coaching não pode ter mais de 8 alunos."
            }
        },

        modalidade: {
            type: String,
            default: ""
        },

        estudioId: {
            type: String,
            default: null
        },

        dataInicio: {
            type: Date,
            default: null
        },

        dataFim: {
            type: Date,
            default: null
        },

        duracaoMinutos: {
            type: Number,
            required: true,
            min: 30,
            max: 120
        },

        estado: {
            type: String,
            enum: [
                "AGUARDA_VALIDACAO",
                "AGUARDA_DIRECAO",
                "FATURADA",
                "REAGENDADA",
                "CANCELADA"
            ],
            default: "AGUARDA_VALIDACAO"
        },

        valorFaturado: {
            type: Number,
            default: null
        },

        motivoCancelamento: {
            type: String,
            default: ""
        },

        dataCancelamento: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SessaoCoaching", sessaoCoachingSchema);