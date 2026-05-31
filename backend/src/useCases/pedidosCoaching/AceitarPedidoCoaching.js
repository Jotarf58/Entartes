class AceitarPedidoCoaching {
    constructor(pedidoCoachingRepository) {
        this.pedidoCoachingRepository = pedidoCoachingRepository;
    }

    async executar(pedidoId, dados) {
        const pedido = await this.pedidoCoachingRepository.buscarPorId(pedidoId);

        if (!pedido) {
            throw new Error("Pedido de coaching não encontrado.");
        }

        if (pedido.estado !== "PENDENTE" && pedido.estado !== "INTERESSE_REGISTADO") {
            throw new Error("Este pedido não pode ser aceite pelo professor neste estado.");
        }

        const professorId = dados.professorId || pedido.professorId;

        if (!professorId) {
            throw new Error("É necessário indicar o professor.");
        }

        return await this.pedidoCoachingRepository.atualizar(pedidoId, {
            estado: "ACEITE_PROFESSOR",
            professorId
        });
    }
}

module.exports = AceitarPedidoCoaching;