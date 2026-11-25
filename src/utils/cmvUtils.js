import {
    MONTH_ABBREVIATIONS,
    transformarDataParaMes,
    verificarMesAcabou,
} from './costsUtils';
import { calcularFaturamento, separarFaturamentoPorMeses, somarCustoProdutos } from './profitUtils';

export const PRODUCT_CATEGORY_LABELS = {
    Carnes_e_Pescados: 'Carnes e Pescados',
    Hortifrúti: 'Hortifrúti',
    Laticínios_e_Frios: 'Laticínios e Frios',
    Embutidos: 'Embutidos',
    Secos: 'Secos',
    Bebida_Alcoolica: 'Bebidas Alcoólicas',
    Bebida_nao_Alcoolica: 'Bebidas Não Alcoólicas',
    Panificação: 'Panificação',
    Congelados: 'Congelados',
    Materiais_Operacionais: 'Materiais Operacionais',
    Descartáveis: 'Descartáveis',
};

function getProductYear(product) {
    const rawDate = product?.createdAt || product?.createAt || product?.updatedAt || product?.updateAt;
    if (!rawDate) return null;
    if (typeof rawDate === 'string') {
        const match = rawDate.match(/^(\d{4})-/);
        if (match) return Number(match[1]);
    }
    const parsed = rawDate instanceof Date ? rawDate : new Date(rawDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCFullYear();
}

export function formatProductCategoryLabel(category) {
    if (!category) return 'Outros';
    return PRODUCT_CATEGORY_LABELS[category] || String(category).replaceAll('_', ' ');
}

/**
 * Calcular Estoque Inicial a partir do Estoque Final do período anterior.
 */
export function calcularEstoqueInicial(estoqueFinalAnterior = 0) {
    return Number(estoqueFinalAnterior) || 0;
}

/**
 * Calcular Estoque Final: Estoque Inicial + Entradas - Baixas + Ajustes.
 */
export function calcularEstoqueFinal({
    estoqueInicial = 0,
    entradas = 0,
    baixas = 0,
    ajustes = 0,
} = {}) {
    const total =
        (Number(estoqueInicial) || 0) +
        (Number(entradas) || 0) -
        (Number(baixas) || 0) +
        (Number(ajustes) || 0);
    return Number(Math.max(total, 0).toFixed(2));
}

/**
 * Calcular CMV a partir do estoque inicial/final (e compras quando informadas),
 * ou com base no custo total dos produtos quando movimentações não estão disponíveis.
 */
export function calcularCMV({
    estoqueInicial = null,
    estoqueFinal = null,
    compras = 0,
    products = [],
} = {}) {
    if (estoqueInicial !== null && estoqueFinal !== null) {
        return Number(
            Math.max((Number(estoqueInicial) || 0) + (Number(compras) || 0) - (Number(estoqueFinal) || 0), 0).toFixed(2)
        );
    }
    return Number(somarCustoProdutos(products).toFixed(2));
}

/**
 * Somar custo total dos produtos (reutilizando somarCustoProdutos).
 */
export function somarCustoTotalProdutos(products = []) {
    return somarCustoProdutos(products);
}

/**
 * Percentual do CMV sobre Faturamento: [(CMV / Faturamento) * 100].
 */
export function calcularPercentualCmvSobreFaturamento(cmv = 0, faturamento = 0) {
    const revenue = Number(faturamento) || 0;
    if (revenue <= 0) return 0;
    return Number((((Number(cmv) || 0) / revenue) * 100).toFixed(1));
}

/**
 * Calcular custo individual de cada categoria de produto (valor float e porcentagem).
 */
export function calcularCustoPorCategoriaProdutos(products = []) {
    if (!Array.isArray(products) || products.length === 0) return [];

    const totalsByCategory = new Map();
    let grandTotal = 0;

    for (const product of products) {
        const cost = Number(product?.cost_price) || 0;
        if (cost <= 0) continue;

        const categoryKey = product?.category || 'Outros';
        totalsByCategory.set(categoryKey, (totalsByCategory.get(categoryKey) || 0) + cost);
        grandTotal += cost;
    }

    if (grandTotal <= 0) return [];

    return Array.from(totalsByCategory.entries())
        .map(([category, value]) => ({
            category,
            label: formatProductCategoryLabel(category),
            value: Number(value.toFixed(2)),
            percentage: Number(((value / grandTotal) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Separar evolução do CMV por meses [{ Month, Value, monthIndex, isFinished }].
 */
export function separarCmvPorMeses(products = [], year = new Date().getFullYear()) {
    const monthlyTotals = new Array(12).fill(0);

    if (Array.isArray(products)) {
        for (const product of products) {
            const productYear = getProductYear(product);
            if (productYear !== year) continue;

            const monthAbbr = transformarDataParaMes(
                product?.createdAt || product?.createAt || product?.updatedAt || product?.updateAt
            );
            const monthIndex = MONTH_ABBREVIATIONS.indexOf(monthAbbr);
            if (monthIndex < 0) continue;

            monthlyTotals[monthIndex] += Number(product?.cost_price) || 0;
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
 * Compara CMV Planejado (30% do faturamento mensal ou custo mínimo de estoque) vs Realizado por mês.
 */
export function calcularCmvPlanejadoVsRealizado(
    products = [],
    orders = [],
    year = new Date().getFullYear(),
    targetCmvRatio = 0.3
) {
    const monthlyCmv = separarCmvPorMeses(products, year);
    const monthlyRevenue = separarFaturamentoPorMeses(orders, year);

    const activeMonths = monthlyCmv
        .map((cmvItem, idx) => {
            const revValue = monthlyRevenue[idx]?.Value || 0;
            const realized = cmvItem.Value;
            const planned =
                revValue > 0 ? Number((revValue * targetCmvRatio).toFixed(2)) : realized;

            return {
                Month: cmvItem.Month,
                planned,
                realized,
                monthIndex: idx,
            };
        })
        .filter((item) => item.planned > 0 || item.realized > 0);

    if (activeMonths.length > 0) {
        return activeMonths.slice(-4);
    }

    return monthlyCmv.slice(0, 3).map((item) => ({
        Month: item.Month,
        planned: 0,
        realized: 0,
        monthIndex: item.monthIndex,
    }));
}

/**
 * Calcula tendência mensal do CMV em comparação ao mês anterior.
 */
export function calcularTendenciaCmvMensal(products = [], year = new Date().getFullYear()) {
    const monthly = separarCmvPorMeses(products, year);
    const nowMonth = new Date().getMonth();
    const currentValue = monthly[nowMonth]?.Value || 0;
    const prevValue = nowMonth > 0 ? monthly[nowMonth - 1]?.Value || 0 : 0;

    if (prevValue === 0 && currentValue === 0) {
        return { direction: 'down', percentChange: 0 };
    }
    if (prevValue === 0) {
        return { direction: 'up', percentChange: 100 };
    }

    const diff = ((currentValue - prevValue) / prevValue) * 100;
    return {
        direction: diff >= 0 ? 'up' : 'down',
        percentChange: Math.abs(Math.round(diff)),
    };
}

export function calcularResumoCmv(products = [], orders = []) {
    const cmvTotal = calcularCMV({ products });
    const faturamentoTotal = calcularFaturamento(orders);
    const cmvPercentual = calcularPercentualCmvSobreFaturamento(cmvTotal, faturamentoTotal);

    return {
        cmvTotal,
        faturamentoTotal,
        cmvPercentual,
    };
}
