const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class LoginUtilizador {
    constructor(utilizadorRepository) {
        this.utilizadorRepository = utilizadorRepository;
    }

    async executar(dados) {
        if (!dados.email) throw new Error("O email é obrigatório.");
        if (!dados.password) throw new Error("A password é obrigatória.");

        const utilizador = await this.utilizadorRepository.buscarPorEmail(dados.email);
        if (!utilizador) throw new Error("Email ou password inválidos.");
        if (utilizador.estado !== "ATIVO") throw new Error("Esta conta está inativa.");

        const passwordValida = await bcrypt.compare(dados.password, utilizador.passwordHash);
        if (!passwordValida) throw new Error("Email ou password inválidos.");

        const perfisDisponiveis = utilizador.perfis
            .filter((perfil) => perfil.ativo)
            .map((perfil) => ({
                id: String(perfil._id),
                perfilId: String(perfil._id),
                nome: perfil.nome,
                tipoPerfil: perfil.tipoPerfil,
                descricao: perfil.descricao || perfil.observacoes || ""
            }));

        if (perfisDisponiveis.length === 0) throw new Error("Esta conta não tem perfis ativos.");

        const tokenConta = jwt.sign(
            {
                tipoToken: "CONTA",
                id: String(utilizador._id),
                email: utilizador.email,
                tiposUtilizador: utilizador.tiposUtilizador
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

        return {
            tokenConta,
            necessitaEscolherPerfil: true,
            utilizador: utilizadorResumo,
            conta: utilizadorResumo,
            perfisDisponiveis
        };
    }
}

module.exports = LoginUtilizador;
