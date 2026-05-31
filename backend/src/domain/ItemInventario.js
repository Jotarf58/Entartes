class ItemInventario {
    constructor(id, titulo, descricao, estadoConservacao, tipoTransacao, preco, utilizadorId) {
        if (!titulo || !descricao) {
            throw new Error("O título e a descrição são obrigatórios.");
        }
        if (tipoTransacao !== "ALUGAR" && tipoTransacao !== "VENDER") {
            throw new Error("O tipo de transação deve ser ALUGAR ou VENDER.");
        }
        if (preco < 0) {
            throw new Error("O preço não pode ser negativo.");
        }

        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.estadoConservacao = estadoConservacao; // Estados: "Novo", "Usado"
        this.tipoTransacao = tipoTransacao; 
        this.preco = preco; // Taxa simbolica
        this.utilizadorId = utilizadorId; // Tipo de user (escola, encarregado, aluno)
        this.estadoAnuncio = "ATIVO"; 
    }
}
module.exports = ItemInventario;