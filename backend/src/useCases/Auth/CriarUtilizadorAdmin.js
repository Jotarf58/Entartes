const bcrypt = require("bcryptjs");

class CriarUtilizadorAdmin {
    constructor(utilizadorRepository) {
        this.utilizadorRepository = utilizadorRepository;
    }

    async executar(dados) {
        if (!dados.nomeConta) throw new Error("O nome da conta é obrigatório.");
        if (!dados.email) throw new Error("O email é obrigatório.");
        if (!dados.password) throw new Error("A password é obrigatória.");
        if (dados.password.length < 6) throw new Error("A password deve ter pelo menos 6 caracteres.");
        if (!Array.isArray(dados.perfis) || dados.perfis.length === 0) {
            throw new Error("A conta deve ter pelo menos um perfil.");
        }

        const tiposPermitidos = ["ALUNO", "ENCARREGADO", "PROFESSOR", "DIRECAO", "ADMIN"];
        const tiposContaPermitidos = ["INDIVIDUAL", "FAMILIAR", "FUNCIONARIO", "ESCOLA"];
        const tipoConta = dados.tipoConta || "INDIVIDUAL";

        if (!tiposContaPermitidos.includes(tipoConta)) throw new Error("Tipo de conta inválido.");

        const utilizadorExistente = await this.utilizadorRepository.buscarPorEmail(dados.email);
        if (utilizadorExistente) throw new Error("Já existe uma conta com este email.");

        const perfisNormalizados = dados.perfis.map((perfil) => {
            if (!perfil.nome) throw new Error("Todos os perfis devem ter nome.");
            if (!perfil.tipoPerfil) throw new Error("Todos os perfis devem ter tipo de perfil.");
            if (!tiposPermitidos.includes(perfil.tipoPerfil)) {
                throw new Error(`Tipo de perfil inválido: ${perfil.tipoPerfil}`);
            }

            return {
                nome: perfil.nome,
                tipoPerfil: perfil.tipoPerfil,
                descricao: perfil.descricao || perfil.observacoes || "",
                observacoes: perfil.observacoes || "",
                ativo: perfil.ativo !== undefined ? perfil.ativo : true
            };
        });

        const temEncarregado = perfisNormalizados.some((perfil) => perfil.tipoPerfil === "ENCARREGADO");

        if (temEncarregado && !dados.pinEncarregado) {
            throw new Error("O PIN de encarregado é obrigatório para contas com perfil ENCARREGADO.");
        }

        if (temEncarregado && String(dados.pinEncarregado).length < 4) {
            throw new Error("O PIN de encarregado deve ter pelo menos 4 dígitos.");
        }

        const passwordHash = await bcrypt.hash(dados.password, 10);
        const pinEncarregadoHash = temEncarregado
            ? await bcrypt.hash(String(dados.pinEncarregado), 10)
            : null;

        const tiposUtilizador = [...new Set(perfisNormalizados.map((perfil) => perfil.tipoPerfil))];

        return await this.utilizadorRepository.guardar({
            nomeConta: dados.nomeConta,
            email: dados.email,
            passwordHash,
            pinEncarregadoHash,
            tipoConta,
            tiposUtilizador,
            perfis: perfisNormalizados,
            estado: dados.estado || "ATIVO"
        });
    }
}

module.exports = CriarUtilizadorAdmin;
