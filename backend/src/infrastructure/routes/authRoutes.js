const express = require("express");
const router = express.Router();

const UtilizadorRepository = require("../repositories/UtilizadorRepository");
const AuthController = require("../../controllers/AuthController");

const CriarUtilizadorAdmin = require("../../useCases/Auth/CriarUtilizadorAdmin");
const LoginUtilizador = require("../../useCases/Auth/LoginUtilizador");
const SelecionarPerfilUtilizador = require("../../useCases/Auth/SelecionarPerfilUtilizador");

const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

const utilizadorRepository = new UtilizadorRepository();
const criarUtilizadorAdminUseCase = new CriarUtilizadorAdmin(utilizadorRepository);
const loginUtilizadorUseCase = new LoginUtilizador(utilizadorRepository);
const selecionarPerfilUtilizadorUseCase = new SelecionarPerfilUtilizador(utilizadorRepository);

const authController = new AuthController(
    utilizadorRepository,
    criarUtilizadorAdminUseCase,
    loginUtilizadorUseCase,
    selecionarPerfilUtilizadorUseCase
);

router.post("/login", (req, res) => authController.login(req, res));
router.post("/selecionar-perfil", authMiddleware, (req, res) => authController.selecionarPerfil(req, res));
router.get("/me", authMiddleware, (req, res) => authController.perfil(req, res));

router.get(
    "/professores",
    authMiddleware,
    (req, res) => authController.listarProfessores(req, res)
);

router.post("/utilizadores", authMiddleware, autorizarTipos("ADMIN"), (req, res) =>
    authController.criarUtilizador(req, res)
);

router.get("/utilizadores", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) =>
    authController.listar(req, res)
);

router.get("/utilizadores/:id", authMiddleware, autorizarTipos("ADMIN", "DIRECAO"), (req, res) =>
    authController.buscarPorId(req, res)
);

router.patch("/utilizadores/:id", authMiddleware, autorizarTipos("ADMIN"), (req, res) =>
    authController.atualizar(req, res)
);

router.patch("/utilizadores/:id/estado", authMiddleware, autorizarTipos("ADMIN"), (req, res) =>
    authController.alterarEstado(req, res)
);

router.patch("/utilizadores/:id/password", authMiddleware, autorizarTipos("ADMIN"), (req, res) =>
    authController.alterarPassword(req, res)
);

router.patch("/utilizadores/:id/pin-encarregado", authMiddleware, autorizarTipos("ADMIN"), (req, res) =>
    authController.alterarPinEncarregado(req, res)
);

router.delete("/utilizadores/:id", authMiddleware, autorizarTipos("ADMIN"), (req, res) =>
    authController.remover(req, res)
);

module.exports = router;
