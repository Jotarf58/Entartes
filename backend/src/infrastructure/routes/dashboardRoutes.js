const express = require("express");
const router = express.Router();

const DashboardController = require("../../controllers/DashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

const dashboardController = new DashboardController();

router.get("/resumo", authMiddleware, (req, res) => dashboardController.resumo(req, res));

module.exports = router;
