class InscreverAluno {
    constructor(turmaRepository) {
        this.turmaRepository = turmaRepository;
    }

    async executar(turmaId, alunoId) {
        // Vai buscar a turma à BD
        const turma = await this.turmaRepository.buscarPorId(turmaId);
        
        if (!turma) {
            throw new Error("Turma não encontrada.");
        }

        // Tenta adicionar o aluno (o domínio verifica se há vagas)
        turma.adicionarAluno(alunoId);

        // (Futuro) verificação de conflitos de horário do aluno

        // Guarda a turma atualizada na BD
        await this.turmaRepository.atualizar(turma);

        return turma;
    }
}
module.exports = InscreverAluno;