const EstudioModel = require("../database/models/EstudioModel");

class EstudioRepository {
    async guardar(dadosEstudio) {
        return await EstudioModel.create(dadosEstudio);
    }

    async listarTodos(filtros = {}) {
        const query = {};
        if (filtros.estado) query.estado = filtros.estado;
        return await EstudioModel.find(query).sort({ nome: 1 });
    }

    async buscarPorId(id) {
        return await EstudioModel.findById(id);
    }

    async atualizar(id, dados) {
        return await EstudioModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
    }

    async remover(id) {
        return await EstudioModel.findByIdAndDelete(id);
    }
}

module.exports = EstudioRepository;
