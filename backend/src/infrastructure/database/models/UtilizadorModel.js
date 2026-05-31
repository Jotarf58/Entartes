const mongoose = require("mongoose");

const TIPOS_PERFIL = ["ALUNO", "ENCARREGADO", "PROFESSOR", "DIRECAO", "ADMIN"];

const perfilSchema = new mongoose.Schema(
    {
        nome: { type: String, required: true, trim: true },
        tipoPerfil: { type: String, enum: TIPOS_PERFIL, required: true },
        descricao: { type: String, default: "", trim: true },
        ativo: { type: Boolean, default: true },
        observacoes: { type: String, default: "", trim: true }
    },
    { _id: true }
);

const utilizadorSchema = new mongoose.Schema(
    {
        nomeConta: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
        pinEncarregadoHash: { type: String, default: null, select: false },
        tipoConta: {
            type: String,
            enum: ["INDIVIDUAL", "FAMILIAR", "FUNCIONARIO", "ESCOLA"],
            default: "INDIVIDUAL"
        },
        tiposUtilizador: { type: [String], enum: TIPOS_PERFIL, default: [] },
        perfis: {
            type: [perfilSchema],
            required: true,
            validate: {
                validator: function (perfis) {
                    return Array.isArray(perfis) && perfis.length > 0;
                },
                message: "A conta deve ter pelo menos um perfil."
            }
        },
        estado: { type: String, enum: ["ATIVO", "INATIVO"], default: "ATIVO" }
    },
    { timestamps: true }
);

utilizadorSchema.set("toJSON", {
    transform: function (doc, ret) {
        ret.id = String(ret._id);
        ret.perfisDisponiveis = (ret.perfis || [])
            .filter((perfil) => perfil.ativo !== false)
            .map((perfil) => ({
                id: String(perfil._id),
                perfilId: String(perfil._id),
                nome: perfil.nome,
                tipoPerfil: perfil.tipoPerfil,
                descricao: perfil.descricao || perfil.observacoes || ""
            }));

        delete ret.passwordHash;
        delete ret.pinEncarregadoHash;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Utilizador", utilizadorSchema);
