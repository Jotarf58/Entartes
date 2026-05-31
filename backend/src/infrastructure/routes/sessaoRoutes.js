const express = require("express");
const router = express.Router();

const PresencaController = require("../../controllers/PresencaController");

const RegistarPresencas = require("../../useCases/presencas/RegistarPresencas");

const PresencaRepository = require("../repositories/PresencaRepository");
const SessaoCoachingRepository = require("../repositories/SessaoCoachingRepository");

const presencaRepository = new PresencaRepository();
const sessaoCoachingRepository = new SessaoCoachingRepository();

const registarPresencasUseCase = new RegistarPresencas(
    presencaRepository,
    sessaoCoachingRepository
);

const presencaController = new PresencaController(registarPresencasUseCase);

router.post("/:sessaoId/presencas", (req, res) =>
    presencaController.registar(req, res)
);

module.exports = router;