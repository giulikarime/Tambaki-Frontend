import {
    MONTH_ABBREVIATIONS,
    separarValoresPorMeses,
    somarCustosFixos,
    somarCustosFixosEVariaveis,
    somarCustosVariaveis,
    transformarDataParaMes,
    verificarMesAcabou,
} from './costsUtils';

function parseOrderDateParts(order) {
    const rawDate = order?.closed_at || order?.order_date || order?.createAt || order?.createdAt || order?.updateAt || order?.updatedAt;
    if (!rawDate) return null;

    if (typeof rawDate === 'string') {
        const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return {
                year: Number(match[1]),
                monthIndex: Number(match[2]) - 1,
                day: Number(match[3]),
            };
        }
    }

    const parsed = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return null;

    return {
        year: parsed.getUTCFullYear(),
        monthIndex: parsed.getUTCMonth(),
        day: parsed.getUTCDate(),
    };
}

/**
 * Variável de Faturamento: soma total_value das comandas (tabela Order).
 */
export function calcularFaturamento(orders = []) {
    if (!Array.isArray(orders)) return 0;
    return orders.reduce((total, order) => {
        const value = Number(order?.total_value) || 0;
        return total + value;
    }, 0);
}

/**
 * Somar custo total dos produtos usando cost_price (tabela Product).
 */
export function somarCustoProdutos(products = []) {
    if (!Array.isArray(products)) return 0;
    return products.reduce((total, product) => {
        const costPrice = Number(product?.cost_price) || 0;
        return total + costPrice;
    }, 0);
}

/**
 * Calcular Lucro: [Preço das Vendas - Custos Fixos e Variáveis (- CMV quando informado)].
 */
export function calcularLucro(faturamento = 0, totalCustos = 0, cmv = 0) {
    return (Number(faturamento) || 0) - (Number(totalCustos) || 0) - (Number(cmv) || 0);
}

/**
 * Calcular Margem de Lucro: [(Lucro / Faturamento) * 100].
 */
export function calcularMargemDeLucro(faturamento = 0, lucro = 0) {
    const revenue = Number(faturamento) || 0;
    if (revenue <= 0) return 0;
    return Number((((Number(lucro) || 0) / revenue) * 100).toFixed(1));
}

/**
 * Separar faturamento por meses [{ Month: 'Jan', Value: 1000, ... }].
 */
export function separarFaturamentoPorMeses(orders = [], year = new Date().getFullYear()) {
    const monthlyTotals = new Array(12).fill(0);

    if (Array.isArray(orders)) {
        for (const order of orders) {
            const parts = parseOrderDateParts(order);
            if (!parts || parts.year !== year) continue;

            const monthName = transformarDataParaMes(
                order?.closed_at || order?.order_date || order?.createdAt || order?.updatedAt
            );
            const resolvedIndex = MONTH_ABBREVIATIONS.indexOf(monthName);
            const targetIndex = resolvedIndex >= 0 ? resolvedIndex : parts.monthIndex;

            monthlyTotals[targetIndex] += Number(order?.total_value) || 0;
        }
    }

    const referenceDate = new Date();
    return MONTH_ABBREVIATIONS.map((monthLabel, index) => {
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
 * Separar evolução do lucro líquido por meses (Faturamento mensal - Custos mensais).
 */
export function separarLucroLiquidoPorMeses(
    orders = [],
    costs = [],
    year = new Date().getFullYear()
) {
    const monthlyRevenue = separarFaturamentoPorMeses(orders, year);
    const monthlyCosts = separarValoresPorMeses(costs, { year, maxMonthIndex: 11 });

    return monthlyRevenue.map((revItem, index) => {
        const costValue = monthlyCosts[index]?.Value || 0;
        const netProfit = calcularLucro(revItem.Value, costValue);
        return {
            Month: revItem.Month,
            Value: Number(netProfit.toFixed(2)),
            monthIndex: index,
            isFinished: revItem.isFinished,
        };
    });
}

/**
 * Definir Projeções de Lucro e calcular cenários individualmente com base no lucro atual.
 */
export function definirProjecoesDeLucro({
    faturamento = 0,
    cmv = 0,
    fixedCosts = 0,
    variableCosts = 0,
}) {
    const baseSales = Number(faturamento) || 0;
    const baseCmv = Number(cmv) || 0;
    const baseFixed = Number(fixedCosts) || 0;
    const baseVariable = Number(variableCosts) || 0;
    const baseCosts = somarCustosFixosEVariaveis(baseFixed, baseVariable);

    const scenarios = [
        {
            scenario: 'Base Atual',
            revenue: baseSales,
            cmv: baseCmv,
            costs: baseCosts,
        },
        {
            scenario: 'Aumento de 10% nas Vendas',
            revenue: baseSales * 1.1,
            cmv: baseCmv * 1.1,
            costs: baseCosts,
        },
        {
            scenario: 'Redução de 5% nos Custos Fixos',
            revenue: baseSales,
            cmv: baseCmv,
            costs: baseFixed * 0.95 + baseVariable,
        },
        {
            scenario: 'Aumento de 8% no CMV',
            revenue: baseSales,
            cmv: baseCmv * 1.08,
            costs: baseCosts,
        },
    ];

    return scenarios.map((item) => {
        const profit = calcularLucro(item.revenue, item.costs, item.cmv);
        const margin = calcularMargemDeLucro(item.revenue, profit);
        return {
            ...item,
            profit,
            margin,
        };
    });
}

/**
 * Estima em quantos dias o faturamento cobre os custos fixos (Ponto de Equilíbrio).
 */
export function calcularPontoDeEquilibrioDias({
    faturamento = 0,
    cmv = 0,
    costs = [],
}) {
    const revenue = Number(faturamento) || 0;
    const fixed = somarCustosFixos(costs);
    const variable = somarCustosVariaveis(costs);

    if (revenue <= 0) return null;
    if (fixed <= 0) return 0;

    const contributionRatio = (revenue - variable - (Number(cmv) || 0)) / revenue;
    if (contributionRatio <= 0) return null;

    const breakEvenRevenue = fixed / contributionRatio;
    const dailyRevenue = revenue / 30;
    if (dailyRevenue <= 0) return null;

    return Math.max(1, Math.round(breakEvenRevenue / dailyRevenue));
}

/**
 * Formata número compacto sem prefixo 'R$' para os summary cards (ex.: 12,5k ou 850,00).
 */
export function formatCompactNumber(value) {
    const numeric = Number(value) || 0;
    if (Math.abs(numeric) >= 1000) {
        return `${(numeric / 1000).toFixed(1).replace('.', ',')}k`;
    }
    return numeric.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}
