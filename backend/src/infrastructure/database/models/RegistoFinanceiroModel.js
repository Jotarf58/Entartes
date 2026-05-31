const mongoose = require("mongoose");

const registoFinanceiroSchema = new mongoose.Schema(
    {
        tipo: {
            type: String,
            required: true,
            trim: true
        },

        descricao: {
            type: String,
            required: true,
            trim: true
        },

        valor: {
            type: Number,
            required: true,
            min: 0
        },

        data: {
            type: Date,
            default: Date.now
        },

        origem: {
            type: String,
            enum: ["COACHING", "INVENTARIO", "MANUAL"],
            default: "MANUAL"
        },

        origemId: {
            type: String,
            default: null
        },

        estado: {
            type: String,
            enum: ["PENDENTE", "FATURADO", "CANCELADO"],
            default: "FATURADO"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("RegistoFinanceiro", registoFinanceiroSchema);