const express = require("express");
const router = express.Router();

const VagaRepository = require("../repositories/VagaRepository");
const VagaController = require("../../controllers/VagaController");
const CriarVaga = require("../../useCases/vagas/CriarVaga");
const FecharVaga = require("../../useCases/vagas/FecharVaga");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const vagaRepository = new VagaRepository();
const vagaController = new VagaController(vagaRepository, new CriarVaga(vagaRepository), new FecharVaga(vagaRepository));

router.get("/", authMiddleware, (req, res) => vagaController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => vagaController.buscarPorId(req, res));
router.post("/", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => vagaController.criar(req, res));
router.patch("/:id", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => vagaController.atualizar(req, res));
router.patch("/:id/fechar", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => vagaController.fechar(req, res));
router.patch("/:id/cancelar", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => vagaController.cancelar(req, res));
router.patch("/:id/ocupar", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => vagaController.ocupar(req, res));
router.delete("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => vagaController.remover(req, res));

module.exports = router;
