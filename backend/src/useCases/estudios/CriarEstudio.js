class CriarEstudio {
    constructor(estudioRepository) {
        this.estudioRepository = estudioRepository;
    }

    async executar(dados) {
        if (!dados.nome) {
            throw new Error("O nome do estúdio é obrigatório.");
        }

        if (!dados.capacidade) {
            throw new Error("A capacidade do estúdio é obrigatória.");
        }

        return await this.estudioRepository.guardar({
            nome: dados.nome,
            capacidade: dados.capacidade,
            modalidadesPermitidas: dados.modalidadesPermitidas || [],
            estado: dados.estado || "ATIVO"
        });
    }
}

module.exports = CriarEstudio;