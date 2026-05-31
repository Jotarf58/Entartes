require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UtilizadorModel = require("../src/infrastructure/database/models/UtilizadorModel");

async function criarAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Ligado ao MongoDB.");

        const emailAdmin = "admin@entartes.pt";

        const adminExistente = await UtilizadorModel.findOne({
            email: emailAdmin
        });

        if (adminExistente) {
            console.log("Admin já existe.");
            await mongoose.disconnect();
            return;
        }

        const passwordHash = await bcrypt.hash("admin123", 10);

        const admin = await UtilizadorModel.create({
            nomeConta: "Administrador",
            email: emailAdmin,
            passwordHash,
            tipoConta: "FUNCIONARIO",
            tiposUtilizador: ["ADMIN"],
            perfis: [
                {
                    nome: "Administrador",
                    tipoPerfil: "ADMIN",
                    ativo: true
                }
            ],
            estado: "ATIVO"
        });

        console.log("Admin criado com sucesso:");
        console.log({
            id: admin._id,
            email: admin.email,
            password: "admin123"
        });

        await mongoose.disconnect();
    } catch (erro) {
        console.error("Erro ao criar admin:", erro.message);
        await mongoose.disconnect();
    }
}

criarAdmin();