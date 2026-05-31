class CriarRegistoFinanceiro {
    constructor(registoFinanceiroRepository) {
        this.registoFinanceiroRepository = registoFinanceiroRepository;
    }

    async executar(dados) {
        if (!dados.tipo) {
            throw new Error("O tipo do registo é obrigatório.");
        }

        if (!dados.descricao) {
            throw new Error("A descrição é obrigatória.");
        }

        if (dados.valor === undefined || dados.valor === null || dados.valor < 0) {
            throw new Error("O valor é obrigatório e não pode ser negativo.");
        }

        return await this.registoFinanceiroRepository.guardar({
            tipo: dados.tipo,
            descricao: dados.descricao,
            valor: dados.valor,
            data: dados.data || new Date(),
            origem: dados.origem || "MANUAL",
            origemId: dados.origemId || null,
            estado: dados.estado || "FATURADO"
        });
    }
}

module.exports = CriarRegistoFinanceiro;