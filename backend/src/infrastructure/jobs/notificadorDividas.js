// infrastructure/jobs/notificadorDividas.js
const cron = require('node-cron');

// SUBIR DOIS NÍVEIS (../../) para sair de 'jobs' e 'infrastructure' e entrar em 'models'
const Pagamento = require('../../models/Pagamento'); 
const EmailService = require('../services/EmailService');

const iniciarJobNotificacoes = () => {
    // Agenda para todos os dias às 09:00 (Padrão: minuto hora dia mes dia_semana)
    cron.schedule('0 9 * * *', async () => {
        console.log('--- [CRON] A iniciar verificação de pagamentos em atraso ---');
        
        try {
            const hoje = new Date();

            // 1. Procurar pagamentos pendentes que já passaram da data de vencimento
            const dividas = await Pagamento.find({
                estado: 'PENDENTE',
                dataVencimento: { $lt: hoje }
            }).populate('utilizadorId');

            if (dividas.length === 0) {
                console.log('[CRON] Nenhuma dívida encontrada para processar hoje.');
                return;
            }

            // 2. Enviar emails para cada devedor
            for (const divida of dividas) {
                const user = divida.utilizadorId;

                if (user && user.email) {
                    await EmailService.enviarAvisoDivida({
                        email: user.email,
                        nome: user.nome,
                        valor: divida.valor,
                        descricao: divida.tipoOrigem // Ex: "Sessão de Coaching"
                    });

                    // 3. Registar que o aviso foi enviado hoje para evitar duplicados
                    divida.dataUltimoAviso = hoje;
                    await divida.save();
                }
            }
            
            console.log(`--- [CRON] Sucesso: ${dividas.length} notificações processadas ---`);
        } catch (error) {
            console.error('[CRON ERROR]: Falha ao processar notificações:', error);
        }
    });
};

module.exports = iniciarJobNotificacoes;