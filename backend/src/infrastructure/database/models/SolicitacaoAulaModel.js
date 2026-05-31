const mongoose = require("mongoose");

const solicitacaoAulaSchema = new mongoose.Schema(
    {
        aulaId: { type: String, required: true },
        utilizadorId: { type: String, default: null },
        perfilId: { type: String, default: null },
        perfilNome: { type: String, default: "", trim: true },
        tipo: { type: String, enum: ["INSCRICAO", "ALTERACAO"], required: true },
        mensagem: { type: String, default: "", trim: true },
        estado: { type: String, enum: ["PENDENTE", "ACEITE", "REJEITADA"], default: "PENDENTE" }
    },
    { timestamps: true }
);

solicitacaoAulaSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("SolicitacaoAula", solicitacaoAulaSchema);
