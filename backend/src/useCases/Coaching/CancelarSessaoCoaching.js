class CancelarSessaoCoaching {
    constructor(coachingRepository) {
        this.coachingRepository = coachingRepository;
    }

    async executar(sessaoId, dados) {
        const sessao = await this.coachingRepository.buscarPorId(sessaoId);

        if (!sessao) {
            throw new Error("Sessão não encontrada.");
        }

        if (sessao.estado === "CANCELADA") {
            throw new Error("Esta sessão já está cancelada.");
        }

        if (sessao.estado === "FATURADA") {
            throw new Error("Não é possível cancelar uma sessão já faturada.");
        }

        return await this.coachingRepository.atualizarPorId(sessaoId, {
            estado: "CANCELADA",
            motivoCancelamento: dados.motivo || "",
            dataCancelamento: new Date()
        });
    }
}

module.exports = CancelarSessaoCoaching;