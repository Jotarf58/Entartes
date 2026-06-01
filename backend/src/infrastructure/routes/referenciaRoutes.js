const express = require("express");
const router = express.Router();

const ReferenciaController = require("../../controllers/ReferenciaController");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const referenciaController = new ReferenciaController();

router.get("/professores", authMiddleware, (req, res) => referenciaController.listarProfessores(req, res));
router.get("/modalidades", authMiddleware, (req, res) => referenciaController.listarModalidades(req, res));
router.post("/modalidades", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => referenciaController.criarModalidade(req, res));
router.delete("/modalidades/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => referenciaController.removerModalidade(req, res));
router.get("/salas", authMiddleware, (req, res) => referenciaController.listarSalas(req, res));

module.exports = router;
