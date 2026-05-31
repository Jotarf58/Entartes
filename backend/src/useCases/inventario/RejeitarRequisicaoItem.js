class RejeitarRequisicaoItem {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async executar(itemId, requisicaoId) {
        const item = await this.inventarioRepository.buscarPorId(itemId);

        if (!item) {
            throw new Error("Item não encontrado.");
        }

        const requisicao = item.requisicoes.id(requisicaoId);

        if (!requisicao) {
            throw new Error("Requisição não encontrada.");
        }

        if (requisicao.estado !== "PENDENTE") {
            throw new Error("Esta requisição já foi tratada.");
        }

        const itemAtualizado = await this.inventarioRepository.atualizarEstadoRequisicao(
            itemId,
            requisicaoId,
            "REJEITADA"
        );

        console.log("Email fake: requisição rejeitada para o item", item.titulo);

        return itemAtualizado;
    }
}

module.exports = RejeitarRequisicaoItem;