const mongoose = require("mongoose");

const pedidoCoachingSchema = new mongoose.Schema(
    {
        alunoId: { type: String, required: true },
        alunoNome: { type: String, default: "", trim: true },
        tipoAluno: { type: String, enum: ["CRIANCA_JOVEM", "ADULTO"], default: "CRIANCA_JOVEM" },
        encarregadoId: { type: String, default: null },
        encarregadoNome: { type: String, default: "", trim: true },
        modalidade: { type: String, required: true, trim: true },
        professorId: { type: String, default: null },
        professorNome: { type: String, default: "", trim: true },
        professorPreferencialId: { type: String, default: null },
        professorPreferencialNome: { type: String, default: "", trim: true },
        professoresInteressados: [{ type: String }],
        tipoCoaching: { type: String, enum: ["Individual", "Grupo"], default: "Individual" },
        duracaoMinutos: { type: Number, default: 60 },
        outrosAlunosSugeridos: { type: String, default: "", trim: true },
        preferenciaHorario: { type: String, default: "", trim: true },
        observacoes: { type: String, default: "", trim: true },
        notas: { type: String, default: "", trim: true },
        salaId: { type: String, default: null },
        salaNome: { type: String, default: "", trim: true },
        horarioFinal: { type: String, default: "", trim: true },
        vagaId: { type: String, default: null },
        estado: {
            type: String,
            enum: [
                "PENDENTE",
                "EM_ANALISE",
                "AGENDADO",
                "APROVADO",
                "REJEITADO",
                "INTERESSE_REGISTADO",
                "ACEITE_PROFESSOR",
                "AGUARDA_ALUNO"
            ],
            default: "PENDENTE"
        },
        motivoRejeicao: { type: String, default: "", trim: true }
    },
    { timestamps: true }
);

pedidoCoachingSchema.pre("validate", function () {
    if (!this.notas && this.observacoes) this.notas = this.observacoes;
    if (!this.observacoes && this.notas) this.observacoes = this.notas;
    if (!this.professorId && this.professorPreferencialId) this.professorId = this.professorPreferencialId;
    if (!this.professorPreferencialId && this.professorId) this.professorPreferencialId = this.professorId;
    if (!this.professorNome && this.professorPreferencialNome) this.professorNome = this.professorPreferencialNome;
    if (!this.professorPreferencialNome && this.professorNome) this.professorPreferencialNome = this.professorNome;
});

pedidoCoachingSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("PedidoCoaching", pedidoCoachingSchema);
