class ListarAulasSemanais {
    constructor(aulaSemanalRepository) {
        this.aulaSemanalRepository = aulaSemanalRepository;
    }

    async executar(filtros = {}) {
        return await this.aulaSemanalRepository.listarTodas(filtros);
    }
}

module.exports = ListarAulasSemanais;
