 export type DiaSemana =
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado';

export type TipoAluno = 'CRIANCA_JOVEM' | 'ADULTO';

export type EstadoPedidoCoaching =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'AGENDADO'
  | 'APROVADO'
  | 'REJEITADO';

export type TipoFigurinoAcessorio =
  | 'FIGURINO'
  | 'ACESSORIO'
  | 'CALCADO'
  | 'MAQUILHAGEM'
  | 'OUTRO';

export type RepeticaoVaga =
  | 'NAO_REPETIR'
  | 'DIARIA'
  | 'SEMANAL'
  | 'MENSAL';

export const professores = [
  { id: 'prof_ana_luis', nome: 'Ana Luís Gomes' },
  { id: 'prof_barbara', nome: 'Bárbara Magalhães' },
  { id: 'prof_filipe', nome: 'Filipe Narciso' },
  { id: 'prof_natalia', nome: 'Natália Azevedo' },
  { id: 'prof_edson', nome: 'Edson Nascimento' },
  { id: 'prof_sara', nome: 'Sara Vilas Boas' },
  { id: 'prof_daniela', nome: 'Daniela Fernandes' },
  { id: 'prof_maria_borges', nome: 'Maria Borges' },
  { id: 'prof_rodolfo', nome: 'Rodolfo Iocca' },
  { id: 'prof_alexandra', nome: 'Alexandra Galvão' },
  { id: 'prof_joana', nome: 'Joana Moreira' },
  { id: 'prof_diana', nome: 'Diana Faria' },
  { id: 'prof_carolina', nome: 'Carolina Correa' },
];

export const modalidades = [
  'Ballet',
  'Jazz',
  'Dança Contemporânea',
  'Acrodance',
  'Ginástica Acrobática',
  'Hip Hop',
  'Teatro Musical',
  'Commercial Fusion',
  'Body Balance',
  'Flexibilidade',
  'Condicionamento Físico',
];

export const salas = [
  { id: 'estudio_1', nome: 'Estúdio 1', tipo: 'Estúdio' },
  { id: 'estudio_2', nome: 'Estúdio 2', tipo: 'Estúdio' },
  { id: 'estudio_3', nome: 'Estúdio 3', tipo: 'Estúdio' },
  { id: 'sala_sa_miranda', nome: 'Sala Sá de Miranda', tipo: 'Sala externa' },
  { id: 'espaco_vita', nome: 'Espaço Vita', tipo: 'Evento' },
];

export const aulasSemanais = [
  {
    id: 'aula_001',
    diaSemana: 'Segunda-feira' as DiaSemana,
    horaInicio: '18:00',
    horaFim: '19:00',
    modalidade: 'Jazz',
    turma: 'Jazz 1',
    idade: '4-6 anos',
    professorId: 'prof_ana_luis',
    professorNome: 'Ana Luís Gomes',
    salaId: 'estudio_1',
    salaNome: 'Estúdio 1',
    tipo: 'Aula regular',
  },
  {
    id: 'aula_002',
    diaSemana: 'Segunda-feira' as DiaSemana,
    horaInicio: '19:00',
    horaFim: '20:00',
    modalidade: 'Acrodance',
    turma: 'Acrodance I',
    idade: '7+ anos',
    professorId: 'prof_ana_luis',
    professorNome: 'Ana Luís Gomes',
    salaId: 'estudio_2',
    salaNome: 'Estúdio 2',
    tipo: 'Aula regular',
  },
  {
    id: 'aula_003',
    diaSemana: 'Terça-feira' as DiaSemana,
    horaInicio: '18:00',
    horaFim: '19:00',
    modalidade: 'Jazz',
    turma: 'Jazz Intensivo 0',
    idade: '',
    professorId: 'prof_edson',
    professorNome: 'Edson Nascimento',
    salaId: 'estudio_1',
    salaNome: 'Estúdio 1',
    tipo: 'Aula intensiva',
  },
  {
    id: 'aula_004',
    diaSemana: 'Terça-feira' as DiaSemana,
    horaInicio: '20:45',
    horaFim: '21:45',
    modalidade: 'Personal Training',
    turma: 'PT',
    idade: 'Nível aberto',
    professorId: 'prof_natalia',
    professorNome: 'Natália Azevedo',
    salaId: 'estudio_2',
    salaNome: 'Estúdio 2',
    tipo: 'Aula complementar',
  },
  {
    id: 'aula_005',
    diaSemana: 'Quarta-feira' as DiaSemana,
    horaInicio: '18:00',
    horaFim: '18:45',
    modalidade: 'Ballet',
    turma: 'Preparatório 1',
    idade: '5 anos',
    professorId: 'prof_daniela',
    professorNome: 'Daniela Fernandes',
    salaId: 'estudio_1',
    salaNome: 'Estúdio 1',
    tipo: 'Aula regular',
  },
  {
    id: 'aula_006',
    diaSemana: 'Quarta-feira' as DiaSemana,
    horaInicio: '19:15',
    horaFim: '20:15',
    modalidade: 'Jazz',
    turma: 'Jazz Intensivo 1',
    idade: '',
    professorId: 'prof_edson',
    professorNome: 'Edson Nascimento',
    salaId: 'estudio_1',
    salaNome: 'Estúdio 1',
    tipo: 'Aula intensiva',
  },
  {
    id: 'aula_007',
    diaSemana: 'Quinta-feira' as DiaSemana,
    horaInicio: '18:00',
    horaFim: '19:15',
    modalidade: 'Ginástica Acrobática',
    turma: 'Ginástica Acrobática Iniciação I',
    idade: '6+ anos',
    professorId: 'prof_sara',
    professorNome: 'Sara Vilas Boas',
    salaId: 'estudio_2',
    salaNome: 'Estúdio 2',
    tipo: 'Aula regular',
  },
  {
    id: 'aula_008',
    diaSemana: 'Quinta-feira' as DiaSemana,
    horaInicio: '20:30',
    horaFim: '22:00',
    modalidade: 'Jazz',
    turma: 'Jazz Adultos',
    idade: 'Adultos',
    professorId: 'prof_edson',
    professorNome: 'Edson Nascimento',
    salaId: 'estudio_1',
    salaNome: 'Estúdio 1',
    tipo: 'Aula adultos',
  },
  {
    id: 'aula_009',
    diaSemana: 'Sexta-feira' as DiaSemana,
    horaInicio: '21:30',
    horaFim: '22:30',
    modalidade: 'Dança Contemporânea',
    turma: 'Dança Contemporânea Adultos',
    idade: 'Adultos',
    professorId: 'prof_filipe',
    professorNome: 'Filipe Narciso',
    salaId: 'estudio_1',
    salaNome: 'Estúdio 1',
    tipo: 'Aula adultos',
  },
  {
    id: 'aula_010',
    diaSemana: 'Sábado' as DiaSemana,
    horaInicio: '09:30',
    horaFim: '10:30',
    modalidade: 'Hip Hop',
    turma: 'Hip Hop Kids/Teens',
    idade: '',
    professorId: 'prof_ana_luis',
    professorNome: 'Ana Luís Gomes',
    salaId: 'estudio_2',
    salaNome: 'Estúdio 2',
    tipo: 'Aula regular',
  },
];

export const pedidosCoachingMock = [
  {
    id: 'PED-1001',
    alunoId: 'aluno1',
    alunoNome: 'Marta Silva',
    tipoAluno: 'CRIANCA_JOVEM' as TipoAluno,
    encarregadoId: 'enc_1',
    encarregadoNome: 'João Silva',
    modalidade: 'Ballet',
    professorPreferencialId: 'prof_natalia',
    professorPreferencialNome: 'Natália Azevedo',
    tipoCoaching: 'Individual',
    outrosAlunosSugeridos: '',
    preferenciaHorario: 'Sábado de manhã',
    observacoes: 'Preparação técnica para a Gala de Primavera.',
    estado: 'PENDENTE' as EstadoPedidoCoaching,
  },
  {
    id: 'PED-1002',
    alunoId: 'aluno2',
    alunoNome: 'Diogo Ribeiro',
    tipoAluno: 'CRIANCA_JOVEM' as TipoAluno,
    encarregadoId: 'enc_2',
    encarregadoNome: 'Carla Ribeiro',
    modalidade: 'Jazz',
    professorPreferencialId: 'prof_edson',
    professorPreferencialNome: 'Edson Nascimento',
    tipoCoaching: 'Grupo',
    outrosAlunosSugeridos: 'Marta Silva, Inês Costa',
    preferenciaHorario: 'Quarta-feira depois das 19h',
    observacoes: 'Apoio para coreografia de grupo.',
    estado: 'EM_ANALISE' as EstadoPedidoCoaching,
  },
  {
    id: 'PED-1003',
    alunoId: 'aluno_adulto_1',
    alunoNome: 'Rita Almeida',
    tipoAluno: 'ADULTO' as TipoAluno,
    encarregadoId: '',
    encarregadoNome: '',
    modalidade: 'Dança Contemporânea',
    professorPreferencialId: 'prof_filipe',
    professorPreferencialNome: 'Filipe Narciso',
    tipoCoaching: 'Individual',
    outrosAlunosSugeridos: '',
    preferenciaHorario: 'Sexta-feira à noite',
    observacoes: 'Aluno adulto sem encarregado associado.',
    estado: 'AGENDADO' as EstadoPedidoCoaching,
  },
];

export const figurinosAcessoriosMock = [
  {
    id: 'fig_003',
    nome: 'Sapatilhas de Ballet',
    tipo: 'CALCADO' as TipoFigurinoAcessorio,
    modalidade: 'Ballet',
    tamanho: '32',
    estadoConservacao: 'Usado',
    origem: 'Encarregado',
    preco: 8,
    dataInicioDisponibilidade: '2026-05-01',
    dataFimDisponibilidade: '2026-06-30',
    descricao: 'Sapatilhas em bom estado para aulas e ensaios.',
    imagemUrl: '',
  },
];

export const eventosMock = [
  {
    id: 'evt_001',
    titulo: 'VI Gala de Primavera',
    data: '2026-05-16',
    local: 'Espaço Vita',
    sessoes: ['15h30', '21h00'],
    estado: 'ATIVO',
    formularioUrl: 'https://forms.gle/jLGJMcLEnay4aWRr6',
    descricao:
      'Gala de Primavera da Ent’artes com participação dos alunos de regime geral.',
    figurino: [
      'Utilizar figurino indicado pela professora.',
      'Usar calções ou boxers cor da pele por baixo.',
      'Apresentação descalço quando indicado.',
    ],
    penteado: [
      'Rabo de cavalo médio.',
      'Risca ao meio.',
    ],
    acessorios: [
      'Acessório de cabelo conforme indicação da professora.',
    ],
    maquilhagem: [
      'Maquilhagem simples.',
      'Alguns brilhos nos olhos.',
      'Batom rosa nude.',
    ],
    observacoes:
      'Os alunos devem levar os figurinos para a aula indicada pela professora, sem necessidade de virem vestidos.',
  },
  {
    id: 'evt_002',
    titulo: 'Ensaio Geral da Gala',
    data: '2026-05-10',
    local: 'Ent’artes',
    sessoes: ['10h00'],
    estado: 'ATIVO',
    formularioUrl: '',
    descricao: 'Ensaio geral para organização das turmas participantes na Gala.',
    figurino: ['Levar figurino completo.'],
    penteado: ['Penteado conforme indicação da modalidade.'],
    acessorios: [],
    maquilhagem: [],
    observacoes: 'Chegar 15 minutos antes da hora marcada.',
  },
];

export const feriadosEInterrupcoesMock = [
  {
    id: 'feriado_001',
    data: '2026-02-17',
    nome: 'Carnaval',
    tipo: 'Interrupção escolar',
    escolaEncerrada: true,
  },
  {
    id: 'feriado_002',
    data: '2026-04-03',
    nome: 'Sexta-feira Santa',
    tipo: 'Feriado nacional',
    escolaEncerrada: true,
  },
  {
    id: 'feriado_003',
    data: '2026-04-06',
    nome: 'Segunda-feira após a Páscoa',
    tipo: 'Interrupção escolar',
    escolaEncerrada: true,
  },
  {
    id: 'feriado_004',
    data: '2026-06-24',
    nome: 'Feriado municipal',
    tipo: 'Feriado municipal',
    escolaEncerrada: true,
  },
];

export const vagasCoachingMock = [
  {
    id: 'vaga_001',
    professorId: 'prof_filipe',
    professorNome: 'Filipe Narciso',
    modalidade: 'Dança Contemporânea',
    salaId: 'estudio_1',
    salaNome: 'Estúdio 1',
    dataInicio: '2026-05-01',
    dataFim: '2026-06-30',
    diaSemana: 'Sexta-feira' as DiaSemana,
    horaInicio: '19:45',
    horaFim: '20:30',
    repeticao: 'SEMANAL' as RepeticaoVaga,
    estado: 'ABERTA',
  },
  {
    id: 'vaga_002',
    professorId: 'prof_edson',
    professorNome: 'Edson Nascimento',
    modalidade: 'Jazz',
    salaId: 'estudio_2',
    salaNome: 'Estúdio 2',
    dataInicio: '2026-05-01',
    dataFim: '2026-05-31',
    diaSemana: 'Quarta-feira' as DiaSemana,
    horaInicio: '20:15',
    horaFim: '21:00',
    repeticao: 'SEMANAL' as RepeticaoVaga,
    estado: 'ABERTA',
  },
];       