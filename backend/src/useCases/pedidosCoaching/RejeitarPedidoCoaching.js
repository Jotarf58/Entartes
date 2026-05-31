class RejeitarPedidoCoaching {
    constructor(pedidoCoachingRepository) {
        this.pedidoCoachingRepository = pedidoCoachingRepository;
    }

    async executar(pedidoId, dados) {
        const pedido = await this.pedidoCoachingRepository.buscarPorId(pedidoId);

        if (!pedido) {
            throw new Error("Pedido de coaching não encontrado.");
        }

        if (pedido.estado === "APROVADO") {
            throw new Error("Um pedido aprovado já não pode ser rejeitado.");
        }

        return await this.pedidoCoachingRepository.atualizar(pedidoId, {
            estado: "REJEITADO",
            motivoRejeicao: dados.motivoRejeicao || ""
        });
    }
}

module.exports = RejeitarPedidoCoaching;