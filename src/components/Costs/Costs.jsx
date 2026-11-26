import { useEffect, useMemo, useState } from 'react';
import { getCosts } from '../../services/costs';
import {
    BRAND_CHART_COLORS,
    calcularCustoFixoPorCategoria,
    calcularCustoVariavelPorCategoria,
    calcularTendenciaMensal,
    formatCompactCurrency,
    formatFullCurrency,
    getNiceAxisTicks,
    separarValoresPorMeses,
    somarCustosFixos,
    somarCustosVariaveis,
} from '../../utils/costsUtils';
import './costs.css';

const PIE_COLORS = BRAND_CHART_COLORS;

function TrendArrow({ direction = 'down' }) {
    const isUp = direction === 'up';
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-label={isUp ? 'Tendência de alta' : 'Tendência de queda'}
            className={`costs-trend-arrow ${isUp ? 'is-up' : 'is-down'}`}
        >
            <path
                d={isUp ? 'M12 4L5 11H9V20H15V11H19L12 4Z' : 'M12 20L19 13H15V4H9V13H5L12 20Z'}
                fill="currentColor"
            />
        </svg>
    );
}

function formatAxisTick(value) {
    if (value === 0) return '0';
    return value.toLocaleString('pt-BR');
}

function HorizontalBarChart({ data, title, subtitle, costTypeFilter, onChangeFilter }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const maxValue = useMemo(
        () => Math.max(...data.map((item) => item.Value), 0),
        [data]
    );
    const { maxTick, ticks } = useMemo(() => getNiceAxisTicks(maxValue), [maxValue]);

    const width = 540;
    const rowHeight = 26;
    const padding = { top: 8, right: 26, bottom: 28, left: 42 };
    const chartHeight = Math.max(data.length * rowHeight, 180);
    const height = padding.top + chartHeight + padding.bottom;
    const chartWidth = width - padding.left - padding.right;
    const barHeight = Math.min(18, Math.max(12, rowHeight - 8));

    const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

    return (
        <section className="costs-card costs-bar-card">
            <div className="costs-bar-header">
                <div>
                    <h3>{title}</h3>
                    <p className="costs-subtitle">{subtitle}</p>
                </div>
                <div className="costs-toggle-group" role="tablist" aria-label="Tipo de custo do gráfico">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={costTypeFilter === 'Variavel'}
                        className={`costs-toggle-btn ${costTypeFilter === 'Variavel' ? 'active' : ''}`}
                        onClick={() => onChangeFilter('Variavel')}
                    >
                        Custos Variáveis
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={costTypeFilter === 'Fixo'}
                        className={`costs-toggle-btn ${costTypeFilter === 'Fixo' ? 'active' : ''}`}
                        onClick={() => onChangeFilter('Fixo')}
                    >
                        Custos Fixos
                    </button>
                </div>
            </div>

            <div className="costs-bar-chart-wrapper">
                {hoveredItem && (
                    <div className="costs-chart-tooltip">
                        <strong>{hoveredItem.Month}:</strong> {formatFullCurrency(hoveredItem.Value)}
                        <span className="costs-tooltip-status">
                            {hoveredItem.isFinished ? 'Mês encerrado' : 'Mês em andamento'}
                        </span>
                    </div>
                )}

                <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
                    {ticks.map((tick) => {
                        const x = padding.left + (tick / maxTick) * chartWidth;
                        return (
                            <g key={tick}>
                                <line
                                    x1={x}
                                    y1={padding.top}
                                    x2={x}
                                    y2={padding.top + chartHeight}
                                    className="costs-grid-line"
                                />
                                <text
                                    x={x}
                                    y={padding.top + chartHeight + 18}
                                    textAnchor="middle"
                                    className="costs-axis-label"
                                >
                                    {formatAxisTick(tick)}
                                </text>
                            </g>
                        );
                    })}

                    {data.map((item, index) => {
                        const y = padding.top + index * rowHeight + (rowHeight - barHeight) / 2;
                        const barWidth = maxTick > 0 ? Math.max((item.Value / maxTick) * chartWidth, 0) : 0;
                        const isHovered = hoveredIndex === index;

                        return (
                            <g
                                key={item.Month}
                                className="costs-bar-row"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <text
                                    x={padding.left - 10}
                                    y={y + barHeight / 2 + 4}
                                    textAnchor="end"
                                    className="costs-month-label"
                                >
                                    {item.Month}
                                </text>
                                <rect
                                    x={padding.left}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    rx="2"
                                    className={`costs-bar-rect ${isHovered ? 'is-hovered' : ''}`}
                                />
                            </g>
                        );
                    })}
                </svg>

                {maxValue === 0 && (
                    <p className="costs-empty-hint">Nenhum lançamento registrado neste período.</p>
                )}
            </div>
        </section>
    );
}

function CostPieCard({ title, breakdown }) {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const cx = 128;
    const cy = 108;
    const radius = 72;
    const labelRadius = radius + 19;

    const slices = useMemo(() => {
        if (!breakdown.length) return [];

        let currentAngle = -Math.PI / 2;
        return breakdown.map((item, index) => {
            const sliceAngle = (item.percentage / 100) * Math.PI * 2;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            const midAngle = startAngle + sliceAngle / 2;
            currentAngle = endAngle;

            const x1 = cx + radius * Math.cos(startAngle);
            const y1 = cy + radius * Math.sin(startAngle);
            const x2 = cx + radius * Math.cos(endAngle);
            const y2 = cy + radius * Math.sin(endAngle);
            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z',
            ].join(' ');

            const labelX = cx + labelRadius * Math.cos(midAngle);
            const labelY = cy + labelRadius * Math.sin(midAngle);
            const cosMid = Math.cos(midAngle);
            const textAnchor = cosMid > 0.2 ? 'start' : cosMid < -0.2 ? 'end' : 'middle';

            return {
                ...item,
                color: PIE_COLORS[index % PIE_COLORS.length],
                pathData,
                labelX,
                labelY,
                textAnchor,
            };
        });
    }, [breakdown]);

    const activeSlice = slices.find((slice) => slice.category === hoveredCategory) || null;

    return (
        <section className="costs-card costs-pie-card">
            <div className="costs-pie-header">
                <h3>{title}</h3>
                {activeSlice && (
                    <span className="costs-pie-hover-info">
                        {activeSlice.label}: {formatFullCurrency(activeSlice.value)} ({activeSlice.percentage.toString().replace('.', ',')}%)
                    </span>
                )}
            </div>

            {slices.length === 0 ? (
                <div className="costs-pie-empty">
                    <svg viewBox="0 0 256 216" className="costs-pie-svg" role="img" aria-label={title}>
                        <circle cx={cx} cy={cy} r={radius} fill="#efeff3" />
                    </svg>
                    <p className="costs-empty-hint">Sem custos cadastrados nesta categoria.</p>
                </div>
            ) : (
                <div className="costs-pie-content">
                    <svg viewBox="0 0 256 216" className="costs-pie-svg" role="img" aria-label={title}>
                        {slices.length === 1 ? (
                            <g
                                onMouseEnter={() => setHoveredCategory(slices[0].category)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={radius}
                                    fill={slices[0].color}
                                    className="costs-pie-slice"
                                />
                                <text
                                    x={cx}
                                    y={cy - radius - 10}
                                    textAnchor="middle"
                                    className="costs-pie-percent"
                                >
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
                                        className={`costs-pie-slice ${
                                            hoveredCategory === slice.category ? 'is-hovered' : ''
                                        }`}
                                    />
                                    {slice.percentage >= 3 && (
                                        <text
                                            x={slice.labelX}
                                            y={slice.labelY + 4}
                                            textAnchor={slice.textAnchor}
                                            className="costs-pie-percent"
                                        >
                                            {slice.percentage.toString().replace('.', ',')}%
                                        </text>
                                    )}
                                </g>
                            ))
                        )}
                    </svg>

                    <ul className="costs-pie-legend">
                        {slices.map((slice) => (
                            <li
                                key={slice.category}
                                className={hoveredCategory === slice.category ? 'is-hovered' : ''}
                                onMouseEnter={() => setHoveredCategory(slice.category)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <span
                                    className="costs-legend-dot"
                                    style={{ backgroundColor: slice.color }}
                                />
                                <span className="costs-legend-label">{slice.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

function Costs({ costs: externalCosts, loading: externalLoading = false }) {
    const [internalCosts, setInternalCosts] = useState([]);
    const [internalLoading, setInternalLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [barChartType, setBarChartType] = useState('Variavel');

    const hasExternalCosts = Array.isArray(externalCosts);
    const costsList = hasExternalCosts ? externalCosts : internalCosts;
    const isLoading = hasExternalCosts ? externalLoading : internalLoading;

    useEffect(() => {
        if (hasExternalCosts) return;

        let isMounted = true;
        async function loadCosts() {
            setInternalLoading(true);
            setFetchError('');
            try {
                const data = await getCosts();
                if (isMounted) {
                    setInternalCosts(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (isMounted) {
                    setFetchError(error.message || 'Não foi possível carregar os custos.');
                }
            } finally {
                if (isMounted) {
                    setInternalLoading(false);
                }
            }
        }

        loadCosts();
        return () => {
            isMounted = false;
        };
    }, [hasExternalCosts]);

    const currentYear = new Date().getFullYear();

    const totalFixed = useMemo(() => somarCustosFixos(costsList), [costsList]);
    const totalVariable = useMemo(() => somarCustosVariaveis(costsList), [costsList]);

    const fixedTrend = useMemo(
        () => calcularTendenciaMensal(costsList, 'Fixo', currentYear),
        [costsList, currentYear]
    );
    const variableTrend = useMemo(
        () => calcularTendenciaMensal(costsList, 'Variavel', currentYear),
        [costsList, currentYear]
    );

    const monthlyBarData = useMemo(
        () => separarValoresPorMeses(costsList, { year: currentYear, costType: barChartType }),
        [costsList, currentYear, barChartType]
    );

    const fixedBreakdown = useMemo(() => calcularCustoFixoPorCategoria(costsList), [costsList]);
    const variableBreakdown = useMemo(
        () => calcularCustoVariavelPorCategoria(costsList),
        [costsList]
    );

    if (isLoading && costsList.length === 0) {
        return <div className="costs-status-message">Carregando custos fixos e variáveis...</div>;
    }

    if (fetchError && costsList.length === 0) {
        return <div className="costs-status-message error">{fetchError}</div>;
    }

    return (
        <div className="costs-dashboard">
            <div className="costs-top-row">
                <HorizontalBarChart
                    data={monthlyBarData}
                    title={
                        barChartType === 'Variavel'
                            ? 'Variação de Custos Variáveis'
                            : 'Variação de Custos Fixos'
                    }
                    subtitle={`Unidade XYZ - ${currentYear}`}
                    costTypeFilter={barChartType}
                    onChangeFilter={setBarChartType}
                />

                <div className="costs-totals-column">
                    <section className="costs-card costs-total-card">
                        <h3>Total de Custos Fixos</h3>
                        <div className="costs-total-value-row" title={formatFullCurrency(totalFixed)}>
                            <strong>{formatCompactCurrency(totalFixed)}</strong>
                            <TrendArrow direction={fixedTrend.direction} />
                        </div>
                        <span className="costs-total-exact">{formatFullCurrency(totalFixed)}</span>
                    </section>

                    <section className="costs-card costs-total-card">
                        <h3>Total de Custos Variáveis</h3>
                        <div className="costs-total-value-row" title={formatFullCurrency(totalVariable)}>
                            <strong>{formatCompactCurrency(totalVariable)}</strong>
                            <TrendArrow direction={variableTrend.direction} />
                        </div>
                        <span className="costs-total-exact">{formatFullCurrency(totalVariable)}</span>
                    </section>
                </div>
            </div>

            <div className="costs-pies-row">
                <CostPieCard title="Gastos de Custo Fixo" breakdown={fixedBreakdown} />
                <CostPieCard title="Gastos de Custo Variável" breakdown={variableBreakdown} />
            </div>
        </div>
    );
}

export default Costs;
