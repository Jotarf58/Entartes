class VagaController {
    constructor(vagaRepository, criarVagaUseCase, fecharVagaUseCase) {
        this.vagaRepository = vagaRepository;
        this.criarVagaUseCase = criarVagaUseCase;
        this.fecharVagaUseCase = fecharVagaUseCase;
    }

    async criar(req, res) {
        try {
            const vaga = await this.vagaRepository.guardar(req.body);
            res.status(201).json({ mensagem: "Vaga criada com sucesso.", vaga });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const vagas = await this.vagaRepository.listarTodas(req.query);
            res.status(200).json({ total: vagas.length, vagas });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const vaga = await this.vagaRepository.buscarPorId(req.params.id);
            if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
            res.status(200).json({ vaga });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const vaga = await this.vagaRepository.atualizar(req.params.id, req.body);
            if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
            res.status(200).json({ mensagem: "Vaga atualizada com sucesso.", vaga });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async fechar(req, res) {
        try {
            const vaga = await this.vagaRepository.fechar(req.params.id);
            if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
            res.status(200).json({ mensagem: "Vaga fechada com sucesso.", vaga });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async cancelar(req, res) {
        try {
            const vaga = await this.vagaRepository.cancelar(req.params.id);
            if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
            res.status(200).json({ mensagem: "Vaga cancelada com sucesso.", vaga });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async ocupar(req, res) {
        try {
            const vaga = await this.vagaRepository.ocupar(req.params.id);
            if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
            res.status(200).json({ mensagem: "Vaga ocupada com sucesso.", vaga });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const vaga = await this.vagaRepository.remover(req.params.id);
            if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
            res.status(200).json({ mensagem: "Vaga removida com sucesso.", vaga });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = VagaController;
