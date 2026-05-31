require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UtilizadorModel = require("../src/infrastructure/database/models/UtilizadorModel");
const EstudioModel = require("../src/infrastructure/database/models/EstudioModel");
const TurmaModel = require("../src/infrastructure/database/models/TurmaModel");
const AulaSemanalModel = require("../src/infrastructure/database/models/AulaSemanalModel");
const PedidoCoachingModel = require("../src/infrastructure/database/models/PedidoCoachingModel");
const VagaModel = require("../src/infrastructure/database/models/VagaModel");
const ItemInventarioModel = require("../src/infrastructure/database/models/ItemInventarioModel");
const EventoModel = require("../src/infrastructure/database/models/EventoModel");
const InterrupcaoModel = require("../src/infrastructure/database/models/InterrupcaoModel");

async function criarContaSeNaoExiste({ email, nomeConta, tipoConta, perfis, password = "123456", pinEncarregado = null }) {
    const existente = await UtilizadorModel.findOne({ email });
    if (existente) return existente;

    const passwordHash = await bcrypt.hash(password, 10);
    const pinEncarregadoHash = pinEncarregado ? await bcrypt.hash(String(pinEncarregado), 10) : null;
    const tiposUtilizador = [...new Set(perfis.map((perfil) => perfil.tipoPerfil))];

    return await UtilizadorModel.create({
        nomeConta,
        email,
        passwordHash,
        pinEncarregadoHash,
        tipoConta,
        tiposUtilizador,
        perfis,
        estado: "ATIVO"
    });
}

async function criarDadosDemo() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Ligado ao MongoDB.");

        await criarContaSeNaoExiste({
            email: "familia.silva@entartes.pt",
            nomeConta: "Família Silva",
            tipoConta: "FAMILIAR",
            password: "123456",
            pinEncarregado: "4321",
            perfis: [
                { nome: "Marta Silva", tipoPerfil: "ALUNO", descricao: "Aluno menor." },
                { nome: "Diogo Ribeiro", tipoPerfil: "ALUNO", descricao: "Segundo aluno da família." },
                { nome: "João Silva", tipoPerfil: "ENCARREGADO", descricao: "Responsável familiar." }
            ]
        });

        const professores = [
            ["ana.luis@entartes.pt", "Ana Luís Gomes", "prof_ana_luis"],
            ["edson@entartes.pt", "Edson Nascimento", "prof_edson"],
            ["daniela@entartes.pt", "Daniela Fernandes", "prof_daniela"],
            ["sara@entartes.pt", "Sara Vilas Boas", "prof_sara"],
            ["filipe@entartes.pt", "Filipe Narciso", "prof_filipe"]
        ];

        for (const [email, nome] of professores) {
            await criarContaSeNaoExiste({
                email,
                nomeConta: nome,
                tipoConta: "INDIVIDUAL",
                password: "123456",
                perfis: [{ nome, tipoPerfil: "PROFESSOR", descricao: "Professor Ent'artes." }]
            });
        }

        await criarContaSeNaoExiste({
            email: "direcao@entartes.pt",
            nomeConta: "Coordenação Ent'artes",
            tipoConta: "ESCOLA",
            password: "123456",
            perfis: [{ nome: "Coordenação Ent'artes", tipoPerfil: "DIRECAO", descricao: "Perfil de coordenação." }]
        });

        if (await EstudioModel.countDocuments() === 0) {
            await EstudioModel.insertMany([
                { nome: "Estúdio 1", capacidade: 18, modalidadesPermitidas: ["Ballet", "Jazz"], estado: "ATIVO" },
                { nome: "Estúdio 2", capacidade: 20, modalidadesPermitidas: ["Acrodance", "Hip Hop"], estado: "ATIVO" },
                { nome: "Estúdio 3", capacidade: 16, modalidadesPermitidas: ["Dança Contemporânea"], estado: "ATIVO" },
                { nome: "Sala Sá de Miranda", capacidade: 80, modalidadesPermitidas: [], estado: "ATIVO" },
                { nome: "Espaço Vita", capacidade: 400, modalidadesPermitidas: [], estado: "ATIVO" }
            ]);
            console.log("Salas/estúdios criados.");
        }

        const estudos = await EstudioModel.find();
        const estudio1 = estudos.find((e) => e.nome === "Estúdio 1") || estudos[0];
        const estudio2 = estudos.find((e) => e.nome === "Estúdio 2") || estudos[1] || estudos[0];

        if (await TurmaModel.countDocuments() === 0) {
            await TurmaModel.insertMany([
                { nome: "Jazz 1", modalidade: "Jazz", nivel: "Iniciação", faixaEtaria: "4-6 anos", professorId: "prof_ana_luis", professorNome: "Ana Luís Gomes", salaId: String(estudio1._id), salaNome: estudio1.nome, vagas: 18, alunosInscritos: ["aluno_marta"], estado: "ATIVA" },
                { nome: "Acrodance I", modalidade: "Acrodance", nivel: "I", faixaEtaria: "7+ anos", professorId: "prof_ana_luis", professorNome: "Ana Luís Gomes", salaId: String(estudio2._id), salaNome: estudio2.nome, vagas: 20, alunosInscritos: [], estado: "ATIVA" },
                { nome: "Preparatório 1", modalidade: "Ballet", nivel: "Preparatório", faixaEtaria: "5 anos", professorId: "prof_daniela", professorNome: "Daniela Fernandes", salaId: String(estudio1._id), salaNome: estudio1.nome, vagas: 18, alunosInscritos: [], estado: "ATIVA" }
            ]);
            console.log("Turmas criadas.");
        }

        if (await AulaSemanalModel.countDocuments() === 0) {
            await AulaSemanalModel.insertMany([
                { diaSemana: "Segunda-feira", horaInicio: "18:00", horaFim: "19:00", modalidade: "Jazz", turma: "Jazz 1", professorId: "prof_ana_luis", professorNome: "Ana Luís Gomes", salaId: String(estudio1._id), salaNome: estudio1.nome, faixaEtaria: "4-6 anos", vagas: 18, inscritos: 1, estado: "ATIVA" },
                { diaSemana: "Segunda-feira", horaInicio: "19:00", horaFim: "20:00", modalidade: "Acrodance", turma: "Acrodance I", professorId: "prof_ana_luis", professorNome: "Ana Luís Gomes", salaId: String(estudio2._id), salaNome: estudio2.nome, faixaEtaria: "7+ anos", vagas: 20, inscritos: 0, estado: "ATIVA" },
                { diaSemana: "Quarta-feira", horaInicio: "18:00", horaFim: "18:45", modalidade: "Ballet", turma: "Preparatório 1", professorId: "prof_daniela", professorNome: "Daniela Fernandes", salaId: String(estudio1._id), salaNome: estudio1.nome, faixaEtaria: "5 anos", vagas: 18, inscritos: 0, estado: "ATIVA" },
                { diaSemana: "Sábado", horaInicio: "09:30", horaFim: "10:30", modalidade: "Hip Hop", turma: "Hip Hop Kids/Teens", professorId: "prof_ana_luis", professorNome: "Ana Luís Gomes", salaId: String(estudio2._id), salaNome: estudio2.nome, faixaEtaria: "Kids/Teens", vagas: 20, inscritos: 0, estado: "ATIVA" }
            ]);
            console.log("Aulas semanais criadas.");
        }

        if (await PedidoCoachingModel.countDocuments() === 0) {
            await PedidoCoachingModel.create({
                alunoId: "aluno_marta",
                alunoNome: "Marta Silva",
                tipoAluno: "CRIANCA_JOVEM",
                encarregadoId: "enc_joao",
                encarregadoNome: "João Silva",
                modalidade: "Ballet",
                professorPreferencialId: "prof_daniela",
                professorPreferencialNome: "Daniela Fernandes",
                tipoCoaching: "Individual",
                preferenciaHorario: "Sábado de manhã",
                observacoes: "Preparação técnica para apresentação.",
                estado: "PENDENTE"
            });
            console.log("Pedidos de coaching criados.");
        }

        if (await VagaModel.countDocuments() === 0) {
            await VagaModel.create({
                professorId: "prof_daniela",
                professorNome: "Daniela Fernandes",
                modalidade: "Ballet",
                repeticao: "SEMANAL",
                diaSemana: "Sábado",
                horaInicio: "10:00",
                horaFim: "11:00",
                salaId: String(estudio1._id),
                salaNome: estudio1.nome,
                dataInicio: "2026-01-10",
                dataFim: "2026-06-30",
                estado: "ABERTA"
            });
            console.log("Vagas criadas.");
        }

        if (await ItemInventarioModel.countDocuments() === 0) {
            await ItemInventarioModel.create({
                nome: "Figurino de Ballet Branco",
                descricao: "Figurino em bom estado para apresentações.",
                tipo: "FIGURINO",
                modalidade: "Ballet",
                tamanho: "S",
                estadoConservacao: "Bom",
                tipoTransacao: "REQUISITAR",
                preco: 0,
                utilizadorId: "demo",
                origem: "ESCOLA",
                estadoAnuncio: "ATIVO"
            });
            console.log("Inventário criado.");
        }

        if (await EventoModel.countDocuments() === 0) {
            await EventoModel.create({
                titulo: "Gala de Primavera",
                descricao: "Apresentação anual da escola.",
                data: new Date("2026-04-18"),
                local: "Espaço Vita",
                estado: "ATIVO",
                formularioUrl: "https://example.com/formulario",
                figurino: "A definir por turma",
                acessorios: "Conforme comunicado",
                penteado: "Coque clássico",
                maquilhagem: "Natural",
                observacoes: "Chegar 1h antes do início."
            });
            console.log("Eventos criados.");
        }

        if (await InterrupcaoModel.countDocuments() === 0) {
            await InterrupcaoModel.create({
                data: new Date("2026-04-25"),
                nome: "Dia da Liberdade",
                tipo: "FERIADO",
                escolaEncerrada: true
            });
            console.log("Interrupções criadas.");
        }

        console.log("Dados demo criados/validados com sucesso.");
        await mongoose.disconnect();
    } catch (erro) {
        console.error("Erro ao criar dados demo:", erro);
        await mongoose.disconnect();
    }
}

criarDadosDemo();
