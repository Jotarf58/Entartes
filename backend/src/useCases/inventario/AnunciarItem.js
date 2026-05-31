const ItemInventario = require('../../domain/ItemInventario');

class AnunciarItem {
    constructor(inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    async executar(dadosItem) {
        // Criar o item
        const novoItem = new ItemInventario(
            null, 
            dadosItem.titulo, 
            dadosItem.descricao, 
            dadosItem.estadoConservacao,
            dadosItem.tipoTransacao,
            dadosItem.preco,
            dadosItem.utilizadorId
        );

        // Gravar na BD
        const itemGuardado = await this.inventarioRepository.guardar(novoItem);
        
        // "Thread de emails" a implementar

        return itemGuardado;
    }
}
module.exports = AnunciarItem;