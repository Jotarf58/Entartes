class Reserva {
    constructor(id, estudioId, tipoAula, horarioInicio, horarioFim) {
        this.id = id;
        this.estudioId = estudioId;
        this.tipoAula = tipoAula; // Pode ser "TURMA" ou "PRIVADA"
        this.horarioInicio = new Date(horarioInicio);
        this.horarioFim = new Date(horarioFim);

        if (this.horarioInicio >= this.horarioFim) {
            throw new Error("O horário de início tem de ser antes do fim da aula.");
        }
    }

    // Regra de Negócio: Duas reservas sobrepõem-se?
    temConflito(outraReserva) {
        return (this.horarioInicio < outraReserva.horarioFim && this.horarioFim > outraReserva.horarioInicio);
    }
}
module.exports = Reserva;