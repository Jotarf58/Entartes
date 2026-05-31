const mongoose = require("mongoose");

const turmaSchema = new mongoose.Schema(
    {
        nome: { type: String, required: true, trim: true },
        modalidade: { type: String, required: true, trim: true },
        nivel: { type: String, default: "", trim: true },
        faixaEtaria: { type: String, default: "Crianças/Jovens", trim: true },
        idade: { type: String, default: "", trim: true },
        professorId: { type: String, default: null },
        professorNome: { type: String, default: "", trim: true },
        salaId: { type: String, default: null },
        salaNome: { type: String, default: "", trim: true },
        vagas: { type: Number, required: true, min: 0, default: 0 },
        alunosInscritos: { type: [String], default: [] },
        estado: { type: String, enum: ["ATIVA", "INATIVA", "LOTADA"], default: "ATIVA" }
    },
    { timestamps: true }
);

turmaSchema.methods.temVaga = function () {
    return this.alunosInscritos.length < this.vagas;
};

turmaSchema.methods.adicionarAluno = function (alunoId) {
    if (!alunoId) throw new Error("O aluno é obrigatório.");
    if (!this.temVaga()) throw new Error("Operação recusada: a turma já atingiu a lotação máxima.");
    if (this.alunosInscritos.includes(alunoId)) throw new Error("O aluno já está inscrito nesta turma.");
    this.alunosInscritos.push(alunoId);
    if (this.alunosInscritos.length >= this.vagas) this.estado = "LOTADA";
};

turmaSchema.methods.removerAluno = function (alunoId) {
    this.alunosInscritos = this.alunosInscritos.filter((id) => id !== alunoId);
    if (this.estado === "LOTADA" && this.alunosInscritos.length < this.vagas) this.estado = "ATIVA";
};

turmaSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        ret.turma = ret.nome;
        ret.inscritos = Array.isArray(ret.alunosInscritos) ? ret.alunosInscritos.length : 0;
        ret.faixaEtaria = ret.faixaEtaria || ret.idade || "";
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Turma", turmaSchema);
