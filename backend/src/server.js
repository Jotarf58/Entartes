// src/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectMongoDB = require('./infrastructure/database/mongo');
//_________________________________
//ROTAS
//_________________________________
// Importar as rotas de coaching
const coachingRoutes = require('./infrastructure/routes/coachingRoutes');
// Importar as rotas de estudio
const estudioRoutes = require('./infrastructure/routes/estudioRoutes');
// Importar rotas de invetario
const inventarioRoutes = require('./infrastructure/routes/inventarioRoutes');
// Importar rotas de turma  
const turmaRoutes = require('./infrastructure/routes/turmaRoutes');
// Importar rotas de pedidos coaching
const pedidoCoachingRoutes = require("./infrastructure/routes/pedidoCoachingRoutes");
// Importar rotas dos alunos
const alunoRoutes = require("./infrastructure/routes/alunoRoutes");
// Importar rotas das sessões
const sessaoRoutes = require("./infrastructure/routes/sessaoRoutes");
// Importar rotas dos eventos
const eventoRoutes = require("./infrastructure/routes/eventoRoutes");
// Importar rotas dos registos financeiros
const financeiroRoutes = require("./infrastructure/routes/financeiroRoutes");
// Importar rotas das vagas
const vagaRoutes = require("./infrastructure/routes/vagaRoutes");
// Importar rotas de logins
const authRoutes = require("./infrastructure/routes/authRoutes");

const horarioRoutes = require("./infrastructure/routes/horarioRoutes");
const interrupcaoRoutes = require("./infrastructure/routes/interrupcaoRoutes");
const referenciaRoutes = require("./infrastructure/routes/referenciaRoutes");
const dashboardRoutes = require("./infrastructure/routes/dashboardRoutes");



// Inicializa a aplicação Express
const app = express();

// Configurações base
app.use(cors());
app.use(express.json());

// Ligar à base de dados MongoDB
connectMongoDB();

// Teste
app.get('/api/teste', (req, res) => {
    res.json({ mensagem: "Olá do teu novo Backend! A escola Ent'artes está online! 🩰" });
});

// Ligar as rotas ao Express
app.use('/api/coaching', coachingRoutes);
app.use('/api/estudios', estudioRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/turmas', turmaRoutes);
app.use("/api/pedidos-coaching", pedidoCoachingRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/sessoes", sessaoRoutes);
app.use("/api/eventos", eventoRoutes);
app.use("/api/financeiro", financeiroRoutes);
app.use("/api/vagas", vagaRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/horario", horarioRoutes);
app.use("/api/interrupcoes", interrupcaoRoutes);
app.use("/api", referenciaRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Define a porta onde o servidor vai correr
const PORT = process.env.PORT || 3000;

console.log("Rotas de Turmas carregadas:", turmaRoutes.stack.map(r => r.route?.path));

app.listen(PORT, () => {    
    console.log(`Servidor a correr na porta ${PORT}!`);
});