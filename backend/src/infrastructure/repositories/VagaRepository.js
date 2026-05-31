const VagaModel = require("../database/models/VagaModel");

class VagaRepository {
    async guardar(dadosVaga) {
        return await VagaModel.create(dadosVaga);
    }

    async listarTodas(filtros = {}) {
        const query = {};
        if (filtros.estado) query.estado = filtros.estado;
        if (filtros.modalidade) query.modalidade = filtros.modalidade;
        if (filtros.professorId) query.professorId = filtros.professorId;
        return await VagaModel.find(query).sort({ dataInicio: 1, diaSemana: 1, horaInicio: 1 });
    }

    async buscarPorId(id) {
        return await VagaModel.findById(id);
    }

    async atualizar(id, dados) {
        return await VagaModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
    }

    async fechar(id) {
        return await this.atualizar(id, { estado: "FECHADA" });
    }

    async cancelar(id) {
        return await this.atualizar(id, { estado: "CANCELADA" });
    }

    async ocupar(id) {
        return await this.atualizar(id, { estado: "OCUPADA" });
    }

    async remover(id) {
        return await VagaModel.findByIdAndDelete(id);
    }

    async procurarConflitoProfessor(professorId, diaSemana, horaInicio, horaFim, ignorarId = null) {
        const query = {
            professorId,
            diaSemana,
            horaInicio: { $lt: horaFim },
            horaFim: { $gt: horaInicio },
            estado: { $ne: "CANCELADA" }
        };
        if (ignorarId) query._id = { $ne: ignorarId };
        return await VagaModel.findOne(query);
    }
}

module.exports = VagaRepository;
