const express = require("express");
const router = express.Router();

const SolicitacaoAula = require("../database/models/SolicitacaoAulaModel");
const authMiddleware = require("../middlewares/authMiddleware");
const autorizarTipos = require("../middlewares/autorizarTipos");

router.get(
    "/",
    authMiddleware,
    autorizarTipos("DIRECAO", "ADMIN"),
    async (req, res) => {
        try {
            const filtro = {};

            if (req.query.estado && req.query.estado !== "TODOS") {
                filtro.estado = req.query.estado;
            }

            if (req.query.tipo && req.query.tipo !== "TODOS") {
                filtro.tipo = req.query.tipo;
            }

            const solicitacoes = await SolicitacaoAula.find(filtro)
                .sort({ createdAt: -1 })
                .lean();

            res.status(200).json({
                total: solicitacoes.length,
                solicitacoes: solicitacoes.map((item) => ({
                    ...item,
                    id: String(item._id),
                    _id: undefined,
                    __v: undefined
                }))
            });
        } catch (erro) {
            res.status(400).json({
                erro: erro.message
            });
        }
    }
);

router.patch(
    "/:id/aceitar",
    authMiddleware,
    autorizarTipos("DIRECAO", "ADMIN"),
    async (req, res) => {
        try {
            const solicitacao = await SolicitacaoAula.findByIdAndUpdate(
                req.params.id,
                {
                    estado: "ACEITE",
                    resposta: req.body?.resposta || "Solicitação aceite pela coordenação.",
                    decisaoPor:
                        req.utilizador?.perfilAtivo?.id ||
                        req.utilizador?.perfilAtivo?._id ||
                        req.utilizador?.id ||
                        null,
                    decisaoEm: new Date()
                },
                {
                    returnDocument: "after",
                    runValidators: true
                }
            );

            if (!solicitacao) {
                return res.status(404).json({
                    erro: "Solicitação não encontrada."
                });
            }

            res.status(200).json({
                mensagem: "Solicitação aceite com sucesso.",
                solicitacao
            });
        } catch (erro) {
            res.status(400).json({
                erro: erro.message
            });
        }
    }
);

router.patch(
    "/:id/rejeitar",
    authMiddleware,
    autorizarTipos("DIRECAO", "ADMIN"),
    async (req, res) => {
        try {
            const solicitacao = await SolicitacaoAula.findByIdAndUpdate(
                req.params.id,
                {
                    estado: "REJEITADA",
                    motivoRejeicao:
                        req.body?.motivoRejeicao ||
                        req.body?.resposta ||
                        "Solicitação rejeitada pela coordenação.",
                    resposta:
                        req.body?.resposta ||
                        req.body?.motivoRejeicao ||
                        "Solicitação rejeitada pela coordenação.",
                    decisaoPor:
                        req.utilizador?.perfilAtivo?.id ||
                        req.utilizador?.perfilAtivo?._id ||
                        req.utilizador?.id ||
                        null,
                    decisaoEm: new Date()
                },
                {
                    returnDocument: "after",
                    runValidators: true
                }
            );

            if (!solicitacao) {
                return res.status(404).json({
                    erro: "Solicitação não encontrada."
                });
            }

            res.status(200).json({
                mensagem: "Solicitação rejeitada com sucesso.",
                solicitacao
            });
        } catch (erro) {
            res.status(400).json({
                erro: erro.message
            });
        }
    }
);

module.exports = router;
