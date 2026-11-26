import { useEffect, useMemo, useState } from 'react';
import { getOrders } from '../../services/orders';
import { getProducts } from '../../services/products';
import { BRAND_CHART_COLORS, formatFullCurrency, getNiceAxisTicks } from '../../utils/costsUtils';
import { formatCompactNumber } from '../../utils/profitUtils';
import {
    calcularCmvPlanejadoVsRealizado,
    calcularCustoPorCategoriaProdutos,
    calcularResumoCmv,
    calcularTendenciaCmvMensal,
    separarCmvPorMeses,
} from '../../utils/cmvUtils';
import './cmv.css';

const CATEGORY_COLORS = BRAND_CHART_COLORS;

function TrendArrow({ direction = 'down' }) {
    const isUp = direction === 'up';
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-label={isUp ? 'Tendência de alta' : 'Tendência de queda'}
            className={`cmv-trend-arrow ${isUp ? 'is-up' : 'is-down'}`}
        >
            <path
                d={isUp ? 'M12 4L5 11H9V20H15V11H19L12 4Z' : 'M12 20L19 13H15V4H9V13H5L12 20Z'}
                fill="currentColor"
            />
        </svg>
    );
}

function CmvEvolutionChart({ series, year }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const width = 560;
    const height = 224;
    const padding = { top: 18, right: 16, bottom: 28, left: 48 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = useMemo(
        () => Math.max(...series.map((item) => item.Value), 0),
        [series]
    );
    const { maxTick, ticks } = useMemo(() => getNiceAxisTicks(maxValue, 500), [maxValue]);

    const slotWidth = chartWidth / Math.max(series.length, 1);
    const barWidth = Math.min(28, Math.max(14, slotWidth * 0.68));
    const hoveredItem = hoveredIndex !== null ? series[hoveredIndex] : null;

    return (
        <section className="cmv-card cmv-bar-card">
            <div className="cmv-chart-header">
                <div>
                    <h3>Evolução do CMV ao Longo dos Meses</h3>
                    <p className="cmv-subtitle">Unidade XYZ - {year}</p>
                </div>
            </div>

            <div className="cmv-chart-wrapper">
                {hoveredItem && (
                    <div className="cmv-chart-tooltip">
                        <strong>{hoveredItem.Month}:</strong> {formatFullCurrency(hoveredItem.Value)}
                    </div>
                )}

                <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolução do CMV ao Longo dos Meses">
                {ticks.map((tick) => {
                    const y = padding.top + ((maxTick - tick) * chartHeight) / maxTick;
                    return (
                        <g key={tick}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                className="chart-grid"
                            />
                            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-label">
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
                            className="cmv-bar-group"
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
                                className={`cmv-bar-rect ${isHovered ? 'is-hovered' : ''}`}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={height - 8}
                                textAnchor="middle"
                                className="chart-month"
                            >
                                {item.Month}
                            </text>
                        </g>
                    );
                })}
            </svg>
            </div>

            {maxValue === 0 && (
                <p className="cmv-empty-hint">Nenhum custo de produto registrado neste ano.</p>
            )}
        </section>
    );
}

function CategoryDonutCard({ breakdown }) {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const cx = 128;
    const cy = 104;
    const outerRadius = 70;
    const innerRadius = 38;
    const labelRadius = outerRadius + 18;

    const slices = useMemo(() => {
        if (!breakdown.length) return [];

        let currentAngle = -Math.PI / 2;
        return breakdown.map((item, index) => {
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
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                pathData,
                labelX,
                labelY,
                textAnchor,
            };
        });
    }, [breakdown]);

    const activeSlice = slices.find((s) => s.category === hoveredCategory) || null;

    return (
        <section className="cmv-card cmv-donut-card">
            <div className="cmv-donut-header">
                <h3>Custo por categorias de produtos</h3>
                {activeSlice && (
                    <span className="cmv-hover-pill">
                        {activeSlice.label}: {formatFullCurrency(activeSlice.value)} ({activeSlice.percentage.toString().replace('.', ',')}%)
                    </span>
                )}
            </div>

            {slices.length === 0 ? (
                <div className="cmv-donut-empty">
                    <svg viewBox="0 0 256 208" className="cmv-donut-svg" role="img" aria-label="Custo por categorias de produtos">
                        <circle
                            cx={cx}
                            cy={cy}
                            r={(outerRadius + innerRadius) / 2}
                            fill="none"
                            stroke="#efeff3"
                            strokeWidth={outerRadius - innerRadius}
                        />
                    </svg>
                    <p className="cmv-empty-hint">Sem produtos cadastrados com custo.</p>
                </div>
            ) : (
                <div className="cmv-donut-content">
                    <svg viewBox="0 0 256 208" className="cmv-donut-svg" role="img" aria-label="Custo por categorias de produtos">
                        {slices.length === 1 ? (
                            <g
                                onMouseEnter={() => setHoveredCategory(slices[0].category)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={(outerRadius + innerRadius) / 2}
                                    fill="none"
                                    stroke={slices[0].color}
                                    strokeWidth={outerRadius - innerRadius}
                                    className="cmv-donut-slice"
                                />
                                <text x={cx} y={cy - outerRadius - 10} textAnchor="middle" className="cmv-donut-percent">
                                    100%
                                </text>
                            </g>
                        ) : (
                            slices.map((slice) => (
                                <g
                                    key={slice.category}
                                    onMouseEnter={() => setHoveredCategory(slice.category)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <path
                                        d={slice.pathData}
                                        fill={slice.color}
                                        className={`cmv-donut-slice ${hoveredCategory === slice.category ? 'is-hovered' : ''}`}
                                    />
                                    {slice.percentage >= 3 && (
                                        <text
                                            x={slice.labelX}
                                            y={slice.labelY + 4}
                                            textAnchor={slice.textAnchor}
                                            className="cmv-donut-percent"
                                        >
                                            {slice.percentage.toString().replace('.', ',')}%
                                        </text>
                                    )}
                                </g>
                            ))
                        )}
                    </svg>

                    <ul className="cmv-donut-legend">
                        {slices.map((slice) => (
                            <li
                                key={slice.category}
                                className={hoveredCategory === slice.category ? 'is-hovered' : ''}
                                onMouseEnter={() => setHoveredCategory(slice.category)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <span className="cmv-legend-dot" style={{ backgroundColor: slice.color }} />
                                <span className="cmv-legend-label">{slice.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

function PlannedVsRealizedCard({ comparison }) {
    const [hoveredMonth, setHoveredMonth] = useState(null);

    const maxValue = useMemo(
        () => Math.max(...comparison.flatMap((item) => [item.planned, item.realized]), 0),
        [comparison]
    );
    const { maxTick, ticks } = useMemo(() => getNiceAxisTicks(maxValue, 800), [maxValue]);

    const width = 420;
    const rowHeight = 46;
    const padding = { top: 10, right: 20, bottom: 26, left: 40 };
    const chartHeight = Math.max(comparison.length * rowHeight, 148);
    const height = padding.top + chartHeight + padding.bottom;
    const chartWidth = width - padding.left - padding.right;

    const hoveredItem = comparison.find((item) => item.Month === hoveredMonth) || null;

    return (
        <section className="cmv-card cmv-comparison-card">
            <div className="cmv-comparison-header">
                <div>
                    <h3>CMV | Diferença por Planejamento</h3>
                    <div className="cmv-comparison-legend">
                        <span><i className="cmv-dot-planned" /> Planejado</span>
                        <span><i className="cmv-dot-realized" /> Realizado</span>
                    </div>
                </div>
            </div>

            <div className="cmv-chart-wrapper">
                {hoveredItem && (
                    <span className="cmv-hover-pill cmv-floating-pill">
                        {hoveredItem.Month}: Plan. {formatFullCurrency(hoveredItem.planned)} | Real. {formatFullCurrency(hoveredItem.realized)}
                    </span>
                )}

                <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="CMV | Diferença por Planejamento">
                    {ticks.map((tick) => {
                        const x = padding.left + (tick / maxTick) * chartWidth;
                        return (
                            <g key={tick}>
                                <line
                                    x1={x}
                                    y1={padding.top}
                                    x2={x}
                                    y2={padding.top + chartHeight}
                                    className="chart-grid"
                                />
                                <text x={x} y={padding.top + chartHeight + 17} textAnchor="middle" className="chart-label">
                                    {tick.toLocaleString('pt-BR')}
                                </text>
                            </g>
                        );
                    })}

                    {comparison.map((item, index) => {
                        const rowTop = padding.top + index * rowHeight;
                        const baseY = rowTop + 8;
                        const plannedWidth = maxTick > 0 ? (item.planned / maxTick) * chartWidth : 0;
                        const realizedWidth = maxTick > 0 ? (item.realized / maxTick) * chartWidth : 0;

                        return (
                            <g
                                key={item.Month}
                                className="cmv-comparison-row"
                                onMouseEnter={() => setHoveredMonth(item.Month)}
                                onMouseLeave={() => setHoveredMonth(null)}
                            >
                                <rect
                                    x={padding.left}
                                    y={rowTop}
                                    width={chartWidth}
                                    height={rowHeight}
                                    fill="transparent"
                                />
                                <text x={padding.left - 8} y={baseY + 18} textAnchor="end" className="chart-month">
                                    {item.Month}
                                </text>
                                <rect
                                    x={padding.left}
                                    y={baseY}
                                    width={Math.max(plannedWidth, 0)}
                                    height="14"
                                    rx="2"
                                    className="cmv-bar-planned"
                                />
                                <rect
                                    x={padding.left}
                                    y={baseY + 17}
                                    width={Math.max(realizedWidth, 0)}
                                    height="14"
                                    rx="2"
                                    className="cmv-bar-realized"
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>
        </section>
    );
}

function CMV({ products: externalProducts, orders: externalOrders, loading: externalLoading = false }) {
    const [internalData, setInternalData] = useState({ products: [], orders: [] });
    const [internalLoading, setInternalLoading] = useState(false);

    const hasExternalData = Array.isArray(externalProducts);

    useEffect(() => {
        if (hasExternalData) return;

        let isMounted = true;
        async function loadData() {
            setInternalLoading(true);
            const [productsRes, ordersRes] = await Promise.allSettled([getProducts(), getOrders()]);

            if (!isMounted) return;
            setInternalData({
                products: productsRes.status === 'fulfilled' && Array.isArray(productsRes.value) ? productsRes.value : [],
                orders: ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) ? ordersRes.value : [],
            });
            setInternalLoading(false);
        }

        loadData();
        return () => {
            isMounted = false;
        };
    }, [hasExternalData]);

    const products = hasExternalData ? externalProducts : internalData.products;
    const orders = Array.isArray(externalOrders) ? externalOrders : internalData.orders;
    const isLoading = hasExternalData ? externalLoading : internalLoading;

    const currentYear = new Date().getFullYear();

    const { cmvTotal, cmvPercentual } = useMemo(
        () => calcularResumoCmv(products, orders),
        [products, orders]
    );
    const cmvTrend = useMemo(
        () => calcularTendenciaCmvMensal(products, currentYear),
        [products, currentYear]
    );
    const monthlyCmvSeries = useMemo(
        () => separarCmvPorMeses(products, currentYear),
        [products, currentYear]
    );
    const categoryBreakdown = useMemo(
        () => calcularCustoPorCategoriaProdutos(products),
        [products]
    );
    const plannedVsRealized = useMemo(
        () => calcularCmvPlanejadoVsRealizado(products, orders, currentYear),
        [products, orders, currentYear]
    );

    if (isLoading && products.length === 0) {
        return <div className="cmv-status-message">Carregando custo de mercadoria vendida...</div>;
    }

    return (
        <div className="cmv-dashboard">
            <div className="cmv-top-row">
                <CmvEvolutionChart series={monthlyCmvSeries} year={currentYear} />

                <div className="cmv-totals-column">
                    <section className="cmv-card cmv-summary-card">
                        <h3>Percentual do CMV Sobre o Faturamento</h3>
                        <div className="cmv-summary-value-row">
                            <strong>{cmvPercentual.toString().replace('.', ',')} %</strong>
                            <TrendArrow direction={cmvTrend.direction} />
                        </div>
                    </section>

                    <section className="cmv-card cmv-summary-card" title={formatFullCurrency(cmvTotal)}>
                        <h3>Custo Total das Mercadorias Vendidas</h3>
                        <div className="cmv-summary-value-row">
                            <strong>{formatCompactNumber(cmvTotal)}</strong>
                        </div>
                        <span className="cmv-summary-exact">{formatFullCurrency(cmvTotal)}</span>
                    </section>
                </div>
            </div>

            <div className="cmv-bottom-row">
                <CategoryDonutCard breakdown={categoryBreakdown} />
                <PlannedVsRealizedCard comparison={plannedVsRealized} />
            </div>
        </div>
    );
}

export default CMV;
