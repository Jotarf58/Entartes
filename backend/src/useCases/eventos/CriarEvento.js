class CriarEvento {
    constructor(eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    async executar(dados) {
        if (!dados.titulo) throw new Error("O título do evento é obrigatório.");
        if (!dados.data) throw new Error("A data do evento é obrigatória.");
        return await this.eventoRepository.guardar({ ...dados, estado: dados.estado || "ATIVO" });
    }
}

module.exports = CriarEvento;
