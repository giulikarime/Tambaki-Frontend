import {
    MONTH_ABBREVIATIONS,
    WEEKDAY_NAMES,
    transformarDataParaDiaSemana,
    transformarDataParaMes,
    verificarMesAcabou,
} from './costsUtils';

export const MENU_CATEGORY_LABELS = {
    Prato_Principal: 'Prato Principal',
    Entrada: 'Entrada',
    Saída: 'Saída',
    Rodizio: 'Rodízio',
    LaCarte: 'À la Carte',
    SelfService: 'Self-Service',
    Vegetariano: 'Vegetariano',
    Vegano: 'Vegano',
    Sobremesa: 'Sobremesa',
    Bebidas: 'Bebidas',
};

function getOrderRawDate(order) {
    return order?.order_date || order?.closed_at || order?.createAt || order?.createdAt || order?.updateAt || order?.updatedAt;
}

function getOrderMonthIndex(order) {
    const monthAbbr = transformarDataParaMes(getOrderRawDate(order));
    return MONTH_ABBREVIATIONS.indexOf(monthAbbr);
}

function getOrderYear(order) {
    const rawDate = getOrderRawDate(order);
    if (!rawDate) return null;
    if (typeof rawDate === 'string') {
        const match = rawDate.match(/^(\d{4})-/);
        if (match) return Number(match[1]);
    }
    const parsed = rawDate instanceof Date ? rawDate : new Date(rawDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCFullYear();
}

export function formatMenuCategoryLabel(category) {
    if (!category) return 'Sem categoria';
    return MENU_CATEGORY_LABELS[category] || String(category).replaceAll('_', ' ');
}

/**
 * Calcular quanto os clientes gastam em média (Ticket médio por pedido).
 */
export function calcularTicketMedio(orders = []) {
    if (!Array.isArray(orders) || orders.length === 0) return 0;

    const total = orders.reduce((acc, order) => acc + (Number(order?.total_value) || 0), 0);
    return Number((total / orders.length).toFixed(2));
}

/**
 * Separar evolução do ticket médio por meses [{ Month, Value, orderCount, isFinished }].
 */
export function separarTicketMedioPorMeses(orders = [], year = new Date().getFullYear()) {
    const buckets = Array.from({ length: 12 }, () => ({ total: 0, count: 0 }));

    if (Array.isArray(orders)) {
        for (const order of orders) {
            const orderYear = getOrderYear(order);
            if (orderYear !== year) continue;

            const monthIndex = getOrderMonthIndex(order);
            if (monthIndex < 0) continue;

            buckets[monthIndex].total += Number(order?.total_value) || 0;
            buckets[monthIndex].count += 1;
        }
    }

    const referenceDate = new Date();
    return MONTH_ABBREVIATIONS.map((monthLabel, index) => {
        const { total, count } = buckets[index];
        const avg = count > 0 ? total / count : 0;
        const monthAnchor = new Date(Date.UTC(year, index, 1));

        return {
            Month: monthLabel,
            Value: Number(avg.toFixed(2)),
            orderCount: count,
            isFinished: verificarMesAcabou(monthAnchor, referenceDate),
        };
    });
}

/**
 * Calcular venda total individual (quantidade vendida) de um prato.
 */
export function calcularVendaTotalPrato(orderItems = []) {
    if (!Array.isArray(orderItems)) return 0;
    return orderItems.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
}

/**
 * Calcular receita total individual de um prato.
 */
export function calcularReceitaTotalPrato(orderItems = [], menuFallbackPrice = 0) {
    if (!Array.isArray(orderItems)) return 0;
    return orderItems.reduce((sum, item) => {
        const qty = Number(item?.quantity) || 0;
        const unitPrice = Number(item?.unit_price ?? menuFallbackPrice) || 0;
        return sum + qty * unitPrice;
    }, 0);
}

/**
 * Calcular custo total individual de um prato (com base no custo unitário do prato/produto quando disponível).
 */
export function calcularCustoTotalPrato(quantitySold = 0, menuItem = null, products = []) {
    const qty = Number(quantitySold) || 0;
    if (qty <= 0) return 0;

    let unitCost = Number(menuItem?.cost_price ?? menuItem?.cost) || 0;

    if (unitCost === 0 && menuItem?.name && Array.isArray(products)) {
        const normalizedName = String(menuItem.name).trim().toLowerCase();
        const matchedProduct = products.find(
            (prod) => String(prod?.name || '').trim().toLowerCase() === normalizedName
        );
        if (matchedProduct) {
            unitCost = Number(matchedProduct.cost_price) || 0;
        }
    }

    return Number((qty * unitCost).toFixed(2));
}

/**
 * Calcular lucro individual de um prato.
 */
export function calcularLucroPrato(receitaTotal = 0, custoTotal = 0) {
    return Number(((Number(receitaTotal) || 0) - (Number(custoTotal) || 0)).toFixed(2));
}

/**
 * Calcular margem de lucro individual de um prato (%).
 */
export function calcularMargemLucroPrato(receitaTotal = 0, lucro = 0) {
    const revenue = Number(receitaTotal) || 0;
    if (revenue <= 0) return 0;
    return Number((((Number(lucro) || 0) / revenue) * 100).toFixed(1));
}

/**
 * Puxar os 5 pratos mais vendidos com quantidade, receita, custo, lucro e margem.
 */
export function obterTopPratosMaisVendidos(
    orders = [],
    menuList = [],
    productsList = [],
    { limit = 5, monthIndex = 'all' } = {}
) {
    const menuById = new Map();
    if (Array.isArray(menuList)) {
        for (const item of menuList) {
            if (item?.id != null) menuById.set(item.id, item);
        }
    }

    const dishGroups = new Map();

    if (Array.isArray(orders)) {
        for (const order of orders) {
            if (monthIndex !== 'all') {
                const orderMonth = getOrderMonthIndex(order);
                if (orderMonth !== Number(monthIndex)) continue;
            }

            const items = Array.isArray(order?.items) ? order.items : [];
            if (items.length > 0) {
                for (const item of items) {
                    const menuId = item?.menuId ?? item?.menu?.id;
                    if (menuId == null) continue;

                    const menuInfo = item?.menu || menuById.get(menuId) || { id: menuId, name: `Prato #${menuId}` };
                    if (!dishGroups.has(menuId)) {
                        dishGroups.set(menuId, { menuInfo, items: [] });
                    }
                    dishGroups.get(menuId).items.push(item);
                }
            } else if (order?.menuId != null) {
                const menuInfo = order?.menu || menuById.get(order.menuId) || { id: order.menuId, name: `Prato #${order.menuId}` };
                if (!dishGroups.has(order.menuId)) {
                    dishGroups.set(order.menuId, { menuInfo, items: [] });
                }
                dishGroups.get(order.menuId).items.push({
                    quantity: 1,
                    unit_price: Number(order?.total_value) || Number(menuInfo?.price) || 0,
                });
            }
        }
    }

    return Array.from(dishGroups.entries())
        .map(([menuId, group]) => {
            const quantity = calcularVendaTotalPrato(group.items);
            const revenue = calcularReceitaTotalPrato(group.items, group.menuInfo?.price);
            const cost = calcularCustoTotalPrato(quantity, group.menuInfo, productsList);
            const profit = calcularLucroPrato(revenue, cost);
            const margin = calcularMargemLucroPrato(revenue, profit);

            return {
                id: menuId,
                name: group.menuInfo?.name || `Prato #${menuId}`,
                category: group.menuInfo?.category || null,
                quantity,
                revenue,
                cost,
                profit,
                margin,
            };
        })
        .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
        .slice(0, limit);
}

/**
 * Calcular dias com maior atividade no restaurante (com base em todos os meses).
 */
export function calcularDiasMaiorAtividade(orders = []) {
    const countsByDay = new Map(WEEKDAY_NAMES.map((day) => [day, { count: 0, revenue: 0 }]));
    let totalOrders = 0;

    if (Array.isArray(orders)) {
        for (const order of orders) {
            const weekday = transformarDataParaDiaSemana(getOrderRawDate(order));
            if (!weekday || !countsByDay.has(weekday)) continue;

            const bucket = countsByDay.get(weekday);
            bucket.count += 1;
            bucket.revenue += Number(order?.total_value) || 0;
            totalOrders += 1;
        }
    }

    return WEEKDAY_NAMES.map((day) => {
        const { count, revenue } = countsByDay.get(day);
        const percentage = totalOrders > 0 ? Number(((count / totalOrders) * 100).toFixed(1)) : 0;
        return {
            day,
            count,
            revenue: Number(revenue.toFixed(2)),
            percentage,
        };
    });
}

/**
 * Identifica a categoria de cardápio com maior faturamento entre as comandas.
 */
export function calcularMaiorCategoriaClientes(orders = [], menuList = []) {
    const menuById = new Map();
    if (Array.isArray(menuList)) {
        for (const item of menuList) {
            if (item?.id != null) menuById.set(item.id, item);
        }
    }

    const revenueByCategory = new Map();
    let totalItemRevenue = 0;

    if (Array.isArray(orders)) {
        for (const order of orders) {
            const items = Array.isArray(order?.items) ? order.items : [];
            for (const item of items) {
                const menuInfo = item?.menu || menuById.get(item?.menuId);
                const category = menuInfo?.category;
                if (!category) continue;

                const lineValue = (Number(item?.quantity) || 0) * (Number(item?.unit_price ?? menuInfo?.price) || 0);
                if (lineValue <= 0) continue;

                revenueByCategory.set(category, (revenueByCategory.get(category) || 0) + lineValue);
                totalItemRevenue += lineValue;
            }
        }
    }

    if (totalItemRevenue <= 0 || revenueByCategory.size === 0) {
        return { categoryLabel: 'Sem vendas', percentage: 0, hasData: false };
    }

    let topCategory = null;
    let topValue = -1;
    for (const [category, value] of revenueByCategory.entries()) {
        if (value > topValue) {
            topValue = value;
            topCategory = category;
        }
    }

    return {
        categoryLabel: formatMenuCategoryLabel(topCategory),
        percentage: Math.round((topValue / totalItemRevenue) * 100),
        hasData: true,
    };
}
