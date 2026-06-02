export function horaParaMinutos(hora: string): number | null {
  const partes = hora.split(':');

  if (partes.length !== 2) return null;

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) return null;
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;

  return horas * 60 + minutos;
}

export function horaValida(hora: string): boolean {
  return horaParaMinutos(hora) !== null;
}

export function intervaloHorasValido(horaInicio: string, horaFim: string): boolean {
  const inicio = horaParaMinutos(horaInicio);
  const fim = horaParaMinutos(horaFim);

  if (inicio === null || fim === null) return false;

  return fim > inicio;
}

export function dataValida(dataISO: string): boolean {
  if (!dataISO) return false;

  const data = new Date(`${dataISO}T00:00:00`);

  return !Number.isNaN(data.getTime());
}

export function intervaloDatasValido(dataInicio: string, dataFim: string): boolean {
  if (!dataValida(dataInicio) || !dataValida(dataFim)) return false;

  return new Date(dataFim) >= new Date(dataInicio);
}

export function dataNoPassado(dataISO: string): boolean {
  if (!dataValida(dataISO)) return false;

  const data = new Date(`${dataISO}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return data < hoje;
}

export function dataHoraNoPassado(dataISO: string, hora: string): boolean {
  if (!dataValida(dataISO) || !horaValida(hora)) return false;

  const inicio = new Date(`${dataISO}T${hora}:00`);

  return inicio.getTime() < Date.now();
}
