const UtilizadorModel = require("../database/models/UtilizadorModel");

class UtilizadorRepository {
    async guardar(dadosUtilizador) {
        return await UtilizadorModel.create(dadosUtilizador);
    }

    async buscarPorEmail(email) {
        return await UtilizadorModel
            .findOne({ email: String(email).toLowerCase().trim() })
            .select("+passwordHash +pinEncarregadoHash");
    }

    async buscarPorId(id) {
        return await UtilizadorModel.findById(id);
    }

    async buscarPorIdComSegredos(id) {
        return await UtilizadorModel
            .findById(id)
            .select("+passwordHash +pinEncarregadoHash");
    }

    async listarTodos(filtros = {}) {
        const query = {};

        if (filtros.estado) query.estado = filtros.estado;
        if (filtros.tipoConta) query.tipoConta = filtros.tipoConta;
        if (filtros.tipoPerfil) query["perfis.tipoPerfil"] = filtros.tipoPerfil;

        return await UtilizadorModel.find(query).sort({ createdAt: -1 });
    }

    async listarPorTipoPerfil(tipoPerfil) {
        return await UtilizadorModel.find({
            estado: "ATIVO",
            perfis: { $elemMatch: { tipoPerfil, ativo: true } }
        }).sort({ nomeConta: 1 });
    }

    async atualizar(id, dados) {
        return await UtilizadorModel.findByIdAndUpdate(id, dados, {
            new: true,
            runValidators: true
        });
    }

    async adicionarPerfil(id, perfil) {
        return await UtilizadorModel.findByIdAndUpdate(
            id,
            {
                $push: { perfis: perfil },
                $addToSet: { tiposUtilizador: perfil.tipoPerfil }
            },
            { new: true, runValidators: true }
        );
    }

    async remover(id) {
        return await UtilizadorModel.findByIdAndDelete(id);
    }
}

module.exports = UtilizadorRepository;
