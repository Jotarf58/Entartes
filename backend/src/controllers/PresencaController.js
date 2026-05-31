class PresencaController {
    constructor(registarPresencasUseCase) {
        this.registarPresencasUseCase = registarPresencasUseCase;
    }

    async registar(req, res) {
        try {
            const presenca = await this.registarPresencasUseCase.executar(
                req.params.sessaoId,
                req.body
            );

            res.status(201).json({
                mensagem: "Presenças registadas com sucesso.",
                presenca
            });
        } catch (erro) {
            res.status(400).json({
                erro: erro.message
            });
        }
    }
}

module.exports = PresencaController;