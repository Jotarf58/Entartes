class CriarVaga {
    constructor(vagaRepository) {
        this.vagaRepository = vagaRepository;
    }

    async executar(dados) {
        if (!dados.professorId) {
            throw new Error("O professor é obrigatório.");
        }

        if (!dados.modalidade) {
            throw new Error("A modalidade é obrigatória.");
        }

        if (!dados.estudioId) {
            throw new Error("O estúdio é obrigatório.");
        }

        if (!dados.data) {
            throw new Error("A data é obrigatória.");
        }

        if (!dados.horaInicio || !dados.horaFim) {
            throw new Error("A hora de início e fim são obrigatórias.");
        }

        if (dados.horaInicio >= dados.horaFim) {
            throw new Error("A hora de início deve ser anterior à hora de fim.");
        }

        const conflito = await this.vagaRepository.procurarConflitoProfessor(
            dados.professorId,
            dados.data,
            dados.horaInicio,
            dados.horaFim
        );

        if (conflito) {
            throw new Error("O professor já tem uma vaga aberta nesse horário.");
        }

        return await this.vagaRepository.guardar({
            professorId: dados.professorId,
            modalidade: dados.modalidade,
            estudioId: dados.estudioId,
            data: dados.data,
            horaInicio: dados.horaInicio,
            horaFim: dados.horaFim,
            estado: dados.estado || "ABERTA"
        });
    }
}

module.exports = CriarVaga;