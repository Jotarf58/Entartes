class ValidarSessaoCoaching {
    constructor(coachingRepository, registoFinanceiroRepository = null) {
        this.coachingRepository = coachingRepository;
        this.registoFinanceiroRepository = registoFinanceiroRepository;
    }

    async executar(sessaoId, papelUtilizador, valorManual = null) {
        const sessao = await this.coachingRepository.buscarPorId(sessaoId);

        if (!sessao) {
            throw new Error("Sessão não encontrada.");
        }

        if (papelUtilizador === "PROFESSOR") {
            sessao.estado = "AGUARDA_DIRECAO";
        } else if (papelUtilizador === "DIRECAO") {
            sessao.estado = "FATURADA";

            if (valorManual !== undefined && valorManual !== null) {
                sessao.valorFaturado = valorManual;
            } else {
                sessao.valorFaturado = (sessao.duracaoMinutos / 60) * 36;
            }

            if (this.registoFinanceiroRepository) {
                const registoExistente =
                    await this.registoFinanceiroRepository.buscarPorOrigem(
                        "COACHING",
                        String(sessao._id)
                    );

                if (!registoExistente) {
                    await this.registoFinanceiroRepository.guardar({
                        tipo: "Sessão de coaching",
                        descricao: `Faturação da sessão de coaching ${sessao._id}`,
                        valor: sessao.valorFaturado,
                        data: new Date(),
                        origem: "COACHING",
                        origemId: String(sessao._id),
                        estado: "FATURADO"
                    });
                }
            }
        } else {
            throw new Error("Sem permissão para validar.");
        }

        await this.coachingRepository.atualizar(sessao);

        return sessao;
    }
}

module.exports = ValidarSessaoCoaching;