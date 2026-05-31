class EstudioController {
    constructor(estudioRepository, criarEstudioUseCase, verificarDisponibilidadeUseCase) {
        this.estudioRepository = estudioRepository;
        this.criarEstudioUseCase = criarEstudioUseCase;
        this.verificarDisponibilidadeUseCase = verificarDisponibilidadeUseCase;
    }

    async criar(req, res) {
        try {
            const estudio = await this.criarEstudioUseCase.executar(req.body);
            res.status(201).json({ mensagem: "Estúdio criado com sucesso.", estudio, sala: estudio });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const estudios = await this.estudioRepository.listarTodos(req.query);
            res.status(200).json({ total: estudios.length, estudios, salas: estudios });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const estudio = await this.estudioRepository.buscarPorId(req.params.id);
            if (!estudio) return res.status(404).json({ erro: "Estúdio não encontrado." });
            res.status(200).json({ estudio, sala: estudio });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const estudio = await this.estudioRepository.atualizar(req.params.id, req.body);
            if (!estudio) return res.status(404).json({ erro: "Estúdio não encontrado." });
            res.status(200).json({ mensagem: "Estúdio atualizado com sucesso.", estudio, sala: estudio });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const estudio = await this.estudioRepository.remover(req.params.id);
            if (!estudio) return res.status(404).json({ erro: "Estúdio não encontrado." });
            res.status(200).json({ mensagem: "Estúdio removido com sucesso.", estudio, sala: estudio });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async disponibilidade(req, res) {
        try {
            const resultado = await this.verificarDisponibilidadeUseCase.executar(
                req.params.id,
                req.query.dataInicio,
                req.query.dataFim
            );
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = EstudioController;
