class AceitarRequisicaoItem {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async executar(itemId, requisicaoId) {
        const item = await this.inventarioRepository.buscarPorId(itemId);

        if (!item) {
            throw new Error("Item não encontrado.");
        }

        if (item.estadoAnuncio !== "ATIVO") {
            throw new Error("Este anúncio já não está ativo.");
        }

        const requisicao = item.requisicoes.id(requisicaoId);

        if (!requisicao) {
            throw new Error("Requisição não encontrada.");
        }

        if (requisicao.estado !== "PENDENTE") {
            throw new Error("Esta requisição já foi tratada.");
        }

        const itemAtualizado = await this.inventarioRepository.aceitarRequisicao(
            itemId,
            requisicaoId,
            {
                dataInicio: requisicao.dataSugeridaInicio || requisicao.dataInicio || null,
                dataFim: requisicao.dataSugeridaFim || requisicao.dataFim || null
            }
        );

        console.log("Email fake: requisição aceite para o item", item.titulo);

        return itemAtualizado;
    }
}

module.exports = AceitarRequisicaoItem;