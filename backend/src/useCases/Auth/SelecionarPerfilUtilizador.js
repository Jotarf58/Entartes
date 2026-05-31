const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class SelecionarPerfilUtilizador {
    constructor(utilizadorRepository) {
        this.utilizadorRepository = utilizadorRepository;
    }

    async executar(utilizadorAutenticado, dados) {
        if (!utilizadorAutenticado || !utilizadorAutenticado.id) {
            throw new Error("Utilizador não autenticado.");
        }

        const perfilId = dados.perfilId || dados.id;
        if (!perfilId) throw new Error("O perfil é obrigatório.");

        const utilizador = await this.utilizadorRepository.buscarPorIdComSegredos(utilizadorAutenticado.id);
        if (!utilizador) throw new Error("Conta não encontrada.");
        if (utilizador.estado !== "ATIVO") throw new Error("Esta conta está inativa.");

        const perfil = utilizador.perfis.id(perfilId);
        if (!perfil) throw new Error("Perfil não encontrado nesta conta.");
        if (!perfil.ativo) throw new Error("Este perfil está inativo.");

        if (perfil.tipoPerfil === "ENCARREGADO") {
            if (!dados.pinEncarregado) throw new Error("O PIN de encarregado é obrigatório.");
            if (!utilizador.pinEncarregadoHash) throw new Error("Esta conta não tem PIN de encarregado configurado.");

            const pinValido = await bcrypt.compare(String(dados.pinEncarregado), utilizador.pinEncarregadoHash);
            if (!pinValido) throw new Error("PIN de encarregado inválido.");
        }

        const perfilAtivo = {
            id: String(perfil._id),
            perfilId: String(perfil._id),
            nome: perfil.nome,
            tipoPerfil: perfil.tipoPerfil,
            descricao: perfil.descricao || perfil.observacoes || ""
        };

        const token = jwt.sign(
            {
                tipoToken: "PERFIL",
                id: String(utilizador._id),
                email: utilizador.email,
                tiposUtilizador: utilizador.tiposUtilizador,
                perfilAtivo,
                tipoPerfilAtivo: perfil.tipoPerfil,
                modoAtivo: perfil.tipoPerfil
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        const utilizadorResumo = {
            id: String(utilizador._id),
            nomeConta: utilizador.nomeConta,
            email: utilizador.email,
            tipoConta: utilizador.tipoConta,
            tiposUtilizador: utilizador.tiposUtilizador,
            estado: utilizador.estado
        };

        return { token, utilizador: utilizadorResumo, conta: utilizadorResumo, perfilAtivo };
    }
}

module.exports = SelecionarPerfilUtilizador;
