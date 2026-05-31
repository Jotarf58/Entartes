const RegistoFinanceiroModel = require("../database/models/RegistoFinanceiroModel");

class RegistoFinanceiroRepository {
    async guardar(dados) {
        return await RegistoFinanceiroModel.create(dados);
    }

    async listarTodos() {
        return await RegistoFinanceiroModel.find().sort({ data: -1, createdAt: -1 });
    }

    async buscarPorOrigem(origem, origemId) {
        return await RegistoFinanceiroModel.findOne({
            origem,
            origemId
        });
    }
}

module.exports = RegistoFinanceiroRepository;