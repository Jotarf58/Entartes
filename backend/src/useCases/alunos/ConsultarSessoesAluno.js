class ConsultarSessoesAluno {
    constructor(sessaoCoachingRepository) {
        this.sessaoCoachingRepository = sessaoCoachingRepository;
    }

    async executar(alunoId) {
        if (!alunoId) {
            throw new Error("O aluno é obrigatório.");
        }

        return await this.sessaoCoachingRepository.listarPorAluno(alunoId);
    }
}

module.exports = ConsultarSessoesAluno;