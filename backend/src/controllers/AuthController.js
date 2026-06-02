const bcrypt = require("bcryptjs");

class AuthController {
    constructor(
        utilizadorRepository,
        criarUtilizadorAdminUseCase,
        loginUtilizadorUseCase,
        selecionarPerfilUtilizadorUseCase
    ) {
        this.utilizadorRepository = utilizadorRepository;
        this.criarUtilizadorAdminUseCase = criarUtilizadorAdminUseCase;
        this.loginUtilizadorUseCase = loginUtilizadorUseCase;
        this.selecionarPerfilUtilizadorUseCase = selecionarPerfilUtilizadorUseCase;
    }

    async criarUtilizador(req, res) {
        try {
            const utilizador = await this.criarUtilizadorAdminUseCase.executar(req.body);
            res.status(201).json({ mensagem: "Utilizador criado com sucesso.", utilizador });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async login(req, res) {
        try {
            const resultado = await this.loginUtilizadorUseCase.executar(req.body);
            res.status(200).json({ mensagem: "Login efetuado com sucesso.", ...resultado });
        } catch (erro) {
            res.status(401).json({ erro: erro.message });
        }
    }

    async selecionarPerfil(req, res) {
        try {
            const resultado = await this.selecionarPerfilUtilizadorUseCase.executar(req.utilizador, req.body);
            res.status(200).json({ mensagem: "Perfil selecionado com sucesso.", ...resultado });
        } catch (erro) {
            res.status(403).json({ erro: erro.message });
        }
    }

    async perfil(req, res) {
        try {
            const utilizador = await this.utilizadorRepository.buscarPorId(req.utilizador.id);
            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });

            res.status(200).json({
                utilizador,
                autenticacao: {
                    tipoToken: req.utilizador.tipoToken,
                    perfilAtivo: req.utilizador.perfilAtivo,
                    tipoPerfilAtivo: req.utilizador.tipoPerfilAtivo,
                    modoAtivo: req.utilizador.modoAtivo
                }
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }


    async listarProfessores(req, res) {
        try {
            const utilizadores = await this.utilizadorRepository.listarTodos();

            const professores = utilizadores.flatMap((utilizador) =>
                (utilizador.perfis || [])
                    .filter((perfil) =>
                        perfil.tipoPerfil === "PROFESSOR" && perfil.ativo !== false
                    )
                    .map((perfil) => ({
                        id: String(perfil._id),
                        nome: perfil.nome,
                        contaId: String(utilizador._id),
                        email: utilizador.email,
                        tipoPerfil: perfil.tipoPerfil,
                        ativo: perfil.ativo !== false
                    }))
            );

            res.status(200).json({
                total: professores.length,
                professores
            });
        } catch (erro) {
            res.status(400).json({
                erro: erro.message
            });
        }
    }

    async listarAlunos(req, res) {
        try {
            const utilizadores = await this.utilizadorRepository.listarTodos();

            const alunos = utilizadores.flatMap((utilizador) =>
                (utilizador.perfis || [])
                    .filter((perfil) => perfil.tipoPerfil === "ALUNO" && perfil.ativo !== false)
                    .map((perfil) => ({
                        id: String(perfil._id),
                        nome: perfil.nome,
                        contaId: String(utilizador._id)
                    }))
            );

            res.status(200).json({ total: alunos.length, alunos });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const utilizadores = await this.utilizadorRepository.listarTodos(req.query);
            res.status(200).json({ total: utilizadores.length, utilizadores });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const utilizador = await this.utilizadorRepository.buscarPorId(req.params.id);
            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });
            res.status(200).json({ utilizador });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const dados = { ...req.body };
            delete dados.password;
            delete dados.passwordHash;
            delete dados.pinEncarregado;
            delete dados.pinEncarregadoHash;

            if (Array.isArray(dados.perfis)) {
                dados.tiposUtilizador = [...new Set(dados.perfis.map((perfil) => perfil.tipoPerfil))];
            }

            const utilizador = await this.utilizadorRepository.atualizar(req.params.id, dados);
            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });

            res.status(200).json({ mensagem: "Utilizador atualizado com sucesso.", utilizador });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async alterarEstado(req, res) {
        try {
            const { estado } = req.body;
            if (!["ATIVO", "INATIVO"].includes(estado)) throw new Error("Estado inválido.");

            const utilizador = await this.utilizadorRepository.atualizar(req.params.id, { estado });
            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });

            res.status(200).json({ mensagem: "Estado atualizado com sucesso.", utilizador });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async alterarPassword(req, res) {
        try {
            const { password } = req.body;
            if (!password || password.length < 6) throw new Error("A nova password deve ter pelo menos 6 caracteres.");

            const passwordHash = await bcrypt.hash(password, 10);
            const utilizador = await this.utilizadorRepository.atualizar(req.params.id, { passwordHash });
            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });

            res.status(200).json({ mensagem: "Password atualizada com sucesso." });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async alterarPinEncarregado(req, res) {
        try {
            const { pinEncarregado } = req.body;
            if (!pinEncarregado || String(pinEncarregado).length < 4) {
                throw new Error("O PIN de encarregado deve ter pelo menos 4 dígitos.");
            }

            const pinEncarregadoHash = await bcrypt.hash(String(pinEncarregado), 10);
            const utilizador = await this.utilizadorRepository.atualizar(req.params.id, { pinEncarregadoHash });
            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });

            res.status(200).json({ mensagem: "PIN de encarregado atualizado com sucesso." });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async remover(req, res) {
        try {
            const utilizador = await this.utilizadorRepository.remover(req.params.id);
            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });
            res.status(200).json({ mensagem: "Utilizador removido com sucesso.", utilizador });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async adicionarPerfil(req, res) {
        try {
            const nome = String(req.body.nome || "").trim();
            const tipoPerfil = req.body.tipoPerfil || "ALUNO";

            if (!nome) {
                return res.status(400).json({ erro: "O nome do perfil é obrigatório." });
            }

            const tiposPermitidos = ["ALUNO", "ENCARREGADO", "PROFESSOR", "DIRECAO", "ADMIN"];

            if (!tiposPermitidos.includes(tipoPerfil)) {
                return res.status(400).json({ erro: "Tipo de perfil inválido." });
            }

            const utilizador = await this.utilizadorRepository.adicionarPerfil(req.params.id, {
                nome,
                tipoPerfil,
                descricao: req.body.descricao || "",
                observacoes: req.body.observacoes || "",
                ativo: true
            });

            if (!utilizador) return res.status(404).json({ erro: "Utilizador não encontrado." });

            res.status(201).json({ mensagem: "Perfil adicionado com sucesso.", utilizador });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = AuthController;
