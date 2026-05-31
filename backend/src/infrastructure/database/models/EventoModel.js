const mongoose = require("mongoose");

const apresentacaoSchema = new mongoose.Schema(
    {
        titulo: { type: String, default: "", trim: true },
        modalidade: { type: String, default: "", trim: true },
        turma: { type: String, default: "", trim: true },
        hora: { type: String, default: "", trim: true },
        observacoes: { type: String, default: "", trim: true }
    },
    { _id: true }
);

const eventoSchema = new mongoose.Schema(
    {
        titulo: { type: String, required: true, trim: true },
        descricao: { type: String, default: "", trim: true },
        data: { type: Date, required: true },
        local: { type: String, default: "", trim: true },
        estado: {
            type: String,
            enum: ["ATIVO", "RASCUNHO", "CANCELADO", "ARQUIVADO", "CONCLUIDO"],
            default: "ATIVO"
        },
        apresentacoes: { type: [apresentacaoSchema], default: [] },
        formularioUrl: { type: String, default: "", trim: true },
        figurino: { type: String, default: "", trim: true },
        acessorios: { type: String, default: "", trim: true },
        penteado: { type: String, default: "", trim: true },
        maquilhagem: { type: String, default: "", trim: true },
        observacoes: { type: String, default: "", trim: true }
    },
    { timestamps: true }
);

eventoSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Evento", eventoSchema);
