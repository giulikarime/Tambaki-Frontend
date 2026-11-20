export function dateIntoMonthString(date, formato = 'long') {
  const raw = typeof date === 'string' && date.startsWith('{') ? JSON.parse(date).data : date;
  const dataObj = new Date(raw);
  const month = dataObj.toLocaleString('pt-BR', { month: formato, timeZone: 'UTC' });
  const monthFormat = month.charAt(0).toUpperCase() + month.slice(1).replace('.', '');

  return monthFormat;
}

export function dateIntoDaysOfTheWeek(date) {
  const raw = typeof date === 'string' && date.startsWith('{') ? JSON.parse(date).data : date;
  const dataObj = new Date(raw);
  const dayOfTheWeek = dataObj.toLocaleString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
  const dayFormat = dayOfTheWeek.charAt(0).toUpperCase() + dayOfTheWeek.slice(1);

  return dayFormat;
}

export function isTheMonthOver() {
  const today = new Date();
  const lastDayOfTheMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return today.getDate() === lastDayOfTheMonth.getDate();
}

export function agruparPorMes(lista = [], campoValor = 'amount', campoData = 'date') {
  const hoje = new Date();
  const anoAtual = hoje.getUTCFullYear();
  const mesAtual = hoje.getUTCMonth();

  const mapaMeses = {};
  for (let m = 0; m <= mesAtual; m++) {
    const nomeMes = dateIntoMonthString(new Date(Date.UTC(anoAtual, m, 1)), 'short');
    mapaMeses[nomeMes] = 0;
  }

  lista.forEach((item) => {
    const dataItem = new Date(item[campoData]);
    if (dataItem.getUTCFullYear() === anoAtual) {
      const nomeMes = dateIntoMonthString(dataItem, 'short');
      if (mapaMeses[nomeMes] !== undefined) {
        mapaMeses[nomeMes] += campoValor ? Number(item[campoValor] || 0) : 1;
      }
    }
  });

  return Object.entries(mapaMeses).map(([mes, valor]) => ({
    mes,
    valor: Number(valor.toFixed(2)),
  }));
}