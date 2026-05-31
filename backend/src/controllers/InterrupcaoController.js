class InterrupcaoController {
    constructor(interrupcaoRepository) {
        this.interrupcaoRepository = interrupcaoRepository;
    }

    async listar(req, res) {
        try {
            const interrupcoes = await this.interrupcaoRepository.listarTodos(req.query);
            res.status(200).json({ total: interrupcoes.length, interrupcoes });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const interrupcao = await this.interrupcaoRepository.buscarPorId(req.params.id);
            if (!interrupcao) return res.status(404).json({ erro: "Interrupção não encontrada." });
            res.status(200).json({ interrupcao });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async criar(req, res) {
        try {
            const interrupcao = await this.interrupcaoRepository.guardar(req.body);
            res.status(201).json({ mensagem: "Interrupção criada com sucesso.", interrupcao });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const interrupcao = await this.interrupcaoRepository.atualizar(req.params.id, req.body);
            if (!interrupcao) return res.status(404).json({ erro: "Interrupção não encontrada." });
            res.status(200).json({ mensagem: "Interrupção atualizada com sucesso.", interrupcao });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const interrupcao = await this.interrupcaoRepository.remover(req.params.id);
            if (!interrupcao) return res.status(404).json({ erro: "Interrupção não encontrada." });
            res.status(200).json({ mensagem: "Interrupção removida com sucesso.", interrupcao });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = InterrupcaoController;
