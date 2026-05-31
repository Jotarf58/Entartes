const Reserva = require('../../domain/Reserva');

class MarcarReserva {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    async executar(estudioId, tipoAula, horarioInicio, horarioFim) {
        // Cria o pedido de reserva
        const novaReserva = new Reserva(null, estudioId, tipoAula, horarioInicio, horarioFim);

        // Get reservas que já existem para aquele estúdio
        const reservasExistentes = await this.reservaRepository.buscarPorEstudio(estudioId);

        // Verifica conflito com aulas em curso 
        for (const reserva of reservasExistentes) {
            if (novaReserva.temConflito(reserva)) {
                throw new Error("Conflito de horários! O estúdio já está ocupado nessa hora.");
            }
        }

        // Guarda a reserva
        const reservaCriada = await this.reservaRepository.guardar(novaReserva);
        return reservaCriada;
    }
}
module.exports = MarcarReserva;