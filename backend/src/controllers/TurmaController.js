class TurmaController {
    constructor(inscreverAlunoUseCase, listarTurmasUseCase, turmaRepository) {
        this.inscreverAlunoUseCase = inscreverAlunoUseCase;
        this.listarTurmasUseCase = listarTurmasUseCase;
        this.turmaRepository = turmaRepository;
    }

    async listar(req, res) {
        try {
            const turmas = this.listarTurmasUseCase
                ? await this.listarTurmasUseCase.executar(req.query)
                : await this.turmaRepository.listarTodas(req.query);
            res.status(200).json({ total: turmas.length, turmas });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const turma = await this.turmaRepository.buscarPorId(req.params.id);
            if (!turma) return res.status(404).json({ erro: "Turma não encontrada." });
            res.status(200).json({ turma });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async criar(req, res) {
        try {
            const turma = await this.turmaRepository.guardar(req.body);
            res.status(201).json({ mensagem: "Turma criada com sucesso.", turma });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const turma = await this.turmaRepository.atualizar(req.params.id, req.body);
            if (!turma) return res.status(404).json({ erro: "Turma não encontrada." });
            res.status(200).json({ mensagem: "Turma atualizada com sucesso.", turma });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const turma = await this.turmaRepository.remover(req.params.id);
            if (!turma) return res.status(404).json({ erro: "Turma não encontrada." });
            res.status(200).json({ mensagem: "Turma removida com sucesso.", turma });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async inscrever(req, res) {
        try {
            const turmaId = req.params.id;
            const alunoId = req.body.alunoId || req.utilizador?.perfilAtivo?.id || req.utilizador?.id;
            const resultado = await this.inscreverAlunoUseCase.executar(turmaId, alunoId);
            res.status(200).json({ mensagem: "Aluno inscrito com sucesso na turma!", turma: resultado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async removerAluno(req, res) {
        try {
            const turma = await this.turmaRepository.buscarPorId(req.params.id);
            if (!turma) return res.status(404).json({ erro: "Turma não encontrada." });
            turma.removerAluno(req.params.alunoId);
            const turmaAtualizada = await this.turmaRepository.atualizar(turma);
            res.status(200).json({ mensagem: "Aluno removido da turma.", turma: turmaAtualizada });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = TurmaController;
