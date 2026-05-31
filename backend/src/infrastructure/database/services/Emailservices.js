// infrastructure/services/EmailService.js
const { Resend } = require('resend');

// A API Key deve estar no teu ficheiro .env
const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
    /**
     * Envia o aviso de dívida formatado
     * @param {Object} dados - { email, nome, valor, descricao }
     */
    static async enviarAvisoDivida({ email, nome, valor, descricao }) {
        try {
            const data = await resend.emails.send({
                from: 'Financeiro <financeiro@oteudominio.com>', // Configura o teu domínio aqui
                to: [email],
                subject: '⚠️ Acção Necessária: Pagamento Pendente',
                html: `
                    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <h2>Olá, ${nome}.</h2>
                        <p>Esperamos que esteja tudo bem.</p>
                        <p>Constatamos que o pagamento relativo a <strong>${descricao}</strong> ainda não foi recebido.</p>
                        <p style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 18px;">
                            Valor em dívida: <strong>${valor}€</strong>
                        </p>
                        <p>Para regularizar a situação e evitar interrupções no serviço, por favor efectue o pagamento o mais breve possível.</p>
                        <br>
                        <p>Atenciosamente,<br>A Equipa de Gestão</p>
                    </div>
                `,
            });

            console.log(`[EmailService] Email enviado com sucesso para ${email}`);
            return data;
        } catch (error) {
            console.error(`[EmailService Error] Falha ao enviar para ${email}:`, error);
            throw error;
        }
    }
}

module.exports = EmailService;