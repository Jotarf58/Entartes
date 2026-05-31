const express = require("express");
const router = express.Router();

const EventoRepository = require("../repositories/EventoRepository");
const EventoController = require("../../controllers/EventoController");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");
const CriarEvento = require("../../useCases/eventos/CriarEvento");
const AtualizarEvento = require("../../useCases/eventos/AtualizarEvento");
const RemoverEvento = require("../../useCases/eventos/RemoverEvento");

const eventoRepository = new EventoRepository();
const eventoController = new EventoController(
    eventoRepository,
    new CriarEvento(eventoRepository),
    new AtualizarEvento(eventoRepository),
    new RemoverEvento(eventoRepository)
);

router.get("/", authMiddleware, (req, res) => eventoController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => eventoController.buscarPorId(req, res));
router.post("/", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => eventoController.criar(req, res));
router.patch("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => eventoController.atualizar(req, res));
router.patch("/:id/estado", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => eventoController.atualizarEstado(req, res));
router.delete("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => eventoController.remover(req, res));
router.post("/:id/autorizacoes", authMiddleware, (req, res) => eventoController.criarAutorizacao(req, res));
router.get("/:id/autorizacoes", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => eventoController.listarAutorizacoes(req, res));

module.exports = router;
