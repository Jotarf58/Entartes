class EncerrarAnuncioItem {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async executar(itemId) {
        const item = await this.inventarioRepository.buscarPorId(itemId);

        if (!item) {
            throw new Error("Item não encontrado.");
        }

        if (item.estadoAnuncio === "ENCERRADO") {
            throw new Error("Este anúncio já está encerrado.");
        }

        return await this.inventarioRepository.encerrarAnuncio(itemId);
    }
}

module.exports = EncerrarAnuncioItem;