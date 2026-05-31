require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI não existe no .env");
    process.exit(1);
  }

  console.log("MONGO_URI começa por:");
  console.log(process.env.MONGO_URI.slice(0, 80) + "...");

  await mongoose.connect(process.env.MONGO_URI);

  console.log("✅ Ligado");
  console.log("Database:", mongoose.connection.name);
  console.log("Host:", mongoose.connection.host);
  console.log("Port:", mongoose.connection.port);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections nesta BD:");
  console.log(collections.map((c) => c.name));

  const aulas = mongoose.connection.db.collection("aulasemanais");

  const total = await aulas.countDocuments();
  const totalDiana = await aulas.countDocuments({
    professorId: "69fe4da087afa30ed6dad15a",
  });

  console.log("Total aulasemanais:", total);
  console.log("Total aulas Diana:", totalDiana);

  const exemploDiana = await aulas.findOne({
    professorId: "69fe4da087afa30ed6dad15a",
  });

  console.log("Exemplo Diana:", exemploDiana);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("❌ Erro:", error);
  await mongoose.disconnect();
  process.exit(1);
});