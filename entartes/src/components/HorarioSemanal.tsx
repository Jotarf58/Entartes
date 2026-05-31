import { aulasSemanais, type DiaSemana } from '../data/mockEntartes';

const diasSemana: DiaSemana[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

type HorarioSemanalProps = {
  professorId?: string;
};

export default function HorarioSemanal({ professorId }: HorarioSemanalProps) {
  const aulasFiltradas = professorId
    ? aulasSemanais.filter((aula) => aula.professorId === professorId)
    : aulasSemanais;

  return (
    <div className="weeklySchedule">
      {diasSemana.map((dia) => {
        const aulasDoDia = aulasFiltradas
          .filter((aula) => aula.diaSemana === dia)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

        return (
          <div className="scheduleDay" key={dia}>
            <h4>{dia}</h4>

            {aulasDoDia.length === 0 ? (
              <p className="scheduleEmpty">Sem aulas marcadas.</p>
            ) : (
              <div className="scheduleLessons">
                {aulasDoDia.map((aula) => (
                  <article className="lessonCard" key={aula.id}>
                    <strong>
                      {aula.horaInicio} - {aula.horaFim}
                    </strong>

                    <span>{aula.turma}</span>

                    <small>
                      {aula.modalidade}
                      {aula.idade ? ` · ${aula.idade}` : ''}
                    </small>

                    <small>{aula.salaNome}</small>
                  </article>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}