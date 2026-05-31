const express = require("express");
const router = express.Router();

const InventarioRepository = require("../repositories/InventarioRepository");
const InventarioController = require("../../controllers/InventarioController");
const AnunciarItem = require("../../useCases/inventario/AnunciarItem");
const RequisitarItem = require("../../useCases/inventario/RequisitarItem");
const AceitarRequisicaoItem = require("../../useCases/inventario/AceitarRequisicaoItem");
const RejeitarRequisicaoItem = require("../../useCases/inventario/RejeitarRequisicaoItem");
const EditarAnuncioItem = require("../../useCases/inventario/EditarAnuncioItem");
const EncerrarAnuncioItem = require("../../useCases/inventario/EncerrarAnuncioItem");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const inventarioRepository = new InventarioRepository();
const inventarioController = new InventarioController(
    inventarioRepository,
    new AnunciarItem(inventarioRepository),
    new RequisitarItem(inventarioRepository),
    new AceitarRequisicaoItem(inventarioRepository),
    new RejeitarRequisicaoItem(inventarioRepository),
    new EditarAnuncioItem(inventarioRepository),
    new EncerrarAnuncioItem(inventarioRepository)
);

router.get("/", authMiddleware, (req, res) => inventarioController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => inventarioController.buscarPorId(req, res));
router.post("/anunciar", authMiddleware, (req, res) => inventarioController.anunciar(req, res));
router.post("/:id/requisicao", authMiddleware, (req, res) => inventarioController.requisitar(req, res));
router.patch("/:id/anuncio", authMiddleware, (req, res) => inventarioController.editarAnuncio(req, res));
router.patch("/:id/encerrar", authMiddleware, (req, res) => inventarioController.encerrarAnuncio(req, res));
router.patch("/:id/requisicoes/:requisicaoId/aceitar", authMiddleware, (req, res) => inventarioController.aceitarRequisicao(req, res));
router.patch("/:id/requisicoes/:requisicaoId/rejeitar", authMiddleware, (req, res) => inventarioController.rejeitarRequisicao(req, res));
router.delete("/:id", authMiddleware, (req, res) => inventarioController.remover(req, res));

module.exports = router;
