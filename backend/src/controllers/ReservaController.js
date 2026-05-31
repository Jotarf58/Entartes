class ReservaController {
    constructor(marcarReservaUseCase) {
        this.marcarReservaUseCase = marcarReservaUseCase;
    }

    async marcar(req, res) {
        try {
            // Apanhamos os dados que do body
            const { estudioId, tipoAula, horarioInicio, horarioFim } = req.body;

            // Lógica de negócio
            const resultado = await this.marcarReservaUseCase.executar(
                estudioId, tipoAula, horarioInicio, horarioFim
            );

            res.status(201).json({
                mensagem: "Reserva efetuada com sucesso sem conflitos!",
                reserva: resultado
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}
module.exports = ReservaController;