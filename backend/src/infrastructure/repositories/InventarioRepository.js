const ItemInventarioModel = require("../database/models/ItemInventarioModel");

class InventarioRepository {
    normalizarItem(item) {
        const nome = item.nome || item.titulo;
        const titulo = item.titulo || item.nome;
        return {
            nome,
            titulo,
            descricao: item.descricao,
            tipo: item.tipo || "OUTRO",
            modalidade: item.modalidade || "",
            tamanho: item.tamanho || "",
            estadoConservacao: item.estadoConservacao,
            tipoTransacao: item.tipoTransacao || "REQUISITAR",
            preco: item.preco || item.taxaSimbolica || 0,
            taxaSimbolica: item.taxaSimbolica || item.preco || 0,
            utilizadorId: item.utilizadorId,
            origem: item.origem || "ENCARREGADO",
            dataInicioDisponibilidade: item.dataInicioDisponibilidade || null,
            dataFimDisponibilidade: item.dataFimDisponibilidade || null,
            imagemUrl: item.imagemUrl || "",
            estadoAnuncio: item.estadoAnuncio || "ATIVO"
        };
    }

    async guardar(item) {
        return await ItemInventarioModel.create(this.normalizarItem(item));
    }

    async listarTodos(filtros = {}) {
        const query = {};
        if (filtros.tipo && filtros.tipo !== "TODOS") query.tipo = filtros.tipo;
        if (filtros.modalidade && filtros.modalidade !== "TODAS") query.modalidade = filtros.modalidade;
        if (filtros.estadoAnuncio) query.estadoAnuncio = filtros.estadoAnuncio;
        if (filtros.origem) query.origem = filtros.origem;
        return await ItemInventarioModel.find(query).sort({ createdAt: -1 });
    }

    async buscarPorId(id) {
        return await ItemInventarioModel.findById(id);
    }

    async atualizarAnuncio(id, dados) {
        return await ItemInventarioModel.findByIdAndUpdate(id, this.normalizarItem({ ...dados, utilizadorId: dados.utilizadorId || undefined }), {
            new: true,
            runValidators: true
        });
    }

    async atualizar(id, dados) {
        return await ItemInventarioModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
    }

    async encerrarAnuncio(id) {
        return await ItemInventarioModel.findByIdAndUpdate(id, { estadoAnuncio: "ENCERRADO" }, { new: true });
    }

    async remover(id) {
        return await ItemInventarioModel.findByIdAndDelete(id);
    }

    async adicionarRequisicao(itemId, dadosRequisicao) {
        return await ItemInventarioModel.findByIdAndUpdate(
            itemId,
            { $push: { requisicoes: dadosRequisicao } },
            { new: true, runValidators: true }
        );
    }

    async atualizarEstadoRequisicao(itemId, requisicaoId, novoEstado) {
        return await ItemInventarioModel.findOneAndUpdate(
            { _id: itemId, "requisicoes._id": requisicaoId },
            { $set: { "requisicoes.$.estado": novoEstado } },
            { new: true }
        );
    }

    async aceitarRequisicao(itemId, requisicaoId) {
        return await ItemInventarioModel.findOneAndUpdate(
            { _id: itemId, "requisicoes._id": requisicaoId },
            {
                $set: {
                    "requisicoes.$.estado": "ACEITE",
                    estadoAnuncio: "RESERVADO"
                }
            },
            { new: true }
        );
    }
}

module.exports = InventarioRepository;
