class Turma {
    constructor(id, modalidade, nivel, lotacaoMaxima, alunosInscritos = []) {
        this.id = id;
        this.modalidade = modalidade;
        this.nivel = nivel;
        this.lotacaoMaxima = lotacaoMaxima;
        this.alunosInscritos = alunosInscritos; // Array com os IDs dos alunos
    }

    // Regra de negócio: A turma tem vaga?
    temVaga() {
        return this.alunosInscritos.length < this.lotacaoMaxima;
    }

    adicionarAluno(alunoId) {
        if (!this.temVaga()) {
            throw new Error("Operação recusada: A turma já atingiu a lotação máxima.");
        }
        if (this.alunosInscritos.includes(alunoId)) {
            throw new Error("O aluno já está inscrito nesta turma.");
        }
        this.alunosInscritos.push(alunoId);
    }
}
module.exports = Turma;