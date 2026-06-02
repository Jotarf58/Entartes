require("dotenv").config();

const mongoose = require("mongoose");

const AulaSemanalModel = require("../src/infrastructure/database/models/AulaSemanalModel");
const PedidoCoachingModel = require("../src/infrastructure/database/models/PedidoCoachingModel");
const VagaModel = require("../src/infrastructure/database/models/VagaModel");
const ItemInventarioModel = require("../src/infrastructure/database/models/ItemInventarioModel");
const EventoModel = require("../src/infrastructure/database/models/EventoModel");
const InterrupcaoModel = require("../src/infrastructure/database/models/InterrupcaoModel");
const TurmaModel = require("../src/infrastructure/database/models/TurmaModel");

const PROFESSORES_DEMO = ["prof_ana_luis", "prof_daniela"];

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error("Define MONGO_URI no .env antes de correr este script.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB ligado. Database:", mongoose.connection.name);

    const aulas = await AulaSemanalModel.deleteMany({
        professorId: { $in: PROFESSORES_DEMO }
    });
    console.log(`Aulas demo removidas: ${aulas.deletedCount}`);

    const pedidos = await PedidoCoachingModel.deleteMany({
        alunoId: "aluno_marta"
    });
    console.log(`Pedidos de coaching demo removidos: ${pedidos.deletedCount}`);

    const vagas = await VagaModel.deleteMany({
        professorId: { $in: PROFESSORES_DEMO }
    });
    console.log(`Vagas demo removidas: ${vagas.deletedCount}`);

    const itens = await ItemInventarioModel.deleteMany({
        utilizadorId: "demo"
    });
    console.log(`Itens de inventário demo removidos: ${itens.deletedCount}`);

    const eventos = await EventoModel.deleteMany({
        titulo: "Gala de Primavera"
    });
    console.log(`Eventos demo removidos: ${eventos.deletedCount}`);

    const interrupcoes = await InterrupcaoModel.deleteMany({
        nome: "Dia da Liberdade"
    });
    console.log(`Interrupções demo removidas: ${interrupcoes.deletedCount}`);

    const turmas = await TurmaModel.deleteMany({
        professorId: { $in: PROFESSORES_DEMO }
    });
    console.log(`Turmas demo removidas: ${turmas.deletedCount}`);

    await mongoose.disconnect();
    console.log("Concluído. A dashboard deixa de mostrar os dados demo.");
}

main().catch(async (erro) => {
    console.error("Erro:", erro.message);
    try {
        await mongoose.disconnect();
    } catch {
        // ignore
    }
    process.exit(1);
});
