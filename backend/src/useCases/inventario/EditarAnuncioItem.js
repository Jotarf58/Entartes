class EditarAnuncioItem {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async executar(itemId, dados) {
        const item = await this.inventarioRepository.buscarPorId(itemId);

        if (!item) {
            throw new Error("Item não encontrado.");
        }

        if (item.estadoAnuncio === "ENCERRADO") {
            throw new Error("Não é possível editar um anúncio encerrado.");
        }

        if (!dados.titulo) {
            throw new Error("O título é obrigatório.");
        }

        if (!dados.descricao) {
            throw new Error("A descrição é obrigatória.");
        }

        if (!dados.estadoConservacao) {
            throw new Error("O estado de conservação é obrigatório.");
        }

        if (!["ALUGAR", "VENDER", "REQUISITAR"].includes(dados.tipoTransacao)) {
            throw new Error("Tipo de transação inválido.");
        }

        return await this.inventarioRepository.atualizarAnuncio(itemId, {
            titulo: dados.titulo,
            descricao: dados.descricao,
            estadoConservacao: dados.estadoConservacao,
            tipoTransacao: dados.tipoTransacao,
            preco: dados.preco || dados.taxaSimbolica || 0,
            taxaSimbolica: dados.taxaSimbolica || dados.preco || 0
        });
    }
}

module.exports = EditarAnuncioItem;