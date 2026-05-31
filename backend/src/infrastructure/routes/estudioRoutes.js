const express = require("express");
const router = express.Router();

const EstudioRepository = require("../repositories/EstudioRepository");
const SessaoCoachingRepository = require("../repositories/SessaoCoachingRepository");
const EstudioController = require("../../controllers/EstudioController");
const CriarEstudio = require("../../useCases/estudios/CriarEstudio");
const VerificarDisponibilidadeEstudio = require("../../useCases/estudios/VerificarDisponibilidadeEstudio");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const estudioRepository = new EstudioRepository();
const sessaoCoachingRepository = new SessaoCoachingRepository();
const estudioController = new EstudioController(
    estudioRepository,
    new CriarEstudio(estudioRepository),
    new VerificarDisponibilidadeEstudio(estudioRepository, sessaoCoachingRepository)
);

router.get("/", authMiddleware, (req, res) => estudioController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => estudioController.buscarPorId(req, res));
router.post("/", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => estudioController.criar(req, res));
router.patch("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => estudioController.atualizar(req, res));
router.delete("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => estudioController.remover(req, res));
router.get("/:id/disponibilidade", authMiddleware, (req, res) => estudioController.disponibilidade(req, res));

module.exports = router;
