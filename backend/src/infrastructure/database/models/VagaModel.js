const mongoose = require("mongoose");

const vagaSchema = new mongoose.Schema(
    {
        professorId: { type: String, required: true },
        professorNome: { type: String, default: "", trim: true },
        modalidade: { type: String, required: true, trim: true },
        repeticao: {
            type: String,
            enum: ["NAO_REPETIR", "DIARIA", "SEMANAL", "MENSAL"],
            default: "NAO_REPETIR"
        },
        diaSemana: { type: String, default: "", trim: true },
        estudioId: { type: String, default: null },
        salaId: { type: String, default: null },
        salaNome: { type: String, default: "", trim: true },
        data: { type: String, default: "" },
        dataInicio: { type: String, default: "" },
        dataFim: { type: String, default: "" },
        horaInicio: { type: String, required: true, trim: true },
        horaFim: { type: String, required: true, trim: true },
        estado: { type: String, enum: ["ABERTA", "FECHADA", "CANCELADA", "OCUPADA"], default: "ABERTA" }
    },
    { timestamps: true }
);

vagaSchema.pre("validate", function () {
    if (this.horaInicio && this.horaFim && this.horaInicio >= this.horaFim) {
        throw new Error("A hora de início deve ser anterior à hora de fim.");
    }
    if (!this.dataInicio && this.data) this.dataInicio = this.data;
    if (!this.data && this.dataInicio) this.data = this.dataInicio;
    if (!this.salaId && this.estudioId) this.salaId = this.estudioId;
    if (!this.estudioId && this.salaId) this.estudioId = this.salaId;
});

vagaSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Vaga", vagaSchema);
