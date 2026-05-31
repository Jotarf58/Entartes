class AlunoController {
    constructor(consultarSessoesAlunoUseCase) {
        this.consultarSessoesAlunoUseCase = consultarSessoesAlunoUseCase;
    }

    async consultarSessoes(req, res) {
        try {
            const alunoId = req.params.alunoId;

            const sessoes = await this.consultarSessoesAlunoUseCase.executar(alunoId);

            res.status(200).json({
                sessoes
            });
        } catch (erro) {
            res.status(400).json({
                erro: erro.message
            });
        }
    }
}

module.exports = AlunoController;