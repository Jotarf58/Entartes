const AulaSemanalModel = require("../infrastructure/database/models/AulaSemanalModel");
const PedidoCoachingModel = require("../infrastructure/database/models/PedidoCoachingModel");
const EventoModel = require("../infrastructure/database/models/EventoModel");
const InterrupcaoModel = require("../infrastructure/database/models/InterrupcaoModel");
const ItemInventarioModel = require("../infrastructure/database/models/ItemInventarioModel");
const VagaModel = require("../infrastructure/database/models/VagaModel");

class DashboardController {
    async resumo(req, res) {
        try {
            const [
                proximasAulas,
                pedidosCoaching,
                eventosAtivos,
                proximasInterrupcoes,
                figurinosDisponiveis,
                vagasCoaching,
                totalAulas,
                totalPedidosPendentes,
                totalEventosAtivos,
                totalItensMarketplace
            ] = await Promise.all([
                AulaSemanalModel.find({ estado: "ATIVA" }).sort({ diaSemana: 1, horaInicio: 1 }).limit(8),
                PedidoCoachingModel.find({}).sort({ createdAt: -1 }).limit(8),
                EventoModel.find({ estado: "ATIVO" }).sort({ data: 1 }).limit(8),
                InterrupcaoModel.find({ data: { $gte: new Date() } }).sort({ data: 1 }).limit(3),
                ItemInventarioModel.find({ estadoAnuncio: "ATIVO" }).sort({ createdAt: -1 }).limit(8),
                VagaModel.find({ estado: "ABERTA" }).sort({ dataInicio: 1, diaSemana: 1, horaInicio: 1 }).limit(8),
                AulaSemanalModel.countDocuments({ estado: "ATIVA" }),
                PedidoCoachingModel.countDocuments({ estado: "PENDENTE" }),
                EventoModel.countDocuments({ estado: "ATIVO" }),
                ItemInventarioModel.countDocuments({ estadoAnuncio: "ATIVO" })
            ]);

            res.status(200).json({
                proximasAulas,
                pedidosCoaching,
                eventosAtivos,
                proximaInterrupcao: proximasInterrupcoes[0] || null,
                interrupcoes: proximasInterrupcoes,
                figurinosDisponiveis,
                vagasCoaching,
                resumo: {
                    totalAulas,
                    totalPedidosPendentes,
                    totalEventosAtivos,
                    totalItensMarketplace
                }
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = DashboardController;
