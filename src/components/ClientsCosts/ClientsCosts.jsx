import { useEffect, useMemo, useState } from 'react';
import { getMenu } from '../../services/menu';
import { getOrders } from '../../services/orders';
import { getProducts } from '../../services/products';
import { BRAND_CHART_COLORS, formatFullCurrency, getNiceAxisTicks, MONTH_ABBREVIATIONS } from '../../utils/costsUtils';
import { calcularFaturamento } from '../../utils/profitUtils';
import {
    calcularDiasMaiorAtividade,
    calcularTicketMedio,
    obterTopPratosMaisVendidos,
    separarTicketMedioPorMeses,
} from '../../utils/clientsCostsUtils';
import './clients_costs.css';

const FULL_MONTH_NAMES = [
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

const WEEKDAY_COLORS = [
    BRAND_CHART_COLORS[3], // #ffdf98 Domingo
    BRAND_CHART_COLORS[1], // #f4b153 Segunda-feira
    BRAND_CHART_COLORS[0], // #3553b5 Terça-feira
    BRAND_CHART_COLORS[2], // #191444 Quarta-feira
    BRAND_CHART_COLORS[4], // Quinta-feira
    BRAND_CHART_COLORS[5], // Sexta-feira
    BRAND_CHART_COLORS[6], // Sábado
];

function TicketEvolutionChart({ series, year }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const width = 560;
    const height = 220;
    const padding = { top: 18, right: 16, bottom: 28, left: 46 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = useMemo(
        () => Math.max(...series.map((item) => item.Value), 0),
        [series]
    );
    const { maxTick, ticks } = useMemo(() => getNiceAxisTicks(maxValue, 30), [maxValue]);

    const slotWidth = chartWidth / Math.max(series.length, 1);
    const barWidth = Math.min(28, Math.max(14, slotWidth * 0.68));
    const hoveredItem = hoveredIndex !== null ? series[hoveredIndex] : null;

    return (
        <section className="clients-card clients-ticket-chart-card">
            <div className="clients-chart-header">
                <div>
                    <h3>Evolução do Ticket ao Longo dos Meses</h3>
                    <p className="clients-subtitle">Unidade Sabor&Cia - {year}</p>
                </div>
                {hoveredItem && (
                    <div className="clients-chart-tooltip">
                        <strong>{hoveredItem.Month}:</strong> {formatFullCurrency(hoveredItem.Value)}
                        <span>
                            ({hoveredItem.orderCount} {hoveredItem.orderCount === 1 ? 'pedido' : 'pedidos'})
                        </span>
                    </div>
                )}
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolução do Ticket ao Longo dos Meses">
                {ticks.map((tick) => {
                    const y = padding.top + ((maxTick - tick) * chartHeight) / maxTick;
                    return (
                        <g key={tick}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                className="clients-grid-line"
                            />
                            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="clients-axis-label">
                                {tick.toLocaleString('pt-BR')}
                            </text>
                        </g>
                    );
                })}

                {series.map((item, index) => {
                    const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
                    const barHeight = maxTick > 0 ? (item.Value / maxTick) * chartHeight : 0;
                    const y = padding.top + chartHeight - barHeight;
                    const isHovered = hoveredIndex === index;

                    return (
                        <g
                            key={item.Month}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="clients-bar-group"
                        >
                            <rect
                                x={padding.left + index * slotWidth}
                                y={padding.top}
                                width={slotWidth}
                                height={chartHeight}
                                fill="transparent"
                            />
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 0)}
                                rx="2"
                                className={`clients-bar-rect ${isHovered ? 'is-hovered' : ''}`}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={height - 8}
                                textAnchor="middle"
                                className="clients-axis-label"
                            >
                                {item.Month}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {maxValue === 0 && (
                <p className="clients-empty-hint">Nenhuma comanda registrada neste ano.</p>
            )}
        </section>
    );
}

function ActivityDonutChart({ daysData }) {
    const [hoveredDay, setHoveredDay] = useState(null);

    const cx = 128;
    const cy = 104;
    const outerRadius = 70;
    const innerRadius = 38;
    const labelRadius = outerRadius + 18;

    const activeDays = useMemo(
        () =>
            daysData
                .map((item, index) => ({ ...item, color: WEEKDAY_COLORS[index % WEEKDAY_COLORS.length] }))
                .filter((item) => item.percentage > 0),
        [daysData]
    );

    const slices = useMemo(() => {
        if (!activeDays.length) return [];

        let currentAngle = -Math.PI / 2;
        return activeDays.map((item) => {
            const sliceAngle = (item.percentage / 100) * Math.PI * 2;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            const midAngle = startAngle + sliceAngle / 2;
            currentAngle = endAngle;

            const x1Outer = cx + outerRadius * Math.cos(startAngle);
            const y1Outer = cy + outerRadius * Math.sin(startAngle);
            const x2Outer = cx + outerRadius * Math.cos(endAngle);
            const y2Outer = cy + outerRadius * Math.sin(endAngle);

            const x1Inner = cx + innerRadius * Math.cos(endAngle);
            const y1Inner = cy + innerRadius * Math.sin(endAngle);
            const x2Inner = cx + innerRadius * Math.cos(startAngle);
            const y2Inner = cy + innerRadius * Math.sin(startAngle);

            const largeArc = sliceAngle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${x1Outer} ${y1Outer}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
                `L ${x1Inner} ${y1Inner}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
                'Z',
            ].join(' ');

            const labelX = cx + labelRadius * Math.cos(midAngle);
            const labelY = cy + labelRadius * Math.sin(midAngle);
            const cosMid = Math.cos(midAngle);
            const textAnchor = cosMid > 0.2 ? 'start' : cosMid < -0.2 ? 'end' : 'middle';

            return {
                ...item,
                pathData,
                labelX,
                labelY,
                textAnchor,
            };
        });
    }, [activeDays]);

    const hoveredItem = daysData.find((d) => d.day === hoveredDay) || null;

    return (
        <section className="clients-card clients-activity-card">
            <div className="clients-activity-header">
                <h3>Dias com Maior Atividade</h3>
                {hoveredItem && (
                    <span className="clients-activity-tooltip">
                        {hoveredItem.day}: {hoveredItem.count} {hoveredItem.count === 1 ? 'pedido' : 'pedidos'} ({hoveredItem.percentage.toString().replace('.', ',')}%)
                    </span>
                )}
            </div>

            <div className="clients-activity-content">
                {slices.length === 0 ? (
                    <div className="clients-activity-empty">
                        <svg viewBox="0 0 256 208" className="clients-donut-svg" role="img" aria-label="Dias com Maior Atividade">
                            <circle
                                cx={cx}
                                cy={cy}
                                r={(outerRadius + innerRadius) / 2}
                                fill="none"
                                stroke="#efeff3"
                                strokeWidth={outerRadius - innerRadius}
                            />
                        </svg>
                        <p className="clients-empty-hint">Sem movimentação registrada nas comandas.</p>
                    </div>
                ) : (
                    <svg viewBox="0 0 256 208" className="clients-donut-svg" role="img" aria-label="Dias com Maior Atividade">
                        {slices.length === 1 ? (
                            <g
                                onMouseEnter={() => setHoveredDay(slices[0].day)}
                                onMouseLeave={() => setHoveredDay(null)}
                            >
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={(outerRadius + innerRadius) / 2}
                                    fill="none"
                                    stroke={slices[0].color}
                                    strokeWidth={outerRadius - innerRadius}
                                    className="clients-donut-slice"
                                />
                                <text x={cx} y={cy - outerRadius - 10} textAnchor="middle" className="clients-donut-percent">
                                    100%
                                </text>
                            </g>
                        ) : (
                            slices.map((slice) => (
                                <g
                                    key={slice.day}
                                    onMouseEnter={() => setHoveredDay(slice.day)}
                                    onMouseLeave={() => setHoveredDay(null)}
                                >
                                    <path
                                        d={slice.pathData}
                                        fill={slice.color}
                                        className={`clients-donut-slice ${hoveredDay === slice.day ? 'is-hovered' : ''}`}
                                    />
                                    {slice.percentage >= 3 && (
                                        <text
                                            x={slice.labelX}
                                            y={slice.labelY + 4}
                                            textAnchor={slice.textAnchor}
                                            className="clients-donut-percent"
                                        >
                                            {slice.percentage.toString().replace('.', ',')}%
                                        </text>
                                    )}
                                </g>
                            ))
                        )}
                    </svg>
                )}

                <ul className="clients-activity-legend">
                    {daysData.map((item, index) => (
                        <li
                            key={item.day}
                            className={hoveredDay === item.day ? 'is-hovered' : ''}
                            onMouseEnter={() => setHoveredDay(item.day)}
                            onMouseLeave={() => setHoveredDay(null)}
                        >
                            <div className="clients-legend-left">
                                <span
                                    className="clients-legend-dot"
                                    style={{ backgroundColor: WEEKDAY_COLORS[index % WEEKDAY_COLORS.length] }}
                                />
                                <span>{item.day}</span>
                            </div>
                            <span className="clients-legend-meta">
                                {item.percentage.toString().replace('.', ',')}% ({item.count})
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function ClientsCosts({
    orders: externalOrders,
    menu: externalMenu,
    products: externalProducts,
    loading: externalLoading = false,
}) {
    const [internalData, setInternalData] = useState({
        orders: [],
        menu: [],
        products: [],
    });
    const [internalLoading, setInternalLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('all');

    const hasExternalData = Array.isArray(externalOrders);

    useEffect(() => {
        if (hasExternalData) return;

        let isMounted = true;
        async function loadData() {
            setInternalLoading(true);
            const [ordersRes, menuRes, productsRes] = await Promise.allSettled([
                getOrders(),
                getMenu(),
                getProducts(),
            ]);

            if (!isMounted) return;
            setInternalData({
                orders: ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : [],
                menu: menuRes.status === 'fulfilled' && Array.isArray(menuRes.value) ? menuRes.value : [],
                products: productsRes.status === 'fulfilled' && Array.isArray(productsRes.value) ? productsRes.value : [],
            });
            setInternalLoading(false);
        }

        loadData();
        return () => {
            isMounted = false;
        };
    }, [hasExternalData]);

    const orders = hasExternalData ? externalOrders : internalData.orders;
    const menu = Array.isArray(externalMenu) ? externalMenu : internalData.menu;
    const products = Array.isArray(externalProducts) ? externalProducts : internalData.products;
    const isLoading = hasExternalData ? externalLoading : internalLoading;

    const currentYear = new Date().getFullYear();

    const averageTicket = useMemo(() => calcularTicketMedio(orders), [orders]);
    const totalRevenue = useMemo(() => calcularFaturamento(orders), [orders]);
    const monthlyTicketSeries = useMemo(
        () => separarTicketMedioPorMeses(orders, currentYear),
        [orders, currentYear]
    );
    const topDishes = useMemo(
        () =>
            obterTopPratosMaisVendidos(orders, menu, products, {
                limit: 5,
                monthIndex: selectedMonth,
            }),
        [orders, menu, products, selectedMonth]
    );
    const activityByWeekday = useMemo(() => calcularDiasMaiorAtividade(orders), [orders]);

    if (isLoading && orders.length === 0) {
        return <div className="clients-status-message">Carregando gastos dos clientes e pratos mais vendidos...</div>;
    }

    return (
        <div className="clients-dashboard">
            <div className="clients-top-row">
                <TicketEvolutionChart series={monthlyTicketSeries} year={currentYear} />

                <section className="clients-card clients-ticket-summary-card">
                    <div>
                        <h3>Ticket médio por pedido</h3>
                        <p className="clients-subtitle">Gasto médio dos clientes na Unidade</p>
                    </div>
                    <strong className="clients-ticket-value">{formatFullCurrency(averageTicket)}</strong>
                    <div className="clients-ticket-meta">
                        <span>{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</span>
                        <span>Total: {formatFullCurrency(totalRevenue)}</span>
                    </div>
                </section>
            </div>

            <section className="clients-card clients-dishes-card">
                <div className="clients-dishes-header">
                    <h3>Pratos mais vendidos</h3>
                    <select
                        aria-label="Filtrar pratos mais vendidos por mês"
                        className="clients-month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="all">Todos os meses</option>
                        {MONTH_ABBREVIATIONS.map((abbr, index) => (
                            <option key={abbr} value={String(index)}>
                                {FULL_MONTH_NAMES[index]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="clients-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade Vendida</th>
                                <th>Receita Total</th>
                                <th>Custo Total</th>
                                <th>Lucro</th>
                                <th>Margem (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topDishes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="clients-table-empty">
                                        Nenhum prato vendido no período selecionado.
                                    </td>
                                </tr>
                            ) : (
                                topDishes.map((dish) => (
                                    <tr key={dish.id}>
                                        <td>{dish.name}</td>
                                        <td>{dish.quantity}</td>
                                        <td>{formatFullCurrency(dish.revenue)}</td>
                                        <td>{formatFullCurrency(dish.cost)}</td>
                                        <td>{formatFullCurrency(dish.profit)}</td>
                                        <td>{dish.margin.toString().replace('.', ',')}%</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="clients-bottom-row">
                <ActivityDonutChart daysData={activityByWeekday} />
            </div>
        </div>
    );
}

export default ClientsCosts;
