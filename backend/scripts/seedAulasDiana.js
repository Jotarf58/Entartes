require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Falta MONGO_URI no .env");
  process.exit(1);
}

const professorId = "69fe4da087afa30ed6dad15a";
const professorNome = "Diana Sá Carneiro";

const aulas = [
  {
    codigo: "AULA-DIANA-BALLET-SEG-1800",
    diaSemana: "Segunda-feira",
    horaInicio: "18:00",
    horaFim: "19:00",
    modalidade: "Ballet",
    turma: "Ballet Iniciação - Diana",
    turmaNome: "Ballet Iniciação - Diana",
    professorId,
    professorNome,
    salaNome: "Estúdio 1",
    faixaEtaria: "6-9 anos",
    vagas: 14,
    inscritos: 0,
    estado: "ATIVA",
  },
  {
    codigo: "AULA-DIANA-BALLET-QUA-1800",
    diaSemana: "Quarta-feira",
    horaInicio: "18:00",
    horaFim: "19:00",
    modalidade: "Ballet",
    turma: "Ballet Iniciação - Diana",
    turmaNome: "Ballet Iniciação - Diana",
    professorId,
    professorNome,
    salaNome: "Estúdio 1",
    faixaEtaria: "6-9 anos",
    vagas: 14,
    inscritos: 0,
    estado: "ATIVA",
  },
  {
    codigo: "AULA-DIANA-JAZZ-TER-1900",
    diaSemana: "Terça-feira",
    horaInicio: "19:00",
    horaFim: "20:00",
    modalidade: "Jazz",
    turma: "Jazz Juvenil - Diana",
    turmaNome: "Jazz Juvenil - Diana",
    professorId,
    professorNome,
    salaNome: "Estúdio 2",
    faixaEtaria: "10-14 anos",
    vagas: 16,
    inscritos: 0,
    estado: "ATIVA",
  },
  {
    codigo: "AULA-DIANA-JAZZ-QUI-1900",
    diaSemana: "Quinta-feira",
    horaInicio: "19:00",
    horaFim: "20:00",
    modalidade: "Jazz",
    turma: "Jazz Juvenil - Diana",
    turmaNome: "Jazz Juvenil - Diana",
    professorId,
    professorNome,
    salaNome: "Estúdio 2",
    faixaEtaria: "10-14 anos",
    vagas: 16,
    inscritos: 0,
    estado: "ATIVA",
  },
  {
    codigo: "AULA-DIANA-CONTEMPORANEO-SAB-1100",
    diaSemana: "Sábado",
    horaInicio: "11:00",
    horaFim: "12:30",
    modalidade: "Dança Contemporânea",
    turma: "Contemporâneo - Diana",
    turmaNome: "Contemporâneo - Diana",
    professorId,
    professorNome,
    salaNome: "Estúdio 3",
    faixaEtaria: "15+ anos",
    vagas: 18,
    inscritos: 0,
    estado: "ATIVA",
  },
];

async function main() {
  await mongoose.connect(MONGO_URI, {
    dbName: "test",
  });

  console.log("✅ MongoDB ligado.");
  console.log("Database atual:", mongoose.connection.name);

  const collection = mongoose.connection.db.collection("aulasemanais");

  for (const aula of aulas) {
    await collection.updateOne(
      { codigo: aula.codigo },
      {
        $set: {
          ...aula,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  const totalDiana = await collection.countDocuments({
    professorId,
  });

  console.log(`✅ Aulas da Diana criadas/atualizadas: ${aulas.length}`);
  console.log(`✅ Total aulas da Diana na database "${mongoose.connection.name}": ${totalDiana}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("❌ Erro:", error);
  await mongoose.disconnect();
  process.exit(1);
});