const InterrupcaoModel = require("../database/models/InterrupcaoModel");

class InterrupcaoRepository {
    async guardar(dados) {
        return await InterrupcaoModel.create(dados);
    }

    async listarTodos(filtros = {}) {
        const query = {};
        if (filtros.tipo) query.tipo = filtros.tipo;
        if (filtros.escolaEncerrada !== undefined) query.escolaEncerrada = filtros.escolaEncerrada === "true" || filtros.escolaEncerrada === true;
        return await InterrupcaoModel.find(query).sort({ data: 1 });
    }

    async buscarPorId(id) {
        return await InterrupcaoModel.findById(id);
    }

    async atualizar(id, dados) {
        return await InterrupcaoModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
    }

    async remover(id) {
        return await InterrupcaoModel.findByIdAndDelete(id);
    }
}

module.exports = InterrupcaoRepository;
