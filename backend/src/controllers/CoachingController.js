class CoachingController {
    constructor(
        coachingRepository,
        validarSessaoCoaching,
        estudioRepository = null,
        cancelarSessaoCoaching = null,
        reagendarSessaoCoaching = null
    ) {
        this.coachingRepository = coachingRepository;
        this.validarSessaoCoaching = validarSessaoCoaching;
        this.estudioRepository = estudioRepository;
        this.cancelarSessaoCoaching = cancelarSessaoCoaching;
        this.reagendarSessaoCoaching = reagendarSessaoCoaching;
    }

    async criar(req, res) {
        try {
            const dados = req.body;

            if (this.estudioRepository && dados.estudioId) {
                const estudio = await this.estudioRepository.buscarPorId(dados.estudioId);

                if (!estudio) {
                    return res.status(400).json({
                        erro: "Estúdio não encontrado."
                    });
                }

                if (estudio.estado !== "ATIVO") {
                    return res.status(400).json({
                        erro: "Este estúdio não está ativo."
                    });
                }

                if (
                    dados.modalidade &&
                    estudio.modalidadesPermitidas.length > 0 &&
                    !estudio.modalidadesPermitidas.includes(dados.modalidade)
                ) {
                    return res.status(400).json({
                        erro: "Este estúdio não permite a modalidade indicada."
                    });
                }
            }

            if (dados.estudioId && dados.dataInicio && dados.dataFim) {
                const conflito = await this.coachingRepository.procurarConflitoEstudio(
                    dados.estudioId,
                    dados.dataInicio,
                    dados.dataFim
                );

                if (conflito) {
                    return res.status(400).json({
                        erro: "O estúdio já está ocupado nesse horário."
                    });
                }
            }

            const novaSessao = await this.coachingRepository.criar(dados);

            res.status(201).json({
                mensagem: "Sessão criada com sucesso!",
                sessao: novaSessao
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const sessoes = await this.coachingRepository.listarTodos();

            res.status(200).json({
                total: sessoes.length,
                sessoes
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const sessao = await this.coachingRepository.buscarPorId(req.params.id);

            if (!sessao) {
                return res.status(404).json({
                    erro: "Sessão não encontrada."
                });
            }

            res.status(200).json({
                sessao
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listarPorProfessor(req, res) {
        try {
            const professorId = req.params.professorId;

            const sessoes = await this.coachingRepository.listarPorProfessor(professorId);

            res.status(200).json({
                professorId,
                total: sessoes.length,
                sessoes
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async validar(req, res) {
        try {
            const resultado = await this.validarSessaoCoaching.executar(
                req.params.id,
                req.body.papel,
                req.body.valorManual
            );

            res.status(200).json({
                mensagem: "Sessão validada com sucesso!",
                sessao: resultado
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async cancelar(req, res) {
        try {
            const sessao = await this.cancelarSessaoCoaching.executar(
                req.params.id,
                req.body
            );

            res.status(200).json({
                mensagem: "Sessão cancelada com sucesso.",
                sessao
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async reagendar(req, res) {
        try {
            const sessao = await this.reagendarSessaoCoaching.executar(
                req.params.id,
                req.body
            );

            res.status(200).json({
                mensagem: "Sessão reagendada com sucesso.",
                sessao
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = CoachingController;