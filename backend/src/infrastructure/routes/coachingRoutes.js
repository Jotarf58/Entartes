const express = require("express");
const router = express.Router();

const CoachingController = require("../../controllers/CoachingController");

const ValidarSessaoCoaching = require("../../useCases/Coaching/ValidarSessaoCoaching");
const CancelarSessaoCoaching = require("../../useCases/Coaching/CancelarSessaoCoaching");
const ReagendarSessaoCoaching = require("../../useCases/Coaching/ReagendarSessaoCoaching");

const SessaoCoachingRepository = require("../repositories/SessaoCoachingRepository");
const RegistoFinanceiroRepository = require("../repositories/RegistoFinanceiroRepository");
const EstudioRepository = require("../repositories/EstudioRepository");

const coachingRepository = new SessaoCoachingRepository();
const registoFinanceiroRepository = new RegistoFinanceiroRepository();
const estudioRepository = new EstudioRepository();

const validarSessaoCoaching = new ValidarSessaoCoaching(
    coachingRepository,
    registoFinanceiroRepository
);

const cancelarSessaoCoaching = new CancelarSessaoCoaching(
    coachingRepository
);

const reagendarSessaoCoaching = new ReagendarSessaoCoaching(
    coachingRepository,
    estudioRepository
);

const coachingController = new CoachingController(
    coachingRepository,
    validarSessaoCoaching,
    estudioRepository,
    cancelarSessaoCoaching,
    reagendarSessaoCoaching
);

router.post("/criar", (req, res) =>
    coachingController.criar(req, res)
);

router.get("/", (req, res) =>
    coachingController.listar(req, res)
);

router.get("/professor/:professorId", (req, res) =>
    coachingController.listarPorProfessor(req, res)
);

router.get("/:id", (req, res) =>
    coachingController.buscarPorId(req, res)
);

router.post("/:id/validar", (req, res) =>
    coachingController.validar(req, res)
);

router.patch("/:id/cancelar", (req, res) =>
    coachingController.cancelar(req, res)
);

router.patch("/:id/reagendar", (req, res) =>
    coachingController.reagendar(req, res)
);

module.exports = router;