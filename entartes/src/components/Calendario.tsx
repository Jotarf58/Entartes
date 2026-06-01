import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const MESES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIAS_SEMANA_CURTOS = ['2ª', '3ª', '4ª', '5ª', '6ª', 'Sáb', 'Dom'];

export function formatarDataPt(data: string) {
  if (!data) return '';

  const dataObj = new Date(`${data}T00:00:00`);

  if (Number.isNaN(dataObj.getTime())) {
    return data;
  }

  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

export function SeletorData({
  value,
  onChange,
  minHoje = true,
}: {
  value: string;
  onChange: (valor: string) => void;
  minHoje?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const hoje = useMemo(() => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data;
  }, []);

  const selecionada = value ? new Date(`${value}T00:00:00`) : null;
  const [mesVista, setMesVista] = useState(() => {
    const base = selecionada ?? hoje;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const ano = mesVista.getFullYear();
  const mes = mesVista.getMonth();
  const offsetInicio = (new Date(ano, mes, 1).getDay() + 6) % 7;
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array.from({ length: offsetInicio }, () => null),
    ...Array.from({ length: totalDias }, (_, indice) => indice + 1),
  ];

  function isoDe(dia: number) {
    return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        className="inputEntartes w-full flex items-center justify-between"
      >
        <span className={value ? 'text-[#2d5f4f]' : 'text-[#7a9a8c]'}>
          {value ? formatarDataPt(value) : 'Selecionar data'}
        </span>
        <Calendar className="w-4 h-4 text-[#7a9a8c]" />
      </button>

      {aberto && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Fechar calendário"
            onClick={() => setAberto(false)}
          />

          <div className="absolute z-50 mt-2 w-72 rounded-xl border border-[#e8f0ed] bg-white shadow-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setMesVista(new Date(ano, mes - 1, 1))}
                className="p-1 rounded-lg hover:bg-[#f0f6f3]"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4 text-[#2d5f4f]" />
              </button>

              <span className="text-sm text-[#2d5f4f]">
                {MESES_PT[mes]} {ano}
              </span>

              <button
                type="button"
                onClick={() => setMesVista(new Date(ano, mes + 1, 1))}
                className="p-1 rounded-lg hover:bg-[#f0f6f3]"
                aria-label="Mês seguinte"
              >
                <ChevronRight className="w-4 h-4 text-[#2d5f4f]" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {DIAS_SEMANA_CURTOS.map((dia) => (
                <span key={dia} className="text-center text-[10px] text-[#7a9a8c]">
                  {dia}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {celulas.map((dia, indice) => {
                if (dia === null) {
                  return <span key={`vazio-${indice}`} />;
                }

                const iso = isoDe(dia);
                const passada =
                  minHoje && new Date(`${iso}T00:00:00`).getTime() < hoje.getTime();
                const selecionado = value === iso;

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={passada}
                    onClick={() => {
                      onChange(iso);
                      setAberto(false);
                    }}
                    className={`h-8 rounded-lg text-sm transition-colors ${
                      selecionado
                        ? 'bg-[#2d5f4f] text-white'
                        : passada
                          ? 'text-[#c2cfc9] cursor-not-allowed'
                          : 'text-[#2d5f4f] hover:bg-[#f0f6f3]'
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function SeletorHora({
  value,
  onChange,
}: {
  value: string;
  onChange: (valor: string) => void;
}) {
  const [hora, setHora] = useState(() => (value ? value.split(':')[0] : ''));
  const [minuto, setMinuto] = useState(() => (value ? value.split(':')[1] : ''));

  useEffect(() => {
    setHora(value ? value.split(':')[0] : '');
    setMinuto(value ? value.split(':')[1] : '');
  }, [value]);

  const horas = Array.from({ length: 24 }, (_, indice) => String(indice).padStart(2, '0'));
  const minutos = Array.from({ length: 60 }, (_, indice) => String(indice).padStart(2, '0'));

  function atualizar(novaHora: string, novoMinuto: string) {
    setHora(novaHora);
    setMinuto(novoMinuto);
    onChange(novaHora && novoMinuto ? `${novaHora}:${novoMinuto}` : '');
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        value={hora}
        onChange={(event) => atualizar(event.target.value, minuto)}
        className="inputEntartes"
      >
        <option value="">Hora</option>
        {horas.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={minuto}
        onChange={(event) => atualizar(hora, event.target.value)}
        className="inputEntartes"
      >
        <option value="">Min</option>
        {minutos.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
