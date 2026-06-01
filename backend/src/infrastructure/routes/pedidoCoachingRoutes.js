const express = require("express");
const router = express.Router();

const PedidoCoachingRepository = require("../repositories/PedidoCoachingRepository");
const PedidoCoachingController = require("../../controllers/PedidoCoachingController");
const SubmeterPedidoCoaching = require("../../useCases/pedidosCoaching/SubmeterPedidoCoaching");
const ManifestarInteressePedido = require("../../useCases/pedidosCoaching/ManifestarInteressePedido");
const AceitarPedidoCoaching = require("../../useCases/pedidosCoaching/AceitarPedidoCoaching");
const AprovarPedidoCoaching = require("../../useCases/pedidosCoaching/AprovarPedidoCoaching");
const RejeitarPedidoCoaching = require("../../useCases/pedidosCoaching/RejeitarPedidoCoaching");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const pedidoCoachingRepository = new PedidoCoachingRepository();
const pedidoCoachingController = new PedidoCoachingController(
    pedidoCoachingRepository,
    new SubmeterPedidoCoaching(pedidoCoachingRepository),
    new ManifestarInteressePedido(pedidoCoachingRepository),
    new AceitarPedidoCoaching(pedidoCoachingRepository),
    new AprovarPedidoCoaching(pedidoCoachingRepository),
    new RejeitarPedidoCoaching(pedidoCoachingRepository)
);

router.get("/", authMiddleware, (req, res) => pedidoCoachingController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => pedidoCoachingController.buscarPorId(req, res));
router.post("/", authMiddleware, (req, res) => pedidoCoachingController.criar(req, res));
router.patch("/:id", authMiddleware, (req, res) => pedidoCoachingController.atualizar(req, res));
router.patch("/:id/estado", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => pedidoCoachingController.alterarEstado(req, res));
router.patch("/:id/associar-vaga", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => pedidoCoachingController.associarVaga(req, res));
router.patch("/:id/interesse", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => pedidoCoachingController.manifestarInteresse(req, res));
router.patch("/:id/aceitar", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => pedidoCoachingController.aceitar(req, res));
router.patch("/:id/aprovar", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => pedidoCoachingController.aprovar(req, res));
router.patch("/:id/convite", authMiddleware, (req, res) => pedidoCoachingController.responderConvite(req, res));
router.patch("/:id/rejeitar", authMiddleware, autorizarTipos("PROFESSOR", "DIRECAO", "ADMIN"), (req, res) => pedidoCoachingController.rejeitar(req, res));
router.delete("/:id", authMiddleware, autorizarTipos("DIRECAO", "ADMIN"), (req, res) => pedidoCoachingController.remover(req, res));

module.exports = router;
