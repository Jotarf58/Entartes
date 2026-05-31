require("dotenv").config();

const mongoose = require("mongoose");

const TurmaModel = require("../src/infrastructure/database/models/TurmaModel");
const AulaSemanalModel = require("../src/infrastructure/database/models/AulaSemanalModel");

async function criarDadosHorario() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Ligado ao MongoDB.");

        const totalTurmas = await TurmaModel.countDocuments();
        const totalAulas = await AulaSemanalModel.countDocuments();

        if (totalTurmas > 0 || totalAulas > 0) {
            console.log("Já existem turmas ou aulas semanais na base de dados.");
            console.log("Nenhum dado foi criado para evitar duplicados.");
            await mongoose.disconnect();
            return;
        }

        const turmasCriadas = await TurmaModel.insertMany([
            {
                nome: "Ballet Preparatório 1",
                modalidade: "Ballet",
                nivel: "Preparatório",
                faixaEtaria: "Crianças/Jovens",
                professorId: "professora-ana",
                professorNome: "Ana Martins",
                salaNome: "Estúdio 1",
                vagas: 18,
                alunosInscritos: ["aluno1", "aluno2", "aluno3"],
                estado: "ATIVA"
            },
            {
                nome: "Hip-Hop Juvenil",
                modalidade: "Hip-Hop",
                nivel: "Juvenil",
                faixaEtaria: "Jovens",
                professorId: "professor-ricardo",
                professorNome: "Ricardo Lopes",
                salaNome: "Estúdio 2",
                vagas: 20,
                alunosInscritos: ["aluno4", "aluno5"],
                estado: "ATIVA"
            },
            {
                nome: "Contemporâneo Adultos",
                modalidade: "Contemporâneo",
                nivel: "Adultos",
                faixaEtaria: "Adultos",
                professorId: "professora-sofia",
                professorNome: "Sofia Costa",
                salaNome: "Estúdio 3",
                vagas: 16,
                alunosInscritos: [],
                estado: "ATIVA"
            }
        ]);

        const ballet = turmasCriadas[0];
        const hiphop = turmasCriadas[1];
        const contemporaneo = turmasCriadas[2];

        await AulaSemanalModel.insertMany([
            {
                diaSemana: "Segunda",
                horaInicio: "18:00",
                horaFim: "19:00",
                modalidade: ballet.modalidade,
                turmaId: String(ballet._id),
                turma: ballet.nome,
                professorId: ballet.professorId,
                professorNome: ballet.professorNome,
                salaNome: ballet.salaNome,
                faixaEtaria: ballet.faixaEtaria,
                vagas: ballet.vagas,
                inscritos: ballet.alunosInscritos.length,
                estado: "ATIVA"
            },
            {
                diaSemana: "Quarta",
                horaInicio: "18:00",
                horaFim: "19:00",
                modalidade: ballet.modalidade,
                turmaId: String(ballet._id),
                turma: ballet.nome,
                professorId: ballet.professorId,
                professorNome: ballet.professorNome,
                salaNome: ballet.salaNome,
                faixaEtaria: ballet.faixaEtaria,
                vagas: ballet.vagas,
                inscritos: ballet.alunosInscritos.length,
                estado: "ATIVA"
            },
            {
                diaSemana: "Terça",
                horaInicio: "19:00",
                horaFim: "20:00",
                modalidade: hiphop.modalidade,
                turmaId: String(hiphop._id),
                turma: hiphop.nome,
                professorId: hiphop.professorId,
                professorNome: hiphop.professorNome,
                salaNome: hiphop.salaNome,
                faixaEtaria: hiphop.faixaEtaria,
                vagas: hiphop.vagas,
                inscritos: hiphop.alunosInscritos.length,
                estado: "ATIVA"
            },
            {
                diaSemana: "Quinta",
                horaInicio: "20:00",
                horaFim: "21:30",
                modalidade: contemporaneo.modalidade,
                turmaId: String(contemporaneo._id),
                turma: contemporaneo.nome,
                professorId: contemporaneo.professorId,
                professorNome: contemporaneo.professorNome,
                salaNome: contemporaneo.salaNome,
                faixaEtaria: contemporaneo.faixaEtaria,
                vagas: contemporaneo.vagas,
                inscritos: contemporaneo.alunosInscritos.length,
                estado: "ATIVA"
            }
        ]);

        console.log("Dados de horário criados com sucesso.");

        await mongoose.disconnect();
    } catch (erro) {
        console.error("Erro ao criar dados de horário:", erro.message);
        await mongoose.disconnect();
    }
}

criarDadosHorario();