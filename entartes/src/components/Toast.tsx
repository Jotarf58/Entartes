import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ToastTipo = 'sucesso' | 'erro';

export type ToastData = {
  mensagem: string;
  tipo: ToastTipo;
};

const PALAVRAS_ERRO = [
  'preenche',
  'indica',
  'seleciona',
  'escolhe',
  'não foi possível',
  'não existe',
  'não encontrado',
  'não está',
  'já não está',
  'já existe',
  'já tem',
  'obrigat',
  'inválid',
  'erro',
  'demasiado',
];

export function limparMensagemBackend(texto: string) {
  return texto
    .replace(/\s+(no|do|ao|pelo|para o)\s+backend/gi, '')
    .replace(/\s+backend/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function inferirTipoMensagem(texto: string): ToastTipo {
  const baixo = texto.toLowerCase();

  return PALAVRAS_ERRO.some((palavra) => baixo.includes(palavra)) ? 'erro' : 'sucesso';
}

export function Toast({
  toast,
  onClose,
  duracao = 4000,
}: {
  toast: ToastData | null;
  onClose: () => void;
  duracao?: number;
}) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(onClose, duracao);

    return () => clearTimeout(timer);
  }, [toast, onClose, duracao]);

  if (!toast) {
    return null;
  }

  const sucesso = toast.tipo === 'sucesso';

  return (
    <div className="fixed bottom-6 left-6 z-[100] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
          sucesso
            ? 'bg-[#f0f6f3] border-[#cfe6db] text-[#2d5f4f]'
            : 'bg-[#fff5f5] border-[#ffd2d2] text-[#9a3a3a]'
        }`}
      >
        {sucesso ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        )}

        <p className="text-sm">{toast.mensagem}</p>

        <button
          onClick={onClose}
          className="ml-1 shrink-0 rounded-lg p-1 hover:bg-black/5"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
