const UtilizadorRepository = require("../infrastructure/repositories/UtilizadorRepository");
const EstudioRepository = require("../infrastructure/repositories/EstudioRepository");
const ModalidadeModel = require("../infrastructure/database/models/ModalidadeModel");

const modalidadesPadrao = [
    "Ballet",
    "Jazz",
    "Dança Contemporânea",
    "Acrodance",
    "Ginástica Acrobática",
    "Hip Hop",
    "Teatro Musical",
    "Commercial Fusion",
    "Body Balance",
    "Flexibilidade",
    "Condicionamento Físico",
    "Personal Training"
];

async function garantirModalidadesIniciais() {
    const total = await ModalidadeModel.countDocuments();

    if (total === 0) {
        await ModalidadeModel.insertMany(
            modalidadesPadrao.map((nome) => ({ nome }))
        );
    }
}

class ReferenciaController {
    constructor() {
        this.utilizadorRepository = new UtilizadorRepository();
        this.estudioRepository = new EstudioRepository();
    }

    async listarProfessores(req, res) {
        try {
            const utilizadores = await this.utilizadorRepository.listarPorTipoPerfil("PROFESSOR");
            const professores = [];

            utilizadores.forEach((utilizador) => {
                utilizador.perfis
                    .filter((perfil) => perfil.tipoPerfil === "PROFESSOR" && perfil.ativo)
                    .forEach((perfil) => {
                        professores.push({
                            id: String(perfil._id),
                            utilizadorId: String(utilizador._id),
                            nome: perfil.nome,
                            email: utilizador.email
                        });
                    });
            });

            res.status(200).json({ total: professores.length, professores });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listarModalidades(req, res) {
        try {
            await garantirModalidadesIniciais();
            const registos = await ModalidadeModel.find().sort({ nome: 1 });
            const modalidades = registos.map((registo) => registo.nome);
            res.status(200).json({ total: modalidades.length, modalidades, registos });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async criarModalidade(req, res) {
        try {
            const nome = String(req.body.nome || "").trim();

            if (!nome) {
                return res.status(400).json({ erro: "O nome da modalidade é obrigatório." });
            }

            const existente = await ModalidadeModel.findOne({ nome });

            if (existente) {
                return res.status(409).json({ erro: "Essa modalidade já existe." });
            }

            const modalidade = await ModalidadeModel.create({ nome });
            res.status(201).json({ mensagem: "Modalidade criada com sucesso.", modalidade });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async removerModalidade(req, res) {
        try {
            const modalidade = await ModalidadeModel.findByIdAndDelete(req.params.id);

            if (!modalidade) {
                return res.status(404).json({ erro: "Modalidade não encontrada." });
            }

            res.status(200).json({ mensagem: "Modalidade removida com sucesso.", modalidade });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listarSalas(req, res) {
        try {
            const estudios = await this.estudioRepository.listarTodos(req.query);
            const salas = estudios.map((estudio) => ({
                id: String(estudio._id),
                nome: estudio.nome,
                tipo: estudio.tipo || "Estúdio",
                capacidade: estudio.capacidade,
                estado: estudio.estado,
                modalidadesPermitidas: estudio.modalidadesPermitidas
            }));
            res.status(200).json({ total: salas.length, salas });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = ReferenciaController;
