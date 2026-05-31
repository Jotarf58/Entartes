require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Falta MONGO_URI no .env");
  process.exit(1);
}

const professorId = "69fe4da087afa30ed6dad15a";
const professorNome = "Diana Sá Carneiro";

async function main() {
  await mongoose.connect(MONGO_URI);

  console.log("✅ Ligado ao MongoDB");
  console.log("Database:", mongoose.connection.name);

  const origem = mongoose.connection.db.collection("aulasemanais");
  const destino = mongoose.connection.db.collection("aulasemanals");

  const aulasDiana = await origem
    .find({
      professorId,
    })
    .toArray();

  console.log(`Aulas encontradas em aulasemanais: ${aulasDiana.length}`);

  if (aulasDiana.length === 0) {
    console.log("❌ Não encontrei aulas da Diana na collection aulasemanais.");
    await mongoose.disconnect();
    return;
  }

  for (const aula of aulasDiana) {
    const doc = {
      codigo: aula.codigo,
      diaSemana: aula.diaSemana,
      horaInicio: aula.horaInicio,
      horaFim: aula.horaFim,
      modalidade: aula.modalidade,
      turmaId: aula.turmaId,
      turma: aula.turma,
      turmaNome: aula.turmaNome,
      professorId,
      professorNome,
      salaId: aula.salaId,
      estudioId: aula.estudioId,
      salaNome: aula.salaNome,
      estudioNome: aula.estudioNome,
      faixaEtaria: aula.faixaEtaria,
      idade: aula.idade,
      vagas: aula.vagas ?? 14,
      capacidade: aula.capacidade ?? aula.vagas ?? 14,
      inscritos: aula.inscritos ?? 0,
      alunosIds: aula.alunosIds ?? [],
      estado: aula.estado ?? "ATIVA",
      updatedAt: new Date(),
    };

    await destino.updateOne(
      { codigo: doc.codigo },
      {
        $set: doc,
        $setOnInsert: {
          createdAt: aula.createdAt ?? new Date(),
        },
      },
      { upsert: true }
    );
  }

  const totalDestino = await destino.countDocuments({
    professorId,
  });

  console.log(`✅ Aulas copiadas para aulasemanals: ${aulasDiana.length}`);
  console.log(`✅ Total aulas da Diana em aulasemanals: ${totalDestino}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("❌ Erro:", error);
  await mongoose.disconnect();
  process.exit(1);
});