require("dotenv").config();

const mongoose = require("mongoose");
const AulaSemanalModel = require("../src/infrastructure/database/models/AulaSemanalModel");

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error("Define MONGO_URI no .env antes de correr este script.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB ligado. Database:", mongoose.connection.name);

    const antes = await AulaSemanalModel.countDocuments();
    console.log(`Aulas existentes na coleção 'aulasemanals': ${antes}`);

    const resultado = await AulaSemanalModel.deleteMany({});
    console.log(`Aulas removidas de 'aulasemanals': ${resultado.deletedCount}`);

    try {
        const colecoes = await mongoose.connection.db
            .listCollections({ name: "aulasemanais" })
            .toArray();

        if (colecoes.length > 0) {
            const res = await mongoose.connection.db
                .collection("aulasemanais")
                .deleteMany({});
            console.log(`Aulas removidas da coleção antiga 'aulasemanais': ${res.deletedCount}`);
        }
    } catch (erro) {
        console.log("Sem coleção antiga 'aulasemanais'.");
    }

    await mongoose.disconnect();
    console.log("Concluído. O horário fica vazio; cria as aulas reais na coordenação.");
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
