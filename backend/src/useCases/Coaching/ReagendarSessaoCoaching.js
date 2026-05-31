class ReagendarSessaoCoaching {
    constructor(coachingRepository, estudioRepository = null) {
        this.coachingRepository = coachingRepository;
        this.estudioRepository = estudioRepository;
    }

    async executar(sessaoId, dados) {
        const sessao = await this.coachingRepository.buscarPorId(sessaoId);

        if (!sessao) {
            throw new Error("Sessão não encontrada.");
        }

        if (sessao.estado === "CANCELADA") {
            throw new Error("Não é possível reagendar uma sessão cancelada.");
        }

        if (sessao.estado === "FATURADA") {
            throw new Error("Não é possível reagendar uma sessão já faturada.");
        }

        if (!dados.dataInicio || !dados.dataFim) {
            throw new Error("A nova data de início e fim são obrigatórias.");
        }

        if (new Date(dados.dataInicio) >= new Date(dados.dataFim)) {
            throw new Error("A data de início deve ser anterior à data de fim.");
        }

        const duracaoMinutos = dados.duracaoMinutos || sessao.duracaoMinutos;

        if (duracaoMinutos < 30 || duracaoMinutos > 120) {
            throw new Error("A duração deve estar entre 30 e 120 minutos.");
        }

        const novoEstudioId = dados.estudioId || sessao.estudioId;
        const novaModalidade = dados.modalidade || sessao.modalidade;

        if (this.estudioRepository && novoEstudioId) {
            const estudio = await this.estudioRepository.buscarPorId(novoEstudioId);

            if (!estudio) {
                throw new Error("Estúdio não encontrado.");
            }

            if (estudio.estado !== "ATIVO") {
                throw new Error("Este estúdio não está ativo.");
            }

            if (
                novaModalidade &&
                estudio.modalidadesPermitidas.length > 0 &&
                !estudio.modalidadesPermitidas.includes(novaModalidade)
            ) {
                throw new Error("Este estúdio não permite a modalidade indicada.");
            }
        }

        if (novoEstudioId) {
            const conflito = await this.coachingRepository.procurarConflitoEstudioIgnorandoSessao(
                sessaoId,
                novoEstudioId,
                dados.dataInicio,
                dados.dataFim
            );

            if (conflito) {
                throw new Error("O estúdio já está ocupado nesse novo horário.");
            }
        }

        return await this.coachingRepository.atualizarPorId(sessaoId, {
            dataInicio: dados.dataInicio,
            dataFim: dados.dataFim,
            duracaoMinutos,
            estudioId: novoEstudioId,
            modalidade: novaModalidade,
            estado: "REAGENDADA"
        });
    }
}

module.exports = ReagendarSessaoCoaching;