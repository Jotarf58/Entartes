class RegistarPresencas {
    constructor(presencaRepository, sessaoCoachingRepository) {
        this.presencaRepository = presencaRepository;
        this.sessaoCoachingRepository = sessaoCoachingRepository;
    }

    async executar(sessaoId, dados) {
        if (!sessaoId) {
            throw new Error("A sessão é obrigatória.");
        }

        if (!dados.presencas || dados.presencas.length === 0) {
            throw new Error("É necessário enviar pelo menos uma presença.");
        }

        const sessao = await this.sessaoCoachingRepository.buscarPorId(sessaoId);

        if (!sessao) {
            throw new Error("Sessão não encontrada.");
        }

        for (const presencaAluno of dados.presencas) {
            if (!presencaAluno.alunoId) {
                throw new Error("Todas as presenças precisam de alunoId.");
            }

            if (!sessao.alunosIds.includes(presencaAluno.alunoId)) {
                throw new Error(`O aluno ${presencaAluno.alunoId} não pertence a esta sessão.`);
            }

            if (!["PRESENTE", "FALTOU", "FALTA_JUSTIFICADA"].includes(presencaAluno.estadoParticipacao)) {
                throw new Error("Estado de participação inválido.");
            }
        }

        const presencaExistente = await this.presencaRepository.buscarPorSessao(sessaoId);

        const dadosPresenca = {
            sessaoId,
            presencas: dados.presencas,
            registadoPor: dados.registadoPor || "professor"
        };

        if (presencaExistente) {
            return await this.presencaRepository.atualizarPorSessao(
                sessaoId,
                dadosPresenca
            );
        }

        return await this.presencaRepository.guardar(dadosPresenca);
    }
}

module.exports = RegistarPresencas;