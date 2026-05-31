const mongoose = require("mongoose");

const requisicaoSchema = new mongoose.Schema(
    {
        utilizadorId: { type: String, required: true },
        perfilId: { type: String, default: null },
        perfilNome: { type: String, default: "", trim: true },
        mensagem: { type: String, default: "" },
        dataInicio: { type: Date, default: null },
        dataFim: { type: Date, default: null },
        estado: { type: String, enum: ["PENDENTE", "ACEITE", "REJEITADA"], default: "PENDENTE" },
        dataRequisicao: { type: Date, default: Date.now }
    },
    { _id: true }
);

const itemInventarioSchema = new mongoose.Schema(
    {
        nome: { type: String, trim: true, default: "" },
        titulo: { type: String, trim: true, default: "" },
        descricao: { type: String, required: true, trim: true },
        tipo: {
            type: String,
            enum: ["FIGURINO", "ACESSORIO", "CALCADO", "MAQUILHAGEM", "OUTRO"],
            default: "OUTRO"
        },
        modalidade: { type: String, default: "", trim: true },
        tamanho: { type: String, default: "", trim: true },
        estadoConservacao: { type: String, required: true, trim: true },
        tipoTransacao: { type: String, enum: ["ALUGAR", "VENDER", "REQUISITAR"], default: "REQUISITAR" },
        preco: { type: Number, default: 0, min: 0 },
        taxaSimbolica: { type: Number, default: 0, min: 0 },
        utilizadorId: { type: String, required: true },
        origem: { type: String, enum: ["ESCOLA", "ENCARREGADO", "ALUNO"], default: "ENCARREGADO" },
        dataInicioDisponibilidade: { type: Date, default: null },
        dataFimDisponibilidade: { type: Date, default: null },
        imagemUrl: { type: String, default: "", trim: true },
        estadoAnuncio: {
            type: String,
            enum: ["PUBLICADO", "ATIVO", "RESERVADO", "CONCLUIDO", "INATIVO", "ENCERRADO"],
            default: "ATIVO"
        },
        requisicoes: { type: [requisicaoSchema], default: [] }
    },
    { timestamps: true }
);

itemInventarioSchema.pre("validate", function () {
    if (!this.nome && this.titulo) this.nome = this.titulo;
    if (!this.titulo && this.nome) this.titulo = this.nome;
    if (!this.nome && !this.titulo) throw new Error("O nome/título do item é obrigatório.");
});

itemInventarioSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        ret.nome = ret.nome || ret.titulo;
        ret.titulo = ret.titulo || ret.nome;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("ItemInventario", itemInventarioSchema);
