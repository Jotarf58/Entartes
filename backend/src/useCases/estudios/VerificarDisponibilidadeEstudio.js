class VerificarDisponibilidadeEstudio {
    constructor(estudioRepository, sessaoCoachingRepository) {
        this.estudioRepository = estudioRepository;
        this.sessaoCoachingRepository = sessaoCoachingRepository;
    }

    async executar(estudioId, dataInicio, dataFim) {
        if (!estudioId) {
            throw new Error("O estúdio é obrigatório.");
        }

        if (!dataInicio || !dataFim) {
            throw new Error("A data de início e fim são obrigatórias.");
        }

        const estudio = await this.estudioRepository.buscarPorId(estudioId);

        if (!estudio) {
            throw new Error("Estúdio não encontrado.");
        }

        const conflito = await this.sessaoCoachingRepository.procurarConflitoEstudio(
            estudioId,
            dataInicio,
            dataFim
        );

        return {
            estudio,
            disponivel: !conflito,
            conflito: conflito || null
        };
    }
}

module.exports = VerificarDisponibilidadeEstudio;