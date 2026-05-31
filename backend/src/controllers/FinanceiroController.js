class FinanceiroController {
    constructor(registoFinanceiroRepository, criarRegistoFinanceiroUseCase) {
        this.registoFinanceiroRepository = registoFinanceiroRepository;
        this.criarRegistoFinanceiroUseCase = criarRegistoFinanceiroUseCase;
    }

    async criar(req, res) {
        try {
            const registo = await this.criarRegistoFinanceiroUseCase.executar(req.body);

            res.status(201).json({
                mensagem: "Registo financeiro criado com sucesso.",
                registo
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async listar(req, res) {
        try {
            const registos = await this.registoFinanceiroRepository.listarTodos();

            const total = registos.reduce((soma, registo) => soma + registo.valor, 0);

            res.status(200).json({
                totalRegistos: registos.length,
                totalValor: total,
                registos
            });
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }

    async exportar(req, res) {
        try {
            const registos = await this.registoFinanceiroRepository.listarTodos();

            const linhas = [
                "Tipo;Descricao;Valor;Data;Origem;Estado",
                ...registos.map((registo) => {
                    const data = registo.data
                        ? new Date(registo.data).toISOString().split("T")[0]
                        : "";

                    return [
                        registo.tipo,
                        registo.descricao,
                        registo.valor,
                        data,
                        registo.origem,
                        registo.estado
                    ].join(";");
                })
            ];

            const csv = linhas.join("\n");

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", "attachment; filename=registos_financeiros.csv");

            res.status(200).send(csv);
        } catch (erro) {
            res.status(400).json({ erro: erro.message });
        }
    }
}

module.exports = FinanceiroController;