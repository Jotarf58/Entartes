const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

const UtilizadorModel = require("../src/infrastructure/database/models/UtilizadorModel");

async function criarOuAtualizarUtilizador({
  nomeConta,
  email,
  password,
  pinEncarregado,
  tipoConta,
  perfis,
  estado = "ATIVO"
}) {
  const passwordHash = await bcrypt.hash(password, 10);

  const temEncarregado = perfis.some(
    (perfil) => perfil.tipoPerfil === "ENCARREGADO"
  );

  const pinEncarregadoHash =
    temEncarregado && pinEncarregado
      ? await bcrypt.hash(String(pinEncarregado), 10)
      : null;

  const tiposUtilizador = [...new Set(perfis.map((perfil) => perfil.tipoPerfil))];

  const utilizador = await UtilizadorModel.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      nomeConta,
      email: email.toLowerCase().trim(),
      passwordHash,
      pinEncarregadoHash,
      tipoConta,
      tiposUtilizador,
      perfis,
      estado
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  return utilizador;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI não encontrada no ficheiro .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB ligado.");

    const professor = await criarOuAtualizarUtilizador({
    nomeConta: "Diana Sá Carneiro",
    email: "diana.sacarneiro@entartes.pt",
    password: "diana123",
    tipoConta: "FUNCIONARIO",
    perfis: [
        {
        nome: "Diana Sá Carneiro",
        tipoPerfil: "PROFESSOR",
        descricao: "Professora",
        observacoes: "",
        ativo: true
        }
    ]
    });

  const familia = await criarOuAtualizarUtilizador({
    nomeConta: "Família Silva",
    email: "familia.silva@entartes.pt",
    password: "familia123",
    pinEncarregado: "1234",
    tipoConta: "FAMILIAR",
    perfis: [
      {
        nome: "João Silva",
        tipoPerfil: "ENCARREGADO",
        descricao: "Encarregado de educação",
        observacoes: "",
        ativo: true
      },
      {
        nome: "Marta Silva",
        tipoPerfil: "ALUNO",
        descricao: "Educando / aluno associado",
        observacoes: "",
        ativo: true
      }
    ]
  });

  console.log("\nUtilizadores criados/atualizados com sucesso!\n");

    console.log("Professor:");
    console.log({
    email: "diana.sacarneiro@entartes.pt",
    password: "diana123",
    contaId: String(professor._id),
    perfis: professor.perfis.map((perfil) => ({
        perfilId: String(perfil._id),
        nome: perfil.nome,
        tipoPerfil: perfil.tipoPerfil
    }))
    });

  console.log("\nFamília / Encarregado + Aluno:");
  console.log({
    email: "familia.silva@entartes.pt",
    password: "familia123",
    pinEncarregado: "1234",
    contaId: String(familia._id),
    perfis: familia.perfis.map((perfil) => ({
      perfilId: String(perfil._id),
      nome: perfil.nome,
      tipoPerfil: perfil.tipoPerfil
    }))
  });

  await mongoose.disconnect();
  console.log("\nFeito.");
}

main().catch(async (error) => {
  console.error("Erro ao criar utilizadores:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});