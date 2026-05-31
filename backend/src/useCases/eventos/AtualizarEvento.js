class AtualizarEvento {
    constructor(eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    async executar(eventoId, dados) {
        const evento = await this.eventoRepository.buscarPorId(eventoId);
        if (!evento) throw new Error("Evento não encontrado.");
        return await this.eventoRepository.atualizar(eventoId, dados);
    }
}

module.exports = AtualizarEvento;
