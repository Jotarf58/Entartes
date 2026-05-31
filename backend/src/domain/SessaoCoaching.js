class SessaoCoaching {
    constructor(id, professorId, alunosIds, duracaoMinutos) {
        // Regras de negócio restritas
        if (alunosIds.length > 8) {
            throw new Error("Uma sessão de coaching não pode ter mais de 8 alunos.");
        }
        if (duracaoMinutos < 30 || duracaoMinutos > 120) {
            throw new Error("A duração da aula deve ser entre 30 e 120 minutos.");
        }

        this.id = id;
        this.professorId = professorId;
        this.alunosIds = alunosIds;
        this.duracaoMinutos = duracaoMinutos;
        this.estado = "AGUARDA_VALIDACAO"; // professor -> direcao -> faturada
    }
}
module.exports = SessaoCoaching;