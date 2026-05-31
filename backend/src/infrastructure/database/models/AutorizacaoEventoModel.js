const mongoose = require("mongoose");

const autorizacaoEventoSchema = new mongoose.Schema(
    {
        eventoId: { type: String, required: true },
        utilizadorId: { type: String, default: null },
        perfilId: { type: String, default: null },
        alunoId: { type: String, default: null },
        alunoNome: { type: String, default: "", trim: true },
        encarregadoNome: { type: String, default: "", trim: true },
        estado: { type: String, enum: ["PENDENTE", "AUTORIZADO", "RECUSADO"], default: "AUTORIZADO" },
        observacoes: { type: String, default: "", trim: true },
        dataConfirmacao: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

autorizacaoEventoSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("AutorizacaoEvento", autorizacaoEventoSchema);
