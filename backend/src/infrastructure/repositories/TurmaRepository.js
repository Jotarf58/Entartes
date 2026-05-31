const TurmaModel = require("../database/models/TurmaModel");

class TurmaRepository {
    async guardar(dadosTurma) {
        return await TurmaModel.create(dadosTurma);
    }

    async listarTodas(filtros = {}) {
        const query = {};
        if (filtros.estado) query.estado = filtros.estado;
        if (filtros.modalidade) query.modalidade = filtros.modalidade;
        if (filtros.professorId) query.professorId = filtros.professorId;
        return await TurmaModel.find(query).sort({ modalidade: 1, nome: 1 });
    }

    async buscarPorId(id) {
        return await TurmaModel.findById(id);
    }

    async atualizar(idOuTurma, dados) {
        if (idOuTurma && idOuTurma.save) return await idOuTurma.save();
        return await TurmaModel.findByIdAndUpdate(idOuTurma, dados, { new: true, runValidators: true });
    }

    async remover(id) {
        return await TurmaModel.findByIdAndDelete(id);
    }
}

module.exports = TurmaRepository;
