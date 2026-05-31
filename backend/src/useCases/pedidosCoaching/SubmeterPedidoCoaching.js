class SubmeterPedidoCoaching {
    constructor(pedidoCoachingRepository) {
        this.pedidoCoachingRepository = pedidoCoachingRepository;
    }

    async executar(dados) {
        if (!dados.alunoId) {
            throw new Error("O aluno é obrigatório.");
        }

        if (!dados.modalidade) {
            throw new Error("A modalidade é obrigatória.");
        }

        return await this.pedidoCoachingRepository.guardar({
            alunoId: dados.alunoId,
            encarregadoId: dados.encarregadoId || null,
            modalidade: dados.modalidade,
            notas: dados.notas || "",
            professorId: dados.professorId || null,
            estado: "PENDENTE"
        });
    }
}

module.exports = SubmeterPedidoCoaching;