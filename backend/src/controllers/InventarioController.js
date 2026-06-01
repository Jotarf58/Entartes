class InventarioController {
    constructor(
        inventarioRepository,
        anunciarItemUseCase,
        requisitarItemUseCase,
        aceitarRequisicaoUseCase,
        rejeitarRequisicaoUseCase,
        editarAnuncioUseCase,
        encerrarAnuncioUseCase
    ) {
        this.inventarioRepository = inventarioRepository;
        this.anunciarItemUseCase = anunciarItemUseCase;
        this.requisitarItemUseCase = requisitarItemUseCase;
        this.aceitarRequisicaoUseCase = aceitarRequisicaoUseCase;
        this.rejeitarRequisicaoUseCase = rejeitarRequisicaoUseCase;
        this.editarAnuncioUseCase = editarAnuncioUseCase;
        this.encerrarAnuncioUseCase = encerrarAnuncioUseCase;
    }

    prepararDadosItem(req) {
        return {
            ...req.body,
            utilizadorId: req.body.utilizadorId || req.utilizador?.id,
            nome: req.body.nome || req.body.titulo,
            titulo: req.body.titulo || req.body.nome,
            tipoTransacao: req.body.tipoTransacao || "REQUISITAR",
            estadoAnuncio: req.body.estadoAnuncio || "ATIVO"
        };
    }

    async anunciar(req, res) {
        try {
            const resultado = await this.inventarioRepository.guardar(this.prepararDadosItem(req));
            res.status(201).json({ mensagem: "Item anunciado com sucesso.", item: resultado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const itens = await this.inventarioRepository.listarTodos(req.query);
            res.status(200).json({ total: itens.length, itens });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const item = await this.inventarioRepository.buscarPorId(req.params.id);
            if (!item) return res.status(404).json({ erro: "Item não encontrado." });
            res.status(200).json({ item });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async requisitar(req, res) {
        try {
            const dados = {
                ...req.body,
                utilizadorId: req.body.utilizadorId || req.utilizador?.id,
                perfilId: req.body.perfilId || req.utilizador?.perfilAtivo?.id,
                perfilNome: req.body.perfilNome || req.utilizador?.perfilAtivo?.nome || ""
            };
            const itemAtualizado = await this.requisitarItemUseCase.executar(req.params.id, dados);
            res.status(200).json({ mensagem: "Solicitação registada com sucesso.", item: itemAtualizado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async aceitarRequisicao(req, res) {
        try {
            const itemAtualizado = await this.aceitarRequisicaoUseCase.executar(req.params.id, req.params.requisicaoId);
            res.status(200).json({ mensagem: "Requisição aceite com sucesso.", item: itemAtualizado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async rejeitarRequisicao(req, res) {
        try {
            const itemAtualizado = await this.rejeitarRequisicaoUseCase.executar(req.params.id, req.params.requisicaoId);
            res.status(200).json({ mensagem: "Requisição rejeitada com sucesso.", item: itemAtualizado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async aceitarSugestao(req, res) {
        try {
            const item = await this.inventarioRepository.buscarPorId(req.params.id);
            if (!item) return res.status(404).json({ erro: "Item não encontrado." });

            const requisicao = item.requisicoes.id(req.params.requisicaoId);
            if (!requisicao) return res.status(404).json({ erro: "Requisição não encontrada." });

            if (!requisicao.dataSugeridaInicio && !requisicao.dataSugeridaFim) {
                return res.status(400).json({ erro: "Não existe nenhuma sugestão de data para aceitar." });
            }

            const itemAtualizado = await this.inventarioRepository.aceitarSugestaoRequisicao(
                req.params.id,
                req.params.requisicaoId,
                {
                    dataInicio: requisicao.dataSugeridaInicio || requisicao.dataInicio || null,
                    dataFim: requisicao.dataSugeridaFim || requisicao.dataFim || null
                }
            );

            res.status(200).json({ mensagem: "Nova data aceite com sucesso.", item: itemAtualizado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async sugerirData(req, res) {
        try {
            const item = await this.inventarioRepository.buscarPorId(req.params.id);
            if (!item) return res.status(404).json({ erro: "Item não encontrado." });

            const requisicao = item.requisicoes.id(req.params.requisicaoId);
            if (!requisicao) return res.status(404).json({ erro: "Requisição não encontrada." });

            if (requisicao.estado !== "PENDENTE") {
                return res.status(400).json({ erro: "Esta requisição já foi tratada." });
            }

            const itemAtualizado = await this.inventarioRepository.sugerirData(req.params.id, req.params.requisicaoId, {
                dataSugeridaInicio: req.body.dataSugeridaInicio || null,
                dataSugeridaFim: req.body.dataSugeridaFim || null,
                mensagemResposta: req.body.mensagemResposta || ""
            });

            res.status(200).json({ mensagem: "Sugestão de data enviada com sucesso.", item: itemAtualizado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async editarAnuncio(req, res) {
        try {
            const itemAtualizado = await this.inventarioRepository.atualizar(req.params.id, this.prepararDadosItem(req));
            if (!itemAtualizado) return res.status(404).json({ erro: "Item não encontrado." });
            res.status(200).json({ mensagem: "Anúncio atualizado com sucesso.", item: itemAtualizado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async encerrarAnuncio(req, res) {
        try {
            const itemAtualizado = await this.encerrarAnuncioUseCase.executar(req.params.id);
            res.status(200).json({ mensagem: "Anúncio encerrado com sucesso.", item: itemAtualizado });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const item = await this.inventarioRepository.remover(req.params.id);
            if (!item) return res.status(404).json({ erro: "Item não encontrado." });
            res.status(200).json({ mensagem: "Item removido com sucesso.", item });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = InventarioController;
