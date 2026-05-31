const express = require("express");
const router = express.Router();

const AulaSemanalRepository = require("../repositories/AulaSemanalRepository");
const ListarAulasSemanais = require("../../useCases/horario/ListarAulasSemanais");
const HorarioController = require("../../controllers/HorarioController");

const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const aulaSemanalRepository = new AulaSemanalRepository();
const listarAulasSemanaisUseCase = new ListarAulasSemanais(aulaSemanalRepository);
const horarioController = new HorarioController(aulaSemanalRepository, listarAulasSemanaisUseCase);

router.get("/aulas-semanais", authMiddleware, (req, res) => horarioController.listarAulasSemanais(req, res));
router.get("/aulas-semanais/:id", authMiddleware, (req, res) => horarioController.buscarAula(req, res));
router.post("/aulas-semanais", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => horarioController.criarAula(req, res));
router.patch("/aulas-semanais/:id", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => horarioController.atualizarAula(req, res));
router.delete("/aulas-semanais/:id", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => horarioController.removerAula(req, res));
router.post("/aulas-semanais/:id/solicitar-inscricao", authMiddleware, (req, res) => horarioController.solicitarInscricao(req, res));
router.post("/aulas-semanais/:id/solicitar-alteracao", authMiddleware, autorizarTipos("PROFESSOR", "ADMIN", "DIRECAO"), (req, res) => horarioController.solicitarAlteracao(req, res));
router.get("/solicitacoes", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => horarioController.listarSolicitacoes(req, res));

module.exports = router;
