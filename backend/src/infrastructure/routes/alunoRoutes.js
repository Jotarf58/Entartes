const express = require("express");
const router = express.Router();

const AlunoController = require("../../controllers/AlunoController");
const ConsultarSessoesAluno = require("../../useCases/alunos/ConsultarSessoesAluno");
const SessaoCoachingRepository = require("../repositories/SessaoCoachingRepository");

const sessaoCoachingRepository = new SessaoCoachingRepository();
const consultarSessoesAlunoUseCase = new ConsultarSessoesAluno(sessaoCoachingRepository);

const alunoController = new AlunoController(consultarSessoesAlunoUseCase);

router.get("/:alunoId/sessoes", (req, res) =>
    alunoController.consultarSessoes(req, res)
);

module.exports = router;