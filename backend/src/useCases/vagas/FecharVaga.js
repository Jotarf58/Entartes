class FecharVaga {
    constructor(vagaRepository) {
        this.vagaRepository = vagaRepository;
    }

    async executar(vagaId) {
        const vaga = await this.vagaRepository.buscarPorId(vagaId);

        if (!vaga) {
            throw new Error("Vaga não encontrada.");
        }

        if (vaga.estado === "FECHADA") {
            throw new Error("Esta vaga já está fechada.");
        }

        return await this.vagaRepository.fechar(vagaId);
    }
}

module.exports = FecharVaga;