const UtilizadorRepository = require("../infrastructure/repositories/UtilizadorRepository");
const EstudioRepository = require("../infrastructure/repositories/EstudioRepository");

const modalidades = [
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
        res.status(200).json({ total: modalidades.length, modalidades });
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
