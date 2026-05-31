class ListarTurmas {
    constructor(turmaRepository) {
        this.turmaRepository = turmaRepository;
    }

    async executar(filtros = {}) {
        return await this.turmaRepository.listarTodas(filtros);
    }
}

module.exports = ListarTurmas;
