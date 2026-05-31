const mongoose = require("mongoose");

const diasSemana = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo",
    "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"
];

const aulaSemanalSchema = new mongoose.Schema(
    {
        diaSemana: { type: String, enum: diasSemana, required: true },
        horaInicio: { type: String, required: true, trim: true },
        horaFim: { type: String, required: true, trim: true },
        modalidade: { type: String, required: true, trim: true },
        turmaId: { type: String, default: null },
        turma: { type: String, required: true, trim: true },
        professorId: { type: String, required: true },
        professorNome: { type: String, required: true, trim: true },
        salaId: { type: String, default: null },
        salaNome: { type: String, required: true, trim: true },
        faixaEtaria: { type: String, default: "Crianças/Jovens", trim: true },
        idade: { type: String, default: "", trim: true },
        tipo: { type: String, default: "Aula regular", trim: true },
        vagas: { type: Number, required: true, min: 0, default: 0 },
        inscritos: { type: Number, required: true, min: 0, default: 0 },
        estado: { type: String, enum: ["ATIVA", "RASCUNHO", "CANCELADA"], default: "ATIVA" }
    },
    { timestamps: true }
);

aulaSemanalSchema.pre("validate", function () {
    if (this.horaInicio && this.horaFim && this.horaInicio >= this.horaFim) {
        throw new Error("A hora de início deve ser anterior à hora de fim.");
    }
    if (this.inscritos > this.vagas) {
        throw new Error("O número de inscritos não pode ser superior ao número de vagas.");
    }
});

aulaSemanalSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        ret.faixaEtaria = ret.faixaEtaria || ret.idade || "";
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("AulaSemanal", aulaSemanalSchema);
