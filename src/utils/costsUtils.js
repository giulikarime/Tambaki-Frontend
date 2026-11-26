export const BRAND_CHART_COLORS = [
    '#3553b5',
    '#f4b153',
    '#191444',
    '#ffdf98',
    '#6880d4',
    '#e09634',
    '#393275',
    '#f7cf77',
];

export const MONTH_ABBREVIATIONS = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
];

export const WEEKDAY_NAMES = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];

export const COST_CATEGORY_LABELS = {
    Aluguel: 'Aluguel',
    Salários_Equipe: 'Salários da Equipe',
    Pró_Labore_Sócios: 'Pró-Labore dos Sócios',
    Contas_Consumo: 'Contas de Consumo',
    Sistema_PDV_ERP: 'Sistema PDV / ERP',
    Contador: 'Contador',
    Insumos_Ingredientes: 'Insumos e Ingredientes',
    Impostos_Vendas: 'Impostos sobre Vendas',
    Taxas_Maquininhas_Cartão: 'Taxas de Cartão',
    Comissões_Apps_Delivery: 'Comissões e Taxas de Aplicativo',
    Embalagens: 'Embalagens',
};

/**
 * Extracts year, 0-based month index, and day from a Date or ISO string
 * without shifting date-only UTC midnight values to the previous day in UTC-3.
 */
function parseDateParts(dateInput) {
    if (!dateInput) return null;

    if (typeof dateInput === 'string') {
        const isoDateMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoDateMatch) {
            return {
                year: Number(isoDateMatch[1]),
                monthIndex: Number(isoDateMatch[2]) - 1,
                day: Number(isoDateMatch[3]),
            };
        }
    }

    const parsed = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(parsed.getTime())) return null;

    return {
        year: parsed.getUTCFullYear(),
        monthIndex: parsed.getUTCMonth(),
        day: parsed.getUTCDate(),
    };
}

/**
 * Resolve the effective date field of a Cost/Product/Order record.
 */
function getRecordDate(record) {
    return record?.date || record?.createAt || record?.createdAt || record?.updateAt || record?.updatedAt;
}

/**
 * Transformar Date/DateTime em String (apenas o Mês): Ex. 'Jan', 'Fev', 'Mar'...
 */
export function transformarDataParaMes(dateInput) {
    const parts = parseDateParts(dateInput);
    if (!parts) return '';
    return MONTH_ABBREVIATIONS[parts.monthIndex] ?? '';
}

/**
 * Transformar Date/DateTime em String (apenas dia da semana): Ex. 'Domingo', 'Segunda-feira'...
 */
export function transformarDataParaDiaSemana(dateInput) {
    const parts = parseDateParts(dateInput);
    if (!parts) return '';
    const utcDate = new Date(Date.UTC(parts.year, parts.monthIndex, parts.day));
    return WEEKDAY_NAMES[utcDate.getUTCDay()] ?? '';
}

/**
 * Verificar se o mês de uma data já acabou em relação à data atual (new Date()).
 */
export function verificarMesAcabou(dateInput, referenceDate = new Date()) {
    const parts = parseDateParts(dateInput);
    if (!parts) return false;

    const currentYear = referenceDate.getFullYear();
    const currentMonth = referenceDate.getMonth();

    if (parts.year < currentYear) return true;
    if (parts.year > currentYear) return false;
    return parts.monthIndex < currentMonth;
}

/**
 * Formata o nome legível de uma categoria de custo.
 */
export function formatCostCategoryLabel(category) {
    if (!category) return 'Outros';
    return COST_CATEGORY_LABELS[category] || String(category).replaceAll('_', ' ');
}

/**
 * Somar custos filtrados por tipo ('Fixo' ou 'Variavel').
 */
function sumCostsByType(costs, type) {
    if (!Array.isArray(costs)) return 0;
    return costs.reduce((total, item) => {
        if (item?.costType !== type) return total;
        const amount = Number(item?.amount) || 0;
        return total + amount;
    }, 0);
}

/**
 * Somar todos os custos fixos (campo amount).
 */
export function somarCustosFixos(costs = []) {
    return sumCostsByType(costs, 'Fixo');
}

/**
 * Somar todos os custos variáveis (campo amount).
 */
export function somarCustosVariaveis(costs = []) {
    return sumCostsByType(costs, 'Variavel');
}

/**
 * Somar custos fixos e variáveis.
 * Aceita dois totais numéricos (fixos, variaveis) ou um array de custos.
 */
export function somarCustosFixosEVariaveis(fixedOrCosts = 0, variableTotal = 0) {
    if (Array.isArray(fixedOrCosts)) {
        return somarCustosFixos(fixedOrCosts) + somarCustosVariaveis(fixedOrCosts);
    }
    return (Number(fixedOrCosts) || 0) + (Number(variableTotal) || 0);
}

/**
 * Helper compartilhado para calcular total e porcentagem individual por categoria.
 */
function calculateCategoryBreakdown(costs, type) {
    if (!Array.isArray(costs)) return [];

    const totalsByCategory = new Map();
    let grandTotal = 0;

    for (const item of costs) {
        if (item?.costType !== type) continue;
        const amount = Number(item?.amount) || 0;
        if (amount <= 0) continue;

        const categoryKey = item?.costCategory || 'Outros';
        totalsByCategory.set(categoryKey, (totalsByCategory.get(categoryKey) || 0) + amount);
        grandTotal += amount;
    }

    if (grandTotal <= 0) return [];

    return Array.from(totalsByCategory.entries())
        .map(([category, value]) => ({
            category,
            label: formatCostCategoryLabel(category),
            value,
            percentage: Number(((value / grandTotal) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Calcular o custo fixo individual de cada categoria (valor float e porcentagem).
 */
export function calcularCustoFixoPorCategoria(costs = []) {
    return calculateCategoryBreakdown(costs, 'Fixo');
}

/**
 * Calcular o custo variável individual de cada categoria (valor float e porcentagem).
 */
export function calcularCustoVariavelPorCategoria(costs = []) {
    return calculateCategoryBreakdown(costs, 'Variavel');
}

/**
 * Separar valores por meses no formato [{ Month: 'Jan', Value: 1000, ... }].
 */
export function separarValoresPorMeses(
    costs = [],
    { year = new Date().getFullYear(), costType = null, maxMonthIndex = new Date().getMonth() } = {}
) {
    const monthlyTotals = new Array(12).fill(0);
    let highestMonthWithData = -1;

    if (Array.isArray(costs)) {
        for (const item of costs) {
            if (costType && item?.costType !== costType) continue;
            const rawDate = getRecordDate(item);
            const parts = parseDateParts(rawDate);
            if (!parts || parts.year !== year) continue;

            const amount = Number(item?.amount) || 0;
            monthlyTotals[parts.monthIndex] += amount;
            if (amount > 0 && parts.monthIndex > highestMonthWithData) {
                highestMonthWithData = parts.monthIndex;
            }
        }
    }

    const lastMonthToShow = Math.max(maxMonthIndex, highestMonthWithData, 0);
    const referenceDate = new Date();

    return MONTH_ABBREVIATIONS.slice(0, lastMonthToShow + 1).map((monthLabel, index) => {
        const monthAnchor = new Date(Date.UTC(year, index, 1));
        return {
            Month: monthLabel,
            Value: Number(monthlyTotals[index].toFixed(2)),
            monthIndex: index,
            isFinished: verificarMesAcabou(monthAnchor, referenceDate),
        };
    });
}

/**
 * Calcula a variação percentual e direção entre o último mês com custo e o anterior.
 */
export function calcularTendenciaMensal(costs = [], costType = null, year = new Date().getFullYear()) {
    const monthly = separarValoresPorMeses(costs, { year, costType, maxMonthIndex: 11 });
    const nowMonth = new Date().getMonth();

    const currentValue = monthly[nowMonth]?.Value || 0;
    const prevValue = nowMonth > 0 ? monthly[nowMonth - 1]?.Value || 0 : 0;

    if (prevValue === 0 && currentValue === 0) {
        return { direction: 'down', percentChange: 0 };
    }
    if (prevValue === 0) {
        return { direction: 'up', percentChange: 100 };
    }

    const diffPercent = ((currentValue - prevValue) / prevValue) * 100;
    return {
        direction: diffPercent > 0 ? 'up' : 'down',
        percentChange: Math.abs(Math.round(diffPercent)),
    };
}

/**
 * Formata valores monetários no estilo compacto do dashboard (ex.: R$ 18,6 k) ou padrão BRL.
 */
export function formatCompactCurrency(value) {
    const numeric = Number(value) || 0;
    if (Math.abs(numeric) >= 1000) {
        const thousands = (numeric / 1000).toFixed(1).replace('.', ',');
        return `R$ ${thousands} k`;
    }
    return numeric.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export function formatFullCurrency(value) {
    return (Number(value) || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

/**
 * Gera ticks legíveis de 5 intervalos para gráficos de barras horizontais e verticais.
 */
export function getNiceAxisTicks(maxValue, defaultStep = 5000) {
    if (!maxValue || maxValue <= 0) {
        const ticks = Array.from({ length: 6 }, (_, idx) => idx * defaultStep);
        return { maxTick: ticks[ticks.length - 1], ticks };
    }

    const rawStep = maxValue / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    let niceNormalized = 10;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 2.5) niceNormalized = 2.5;
    else if (normalized <= 5) niceNormalized = 5;

    const step = niceNormalized * magnitude;
    const ticks = Array.from({ length: 6 }, (_, idx) => Math.round(idx * step));
    return { maxTick: ticks[ticks.length - 1], ticks };
}
