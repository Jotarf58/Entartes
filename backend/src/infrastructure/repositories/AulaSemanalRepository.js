const AulaSemanalModel = require("../database/models/AulaSemanalModel");
const SolicitacaoAulaModel = require("../database/models/SolicitacaoAulaModel");

class AulaSemanalRepository {
    async guardar(dadosAula) {
        return await AulaSemanalModel.create(dadosAula);
    }

    async listarTodas(filtros = {}) {
        const query = {};
        if (filtros.diaSemana && filtros.diaSemana !== "TODOS") query.diaSemana = filtros.diaSemana;
        if (filtros.modalidade && filtros.modalidade !== "TODAS") query.modalidade = filtros.modalidade;
        if (filtros.estado) query.estado = filtros.estado;
        if (filtros.professorId) query.professorId = filtros.professorId;
        return await AulaSemanalModel.find(query).sort({ diaSemana: 1, horaInicio: 1, modalidade: 1 });
    }

    async buscarPorId(id) {
        return await AulaSemanalModel.findById(id);
    }

    async atualizar(id, dados) {
        return await AulaSemanalModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
    }

    async remover(id) {
        return await AulaSemanalModel.findByIdAndDelete(id);
    }

    async criarSolicitacao(dados) {
        return await SolicitacaoAulaModel.create(dados);
    }

    async listarSolicitacoes(filtros = {}) {
        const query = {};
        if (filtros.aulaId) query.aulaId = filtros.aulaId;
        if (filtros.tipo) query.tipo = filtros.tipo;
        if (filtros.estado) query.estado = filtros.estado;
        return await SolicitacaoAulaModel.find(query).sort({ createdAt: -1 });
    }
}

module.exports = AulaSemanalRepository;
