class RemoverEvento {
    constructor(eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    async executar(eventoId) {
        const evento = await this.eventoRepository.buscarPorId(eventoId);

        if (!evento) {
            throw new Error("Evento não encontrado.");
        }

        return await this.eventoRepository.remover(eventoId);
    }
}

module.exports = RemoverEvento;