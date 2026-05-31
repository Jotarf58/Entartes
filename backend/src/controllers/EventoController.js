class EventoController {
    constructor(eventoRepository, criarEventoUseCase, atualizarEventoUseCase, removerEventoUseCase) {
        this.eventoRepository = eventoRepository;
        this.criarEventoUseCase = criarEventoUseCase;
        this.atualizarEventoUseCase = atualizarEventoUseCase;
        this.removerEventoUseCase = removerEventoUseCase;
    }

    async criar(req, res) {
        try {
            const evento = await this.criarEventoUseCase.executar(req.body);
            res.status(201).json({ mensagem: "Evento criado com sucesso.", evento });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const eventos = await this.eventoRepository.listarTodos(req.query);
            res.status(200).json({ total: eventos.length, eventos });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const evento = await this.eventoRepository.buscarPorId(req.params.id);
            if (!evento) return res.status(404).json({ erro: "Evento não encontrado." });
            res.status(200).json({ evento });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const evento = await this.atualizarEventoUseCase.executar(req.params.id, req.body);
            res.status(200).json({ mensagem: "Evento atualizado com sucesso.", evento });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizarEstado(req, res) {
        try {
            const evento = await this.eventoRepository.atualizar(req.params.id, { estado: req.body.estado });
            if (!evento) return res.status(404).json({ erro: "Evento não encontrado." });
            res.status(200).json({ mensagem: "Estado do evento atualizado com sucesso.", evento });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const evento = await this.removerEventoUseCase.executar(req.params.id);
            res.status(200).json({ mensagem: "Evento removido com sucesso.", evento });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async criarAutorizacao(req, res) {
        try {
            const evento = await this.eventoRepository.buscarPorId(req.params.id);
            if (!evento) return res.status(404).json({ erro: "Evento não encontrado." });

            const autorizacao = await this.eventoRepository.criarAutorizacao({
                eventoId: req.params.id,
                utilizadorId: req.utilizador?.id || req.body.utilizadorId,
                perfilId: req.utilizador?.perfilAtivo?.id || req.body.perfilId,
                alunoId: req.body.alunoId || null,
                alunoNome: req.body.alunoNome || req.utilizador?.perfilAtivo?.nome || "",
                encarregadoNome: req.body.encarregadoNome || "",
                estado: req.body.estado || "AUTORIZADO",
                observacoes: req.body.observacoes || ""
            });

            res.status(201).json({ mensagem: "Autorização registada com sucesso.", autorizacao });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listarAutorizacoes(req, res) {
        try {
            const autorizacoes = await this.eventoRepository.listarAutorizacoes(req.params.id);
            res.status(200).json({ total: autorizacoes.length, autorizacoes });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = EventoController;
