class ManifestarInteressePedido {
    constructor(pedidoCoachingRepository) {
        this.pedidoCoachingRepository = pedidoCoachingRepository;
    }

    async executar(pedidoId, dados) {
        if (!dados.professorId) {
            throw new Error("O professor é obrigatório.");
        }

        const pedido = await this.pedidoCoachingRepository.buscarPorId(pedidoId);

        if (!pedido) {
            throw new Error("Pedido de coaching não encontrado.");
        }

        if (pedido.estado === "APROVADO" || pedido.estado === "REJEITADO") {
            throw new Error("Este pedido já foi fechado.");
        }

        const jaManifestou = pedido.professoresInteressados.includes(dados.professorId);

        if (jaManifestou) {
            throw new Error("Este professor já manifestou interesse neste pedido.");
        }

        const professoresInteressados = [
            ...pedido.professoresInteressados,
            dados.professorId
        ];

        return await this.pedidoCoachingRepository.atualizar(pedidoId, {
            estado: "INTERESSE_REGISTADO",
            professorId: dados.professorId,
            professoresInteressados
        });
    }
}

module.exports = ManifestarInteressePedido;