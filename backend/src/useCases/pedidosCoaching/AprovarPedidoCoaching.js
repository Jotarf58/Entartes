class AprovarPedidoCoaching {
    constructor(pedidoCoachingRepository) {
        this.pedidoCoachingRepository = pedidoCoachingRepository;
    }

    async executar(pedidoId) {
        const pedido = await this.pedidoCoachingRepository.buscarPorId(pedidoId);

        if (!pedido) {
            throw new Error("Pedido de coaching não encontrado.");
        }

        if (pedido.estado !== "ACEITE_PROFESSOR") {
            throw new Error("A direção só pode aprovar pedidos aceites pelo professor.");
        }

        return await this.pedidoCoachingRepository.atualizar(pedidoId, {
            estado: "APROVADO"
        });
    }
}

module.exports = AprovarPedidoCoaching;