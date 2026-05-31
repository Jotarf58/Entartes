const EventoModel = require("../database/models/EventoModel");
const AutorizacaoEventoModel = require("../database/models/AutorizacaoEventoModel");

class EventoRepository {
    async guardar(dadosEvento) {
        return await EventoModel.create(dadosEvento);
    }

    async listarTodos(filtros = {}) {
        const query = {};
        if (filtros.estado) query.estado = filtros.estado;
        return await EventoModel.find(query).sort({ data: 1 });
    }

    async buscarPorId(id) {
        return await EventoModel.findById(id);
    }

    async atualizar(id, dados) {
        return await EventoModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
    }

    async remover(id) {
        return await EventoModel.findByIdAndDelete(id);
    }

    async adicionarComunicado(id, dados) {
        return await EventoModel.findByIdAndUpdate(
            id,
            { $push: { comunicados: dados } },
            { new: true, runValidators: true }
        );
    }

    async criarAutorizacao(dados) {
        return await AutorizacaoEventoModel.create(dados);
    }

    async listarAutorizacoes(eventoId) {
        return await AutorizacaoEventoModel.find({ eventoId }).sort({ createdAt: -1 });
    }
}

module.exports = EventoRepository;
