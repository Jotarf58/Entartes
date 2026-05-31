const PedidoCoachingModel = require("../database/models/PedidoCoachingModel");

class PedidoCoachingRepository {
    async guardar(dadosPedido) {
        return await PedidoCoachingModel.create(dadosPedido);
    }

    async listarTodos(filtros = {}) {
        const query = {};
        if (filtros.estado && filtros.estado !== "TODOS") query.estado = filtros.estado;
        if (filtros.modalidade && filtros.modalidade !== "TODAS") query.modalidade = filtros.modalidade;
        if (filtros.alunoId) query.alunoId = filtros.alunoId;
        if (filtros.encarregadoId) query.encarregadoId = filtros.encarregadoId;
        if (filtros.professorId) {
            query.$or = [{ professorId: filtros.professorId }, { professorPreferencialId: filtros.professorId }];
        }
        return await PedidoCoachingModel.find(query).sort({ createdAt: -1 });
    }

    async buscarPorId(id) {
        return await PedidoCoachingModel.findById(id);
    }

    async atualizar(id, dados) {
        return await PedidoCoachingModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
    }

    async remover(id) {
        return await PedidoCoachingModel.findByIdAndDelete(id);
    }
}

module.exports = PedidoCoachingRepository;
