const PresencaModel = require("../database/models/PresencaModel");

class PresencaRepository {
    async guardar(dadosPresenca) {
        return await PresencaModel.create(dadosPresenca);
    }

    async buscarPorSessao(sessaoId) {
        return await PresencaModel.findOne({ sessaoId });
    }

    async atualizarPorSessao(sessaoId, dadosPresenca) {
        return await PresencaModel.findOneAndUpdate(
            { sessaoId },
            dadosPresenca,
            {
                new: true,
                runValidators: true
            }
        );
    }
}

module.exports = PresencaRepository;