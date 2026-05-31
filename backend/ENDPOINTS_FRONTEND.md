# Ent'artes Backend - Endpoints prontos para o frontend

Base URL local:

```txt
http://192.168.1.68:3000
```

Header nas rotas protegidas:

```txt
Authorization: Bearer TOKEN
```

## Auth

```txt
POST   /api/auth/login
POST   /api/auth/selecionar-perfil
GET    /api/auth/me
POST   /api/auth/utilizadores
GET    /api/auth/utilizadores
GET    /api/auth/utilizadores/:id
PATCH  /api/auth/utilizadores/:id
PATCH  /api/auth/utilizadores/:id/estado
PATCH  /api/auth/utilizadores/:id/password
PATCH  /api/auth/utilizadores/:id/pin-encarregado
DELETE /api/auth/utilizadores/:id
```

Login body:

```json
{
  "email": "admin@entartes.pt",
  "password": "admin123"
}
```

Selecionar perfil body:

```json
{
  "perfilId": "id-do-perfil",
  "pinEncarregado": "4321"
}
```

## Referências

```txt
GET /api/professores
GET /api/modalidades
GET /api/salas
```

## Dashboard

```txt
GET /api/dashboard/resumo
```

## Horário

```txt
GET    /api/horario/aulas-semanais
GET    /api/horario/aulas-semanais/:id
POST   /api/horario/aulas-semanais
PATCH  /api/horario/aulas-semanais/:id
DELETE /api/horario/aulas-semanais/:id
POST   /api/horario/aulas-semanais/:id/solicitar-inscricao
POST   /api/horario/aulas-semanais/:id/solicitar-alteracao
GET    /api/horario/solicitacoes
```

Filtros:

```txt
GET /api/horario/aulas-semanais?diaSemana=Segunda-feira
GET /api/horario/aulas-semanais?modalidade=Ballet
GET /api/horario/aulas-semanais?estado=ATIVA
GET /api/horario/aulas-semanais?professorId=prof_ana_luis
```

Aula semanal body:

```json
{
  "diaSemana": "Segunda-feira",
  "horaInicio": "18:00",
  "horaFim": "19:00",
  "modalidade": "Jazz",
  "turma": "Jazz 1",
  "professorId": "prof_ana_luis",
  "professorNome": "Ana Luís Gomes",
  "salaId": "id-sala",
  "salaNome": "Estúdio 1",
  "faixaEtaria": "4-6 anos",
  "vagas": 18,
  "inscritos": 0,
  "estado": "ATIVA"
}
```

## Turmas

```txt
GET    /api/turmas
GET    /api/turmas/:id
POST   /api/turmas
PATCH  /api/turmas/:id
DELETE /api/turmas/:id
POST   /api/turmas/:id/inscrever
DELETE /api/turmas/:id/alunos/:alunoId
```

## Coaching - pedidos

```txt
GET    /api/pedidos-coaching
GET    /api/pedidos-coaching/:id
POST   /api/pedidos-coaching
PATCH  /api/pedidos-coaching/:id
PATCH  /api/pedidos-coaching/:id/estado
PATCH  /api/pedidos-coaching/:id/associar-vaga
PATCH  /api/pedidos-coaching/:id/interesse
PATCH  /api/pedidos-coaching/:id/aceitar
PATCH  /api/pedidos-coaching/:id/aprovar
PATCH  /api/pedidos-coaching/:id/rejeitar
DELETE /api/pedidos-coaching/:id
```

Pedido coaching body:

```json
{
  "alunoId": "aluno_marta",
  "alunoNome": "Marta Silva",
  "tipoAluno": "CRIANCA_JOVEM",
  "encarregadoId": "enc_joao",
  "encarregadoNome": "João Silva",
  "modalidade": "Ballet",
  "professorPreferencialId": "prof_daniela",
  "professorPreferencialNome": "Daniela Fernandes",
  "tipoCoaching": "Individual",
  "outrosAlunosSugeridos": "",
  "preferenciaHorario": "Sábado de manhã",
  "observacoes": "Preparação técnica.",
  "estado": "PENDENTE"
}
```

## Coaching - vagas

```txt
GET    /api/vagas
GET    /api/vagas/:id
POST   /api/vagas
PATCH  /api/vagas/:id
PATCH  /api/vagas/:id/fechar
PATCH  /api/vagas/:id/cancelar
PATCH  /api/vagas/:id/ocupar
DELETE /api/vagas/:id
```

## Marketplace / inventário

```txt
GET    /api/inventario
GET    /api/inventario/:id
POST   /api/inventario/anunciar
POST   /api/inventario/:id/requisicao
PATCH  /api/inventario/:id/anuncio
PATCH  /api/inventario/:id/encerrar
PATCH  /api/inventario/:id/requisicoes/:requisicaoId/aceitar
PATCH  /api/inventario/:id/requisicoes/:requisicaoId/rejeitar
DELETE /api/inventario/:id
```

Filtros:

```txt
GET /api/inventario?tipo=FIGURINO
GET /api/inventario?modalidade=Ballet
GET /api/inventario?estadoAnuncio=ATIVO
```

## Eventos

```txt
GET    /api/eventos
GET    /api/eventos/:id
POST   /api/eventos
PATCH  /api/eventos/:id
PATCH  /api/eventos/:id/estado
DELETE /api/eventos/:id
POST   /api/eventos/:id/autorizacoes
GET    /api/eventos/:id/autorizacoes
```

## Estúdios / salas

```txt
GET    /api/estudios
GET    /api/estudios/:id
POST   /api/estudios
PATCH  /api/estudios/:id
DELETE /api/estudios/:id
GET    /api/estudios/:id/disponibilidade?dataInicio=2026-01-10T10:00:00&dataFim=2026-01-10T11:00:00
```

## Interrupções / feriados

```txt
GET    /api/interrupcoes
GET    /api/interrupcoes/:id
POST   /api/interrupcoes
PATCH  /api/interrupcoes/:id
DELETE /api/interrupcoes/:id
```

## Scripts úteis

```bash
cd backend
node scripts/criarAdmin.js
node scripts/criarDadosDemo.js
```
