const express = require("express");
const router = express.Router();

const TurmaRepository = require("../repositories/TurmaRepository");
const InscreverAluno = require("../../useCases/turmas/InscreverAluno");
const ListarTurmas = require("../../useCases/turmas/ListarTurmas");
const TurmaController = require("../../controllers/TurmaController");

const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const turmaRepository = new TurmaRepository();
const inscreverAlunoUseCase = new InscreverAluno(turmaRepository);
const listarTurmasUseCase = new ListarTurmas(turmaRepository);
const turmaController = new TurmaController(inscreverAlunoUseCase, listarTurmasUseCase, turmaRepository);

router.get("/", authMiddleware, (req, res) => turmaController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => turmaController.buscarPorId(req, res));
router.post("/", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => turmaController.criar(req, res));
router.patch("/:id", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => turmaController.atualizar(req, res));
router.delete("/:id", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => turmaController.remover(req, res));
router.post("/:id/inscrever", authMiddleware, (req, res) => turmaController.inscrever(req, res));
router.delete("/:id/alunos/:alunoId", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) => turmaController.removerAluno(req, res));

module.exports = router;
