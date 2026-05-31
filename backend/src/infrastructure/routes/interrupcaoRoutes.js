const express = require("express");
const router = express.Router();

const InterrupcaoRepository = require("../repositories/InterrupcaoRepository");
const InterrupcaoController = require("../../controllers/InterrupcaoController");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const interrupcaoController = new InterrupcaoController(new InterrupcaoRepository());

router.get("/", authMiddleware, (req, res) => interrupcaoController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => interrupcaoController.buscarPorId(req, res));
router.post("/", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => interrupcaoController.criar(req, res));
router.patch("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => interrupcaoController.atualizar(req, res));
router.delete("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => interrupcaoController.remover(req, res));

module.exports = router;
