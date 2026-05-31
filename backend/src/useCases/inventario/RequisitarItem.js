class RequisitarItem {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async executar(itemId, dadosRequisicao) {
        if (!dadosRequisicao.utilizadorId) {
            throw new Error("O utilizador que faz a requisição é obrigatório.");
        }

        const item = await this.inventarioRepository.buscarPorId(itemId);

        if (!item) {
            throw new Error("Item não encontrado.");
        }

        if (item.estadoAnuncio !== "ATIVO") {
            throw new Error("Este anúncio já não está ativo.");
        }

        if (item.utilizadorId === dadosRequisicao.utilizadorId) {
            throw new Error("O dono do item não pode requisitar o próprio item.");
        }

        const jaRequisitou = item.requisicoes?.some(
            requisicao => requisicao.utilizadorId === dadosRequisicao.utilizadorId
        );

        if (jaRequisitou) {
            throw new Error("Este utilizador já fez uma requisição para este item.");
        }

        const itemAtualizado = await this.inventarioRepository.adicionarRequisicao(
            itemId,
            dadosRequisicao
        );

        console.log("Email fake: nova requisição para o item", item.titulo);

        return itemAtualizado;
    }
}

module.exports = RequisitarItem;