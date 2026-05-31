const SessaoCoachingModel = require("../database/models/SessaoCoachingModel");

class SessaoCoachingRepository {
    async buscarPorId(id) {
        return await SessaoCoachingModel.findById(id);
    }

    async atualizar(sessao) {
        return await SessaoCoachingModel.findByIdAndUpdate(
            sessao._id,
            sessao,
            { new: true, runValidators: true }
        );
    }

    async atualizarPorId(id, dados) {
        return await SessaoCoachingModel.findByIdAndUpdate(
            id,
            dados,
            { new: true, runValidators: true }
        );
    }

    async criar(dadosSessao) {
        return await SessaoCoachingModel.create(dadosSessao);
    }

    async listarTodos() {
        return await SessaoCoachingModel.find().sort({
            dataInicio: 1,
            createdAt: -1
        });
    }

    async listarPorAluno(alunoId) {
        return await SessaoCoachingModel.find({
            alunosIds: alunoId
        }).sort({ dataInicio: 1, createdAt: -1 });
    }

    async listarPorProfessor(professorId) {
        return await SessaoCoachingModel.find({
            professorId
        }).sort({ dataInicio: 1, createdAt: -1 });
    }

    async procurarConflitoEstudio(estudioId, dataInicio, dataFim) {
        return await SessaoCoachingModel.findOne({
            estudioId,
            dataInicio: { $lt: new Date(dataFim) },
            dataFim: { $gt: new Date(dataInicio) },
            estado: { $ne: "CANCELADA" }
        });
    }

    async procurarConflitoEstudioIgnorandoSessao(sessaoId, estudioId, dataInicio, dataFim) {
        return await SessaoCoachingModel.findOne({
            _id: { $ne: sessaoId },
            estudioId,
            dataInicio: { $lt: new Date(dataFim) },
            dataFim: { $gt: new Date(dataInicio) },
            estado: { $ne: "CANCELADA" }
        });
    }
}

module.exports = SessaoCoachingRepository;