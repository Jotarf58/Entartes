class PedidoCoachingController {
    constructor(
        pedidoCoachingRepository,
        submeterPedidoUseCase,
        manifestarInteresseUseCase,
        aceitarPedidoUseCase,
        aprovarPedidoUseCase,
        rejeitarPedidoUseCase
    ) {
        this.pedidoCoachingRepository = pedidoCoachingRepository;
        this.submeterPedidoUseCase = submeterPedidoUseCase;
        this.manifestarInteresseUseCase = manifestarInteresseUseCase;
        this.aceitarPedidoUseCase = aceitarPedidoUseCase;
        this.aprovarPedidoUseCase = aprovarPedidoUseCase;
        this.rejeitarPedidoUseCase = rejeitarPedidoUseCase;
    }

    async criar(req, res) {
        try {
            const dados = {
                ...req.body,
                alunoId: req.body.alunoId || req.utilizador?.perfilAtivo?.id || req.utilizador?.id,
                alunoNome: req.body.alunoNome || req.utilizador?.perfilAtivo?.nome || "",
                notas: req.body.notas || req.body.observacoes || ""
            };
            const pedido = await this.pedidoCoachingRepository.guardar(dados);
            res.status(201).json({ mensagem: "Pedido de coaching submetido com sucesso.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const pedidos = await this.pedidoCoachingRepository.listarTodos(req.query);
            res.status(200).json({ total: pedidos.length, pedidos });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const pedido = await this.pedidoCoachingRepository.buscarPorId(req.params.id);
            if (!pedido) return res.status(404).json({ erro: "Pedido de coaching não encontrado." });
            res.status(200).json({ pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const pedido = await this.pedidoCoachingRepository.atualizar(req.params.id, req.body);
            if (!pedido) return res.status(404).json({ erro: "Pedido de coaching não encontrado." });
            res.status(200).json({ mensagem: "Pedido atualizado com sucesso.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async alterarEstado(req, res) {
        try {
            const pedido = await this.pedidoCoachingRepository.atualizar(req.params.id, { estado: req.body.estado });
            if (!pedido) return res.status(404).json({ erro: "Pedido de coaching não encontrado." });
            res.status(200).json({ mensagem: "Estado atualizado com sucesso.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async associarVaga(req, res) {
        try {
            const pedido = await this.pedidoCoachingRepository.atualizar(req.params.id, {
                vagaId: req.body.vagaId,
                professorId: req.body.professorId,
                professorNome: req.body.professorNome,
                professorPreferencialId: req.body.professorId,
                professorPreferencialNome: req.body.professorNome,
                salaId: req.body.salaId,
                salaNome: req.body.salaNome,
                horarioFinal: req.body.horarioFinal,
                estado: req.body.estado || "AGENDADO"
            });
            if (!pedido) return res.status(404).json({ erro: "Pedido de coaching não encontrado." });
            res.status(200).json({ mensagem: "Vaga associada com sucesso.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async manifestarInteresse(req, res) {
        try {
            const pedido = await this.manifestarInteresseUseCase.executar(req.params.id, req.body);
            res.status(200).json({ mensagem: "Interesse registado com sucesso.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async aceitar(req, res) {
        try {
            const pedido = await this.aceitarPedidoUseCase.executar(req.params.id, req.body);
            res.status(200).json({ mensagem: "Pedido aceite pelo professor.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async aprovar(req, res) {
        try {
            let pedido;
            try {
                pedido = await this.aprovarPedidoUseCase.executar(req.params.id);
            } catch (_) {
                pedido = await this.pedidoCoachingRepository.atualizar(req.params.id, { estado: "APROVADO" });
            }
            res.status(200).json({ mensagem: "Pedido aprovado pela direção.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async rejeitar(req, res) {
        try {
            const pedido = await this.pedidoCoachingRepository.atualizar(req.params.id, {
                estado: "REJEITADO",
                motivoRejeicao: req.body.motivoRejeicao || req.body.motivo || ""
            });
            if (!pedido) return res.status(404).json({ erro: "Pedido de coaching não encontrado." });
            res.status(200).json({ mensagem: "Pedido rejeitado.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async responderConvite(req, res) {
        try {
            const alunoId = req.body.alunoId || req.utilizador?.perfilAtivo?.id || req.utilizador?.id;
            const estado = req.body.estado === "ACEITE" ? "ACEITE" : "RECUSADO";

            if (!alunoId) return res.status(400).json({ erro: "Aluno não identificado." });

            const pedido = await this.pedidoCoachingRepository.responderConvite(req.params.id, alunoId, estado);
            if (!pedido) return res.status(404).json({ erro: "Convite não encontrado." });

            res.status(200).json({ mensagem: "Convite atualizado com sucesso.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const pedido = await this.pedidoCoachingRepository.remover(req.params.id);
            if (!pedido) return res.status(404).json({ erro: "Pedido de coaching não encontrado." });
            res.status(200).json({ mensagem: "Pedido removido com sucesso.", pedido });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = PedidoCoachingController;
