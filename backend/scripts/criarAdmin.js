require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UtilizadorModel = require("../src/infrastructure/database/models/UtilizadorModel");

async function criarAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Ligado ao MongoDB.");

        const email = "admin@entartes.pt";
        const existente = await UtilizadorModel.findOne({ email });

        if (existente) {
            console.log("Admin já existe.");
            await mongoose.disconnect();
            return;
        }

        const passwordHash = await bcrypt.hash("admin123", 10);

        const admin = await UtilizadorModel.create({
            nomeConta: "Administração Ent'artes",
            email,
            passwordHash,
            tipoConta: "ESCOLA",
            tiposUtilizador: ["ADMIN"],
            perfis: [
                {
                    nome: "Administração Ent'artes",
                    tipoPerfil: "ADMIN",
                    descricao: "Perfil administrativo com permissões totais.",
                    ativo: true
                }
            ],
            estado: "ATIVO"
        });

        console.log("Admin criado com sucesso:");
        console.log({ id: String(admin._id), email, password: "admin123" });
        await mongoose.disconnect();
    } catch (erro) {
        console.error("Erro ao criar admin:", erro);
        await mongoose.disconnect();
    }
}

criarAdmin();
