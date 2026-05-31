const express = require("express");
const router = express.Router();

const RegistoFinanceiroRepository = require("../repositories/RegistoFinanceiroRepository");
const CriarRegistoFinanceiro = require("../../useCases/financeiro/CriarRegistoFinanceiro");
const FinanceiroController = require("../../controllers/FinanceiroController");

const registoFinanceiroRepository = new RegistoFinanceiroRepository();
const criarRegistoFinanceiroUseCase = new CriarRegistoFinanceiro(registoFinanceiroRepository);

const financeiroController = new FinanceiroController(
    registoFinanceiroRepository,
    criarRegistoFinanceiroUseCase
);

router.get("/", (req, res) =>
    financeiroController.listar(req, res)
);

router.post("/", (req, res) =>
    financeiroController.criar(req, res)
);

router.get("/exportar", (req, res) =>
    financeiroController.exportar(req, res)
);

module.exports = router;