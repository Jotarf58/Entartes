class HorarioController {
    constructor(aulaSemanalRepository, listarAulasSemanaisUseCase) {
        this.aulaSemanalRepository = aulaSemanalRepository;
        this.listarAulasSemanaisUseCase = listarAulasSemanaisUseCase;
    }

    async listarAulasSemanais(req, res) {
        try {
            const aulasSemanais = await this.listarAulasSemanaisUseCase.executar(req.query);
            res.status(200).json({ total: aulasSemanais.length, aulasSemanais, aulas: aulasSemanais });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarAula(req, res) {
        try {
            const aula = await this.aulaSemanalRepository.buscarPorId(req.params.id);
            if (!aula) return res.status(404).json({ erro: "Aula não encontrada." });
            res.status(200).json({ aula });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async criarAula(req, res) {
        try {
            const aula = await this.aulaSemanalRepository.guardar(req.body);
            res.status(201).json({ mensagem: "Aula semanal criada com sucesso.", aula });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizarAula(req, res) {
        try {
            const aula = await this.aulaSemanalRepository.atualizar(req.params.id, req.body);
            if (!aula) return res.status(404).json({ erro: "Aula não encontrada." });
            res.status(200).json({ mensagem: "Aula semanal atualizada com sucesso.", aula });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async removerAula(req, res) {
        try {
            const aula = await this.aulaSemanalRepository.remover(req.params.id);
            if (!aula) return res.status(404).json({ erro: "Aula não encontrada." });
            res.status(200).json({ mensagem: "Aula semanal removida com sucesso.", aula });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async solicitarInscricao(req, res) {
        try {
            const aula = await this.aulaSemanalRepository.buscarPorId(req.params.id);
            if (!aula) return res.status(404).json({ erro: "Aula não encontrada." });

            const solicitacao = await this.aulaSemanalRepository.criarSolicitacao({
                aulaId: req.params.id,
                utilizadorId: req.utilizador?.id || req.body.utilizadorId,
                perfilId: req.utilizador?.perfilAtivo?.id || req.body.perfilId,
                perfilNome: req.utilizador?.perfilAtivo?.nome || req.body.perfilNome || "",
                tipo: "INSCRICAO",
                mensagem: req.body.mensagem || ""
            });

            res.status(201).json({ mensagem: "Pedido de inscrição enviado com sucesso.", solicitacao });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async solicitarAlteracao(req, res) {
        try {
            const aula = await this.aulaSemanalRepository.buscarPorId(req.params.id);
            if (!aula) return res.status(404).json({ erro: "Aula não encontrada." });

            const solicitacao = await this.aulaSemanalRepository.criarSolicitacao({
                aulaId: req.params.id,
                utilizadorId: req.utilizador?.id || req.body.utilizadorId,
                perfilId: req.utilizador?.perfilAtivo?.id || req.body.perfilId,
                perfilNome: req.utilizador?.perfilAtivo?.nome || req.body.perfilNome || "",
                tipo: "ALTERACAO",
                mensagem: req.body.mensagem || req.body.textoAlteracao || ""
            });

            res.status(201).json({ mensagem: "Pedido de alteração enviado com sucesso.", solicitacao });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listarSolicitacoes(req, res) {
        try {
            const solicitacoes = await this.aulaSemanalRepository.listarSolicitacoes(req.query);
            res.status(200).json({ total: solicitacoes.length, solicitacoes });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = HorarioController;
