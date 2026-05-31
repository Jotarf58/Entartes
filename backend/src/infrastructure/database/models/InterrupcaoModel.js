const mongoose = require("mongoose");

const interrupcaoSchema = new mongoose.Schema(
    {
        data: { type: Date, required: true },
        dataFim: { type: Date, default: null },
        nome: { type: String, required: true, trim: true },
        tipo: { type: String, enum: ["FERIADO", "INTERRUPCAO", "EVENTO", "OUTRO"], default: "FERIADO" },
        escolaEncerrada: { type: Boolean, default: true },
        observacoes: { type: String, default: "", trim: true }
    },
    { timestamps: true }
);

interrupcaoSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Interrupcao", interrupcaoSchema);
