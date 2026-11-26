import { useEffect, useMemo, useState } from 'react';
import { getCosts } from '../../services/costs';
import { getOrders } from '../../services/orders';
import { getProducts } from '../../services/products';
import {
    formatFullCurrency,
    somarCustosFixos,
    somarCustosFixosEVariaveis,
    somarCustosVariaveis,
} from '../../utils/costsUtils';
import {
    calcularFaturamento,
    calcularLucro,
    calcularMargemDeLucro,
    definirProjecoesDeLucro,
    formatCompactNumber,
    separarFaturamentoPorMeses,
    separarLucroLiquidoPorMeses,
    somarCustoProdutos,
} from '../../utils/profitUtils';
import '../CMV/cmv.css';
import './ProfitPoint.css';

function computeLineScale(values) {
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 0);

    if (minVal === 0 && maxVal === 0) {
        return { minTick: 0, maxTick: 20000, ticks: [0, 5000, 10000, 15000, 20000] };
    }

    const span = Math.max(maxVal - minVal, 1);
    const rawStep = span / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    let niceNorm = 10;
    if (normalized <= 1) niceNorm = 1;
    else if (normalized <= 2) niceNorm = 2;
    else if (normalized <= 2.5) niceNorm = 2.5;
    else if (normalized <= 5) niceNorm = 5;

    const step = niceNorm * magnitude;
    const minTick = minVal < 0 ? Math.floor(minVal / step) * step : 0;
    const maxTick = Math.max(Math.ceil(maxVal / step) * step, minTick + step * 4);
    const tickCount = Math.round((maxTick - minTick) / step);
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round(minTick + i * step));

    return { minTick, maxTick: ticks[ticks.length - 1], ticks };
}

function formatYAxisTick(tick) {
    if (tick === 0) return '0';
    return tick.toLocaleString('pt-BR');
}

function LineChart({ series, title }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const width = 460;
    const height = 192;
    const padding = { top: 18, right: 16, bottom: 28, left: 54 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const values = useMemo(() => series.map((item) => item.Value), [series]);
    const { minTick, maxTick, ticks } = useMemo(() => computeLineScale(values), [values]);
    const range = maxTick - minTick || 1;

    const points = useMemo(
        () =>
            series.map((item, index) => {
                const x =
                    series.length > 1
                        ? padding.left + (index * chartWidth) / (series.length - 1)
                        : padding.left + chartWidth / 2;
                const y = padding.top + ((maxTick - item.Value) * chartHeight) / range;
                return { x, y, ...item };
            }),
        [series, chartWidth, chartHeight, maxTick, range]
    );

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    return (
        <section className="dashboard-chart-card profit-chart-card">
            <div className="profit-chart-header">
                <h3>{title}</h3>
                {hoveredPoint && (
                    <span className="profit-chart-tooltip">
                        {hoveredPoint.Month}: {formatFullCurrency(hoveredPoint.Value)}
                    </span>
                )}
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
                {ticks.map((tick) => {
                    const y = padding.top + ((maxTick - tick) * chartHeight) / range;
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
                                {formatYAxisTick(tick)}
                            </text>
                        </g>
                    );
                })}

                {points.map((point) => (
                    <text
                        key={point.Month}
                        x={point.x}
                        y={height - 7}
                        textAnchor="middle"
                        className="chart-month"
                    >
                        {point.Month}
                    </text>
                ))}

                {points.length > 1 && (
                    <polyline
                        points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                        fill="none"
                        className="chart-line"
                    />
                )}

                {points.map((point, index) => (
                    <g
                        key={point.Month}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="profit-dot-target"
                    >
                        <circle cx={point.x} cy={point.y} r="10" fill="transparent" />
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={hoveredIndex === index ? '5' : '3.2'}
                            className="chart-dot"
                        />
                    </g>
                ))}
            </svg>
        </section>
    );
}

function MarginArrow({ isPositive }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-label={isPositive ? 'Margem positiva' : 'Margem negativa'}
            className={`profit-margin-arrow ${isPositive ? 'is-positive' : 'is-negative'}`}
        >
            <path
                d={isPositive ? 'M12 4L5 11H9V20H15V11H19L12 4Z' : 'M12 20L19 13H15V4H9V13H5L12 20Z'}
                fill="currentColor"
            />
        </svg>
    );
}

function ProfitPoint({
    orders: externalOrders,
    costs: externalCosts,
    products: externalProducts,
    loading: externalLoading = false,
}) {
    const [internalData, setInternalData] = useState({
        orders: [],
        costs: [],
        products: [],
    });
    const [internalLoading, setInternalLoading] = useState(false);

    const hasExternalData =
        Array.isArray(externalOrders) && Array.isArray(externalCosts);

    useEffect(() => {
        if (hasExternalData) return;

        let isMounted = true;
        async function loadData() {
            setInternalLoading(true);
            const [ordersRes, costsRes, productsRes] = await Promise.allSettled([
                getOrders(),
                getCosts(),
                getProducts(),
            ]);

            if (!isMounted) return;

            setInternalData({
                orders:
                    ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)
                        ? ordersRes.value
                        : [],
                costs:
                    costsRes.status === 'fulfilled' && Array.isArray(costsRes.value)
                        ? costsRes.value
                        : [],
                products:
                    productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)
                        ? productsRes.value
                        : [],
            });
            setInternalLoading(false);
        }

        loadData();
        return () => {
            isMounted = false;
        };
    }, [hasExternalData]);

    const orders = hasExternalData ? externalOrders : internalData.orders;
    const costs = hasExternalData ? externalCosts : internalData.costs;
    const products = Array.isArray(externalProducts)
        ? externalProducts
        : internalData.products;
    const isLoading = hasExternalData ? externalLoading : internalLoading;

    const currentYear = new Date().getFullYear();

    const faturamentoBruto = useMemo(() => calcularFaturamento(orders), [orders]);
    const fixedCosts = useMemo(() => somarCustosFixos(costs), [costs]);
    const variableCosts = useMemo(() => somarCustosVariaveis(costs), [costs]);
    const totalCustos = useMemo(
        () => somarCustosFixosEVariaveis(fixedCosts, variableCosts),
        [fixedCosts, variableCosts]
    );
    const cmvTotal = useMemo(() => somarCustoProdutos(products), [products]);

    const lucroBruto = useMemo(
        () => calcularLucro(faturamentoBruto, totalCustos),
        [faturamentoBruto, totalCustos]
    );

    const margemBruta = useMemo(
        () => calcularMargemDeLucro(faturamentoBruto, lucroBruto),
        [faturamentoBruto, lucroBruto]
    );

    const monthlyProfitSeries = useMemo(
        () => separarLucroLiquidoPorMeses(orders, costs, currentYear),
        [orders, costs, currentYear]
    );

    const monthlyRevenueSeries = useMemo(
        () => separarFaturamentoPorMeses(orders, currentYear),
        [orders, currentYear]
    );

    const projectionRows = useMemo(
        () =>
            definirProjecoesDeLucro({
                faturamento: faturamentoBruto,
                cmv: cmvTotal,
                fixedCosts,
                variableCosts,
            }),
        [faturamentoBruto, cmvTotal, fixedCosts, variableCosts]
    );

    if (isLoading && orders.length === 0 && costs.length === 0) {
        return <div className="profit-status-message">Carregando dados de lucro e faturamento...</div>;
    }

    return (
        <div className="financial-dashboard">
            <div className="dashboard-charts">
                <LineChart
                    series={monthlyProfitSeries}
                    title="Evolução do Lucro ao Longo dos Meses"
                />
                <LineChart series={monthlyRevenueSeries} title="Faturamento" />
            </div>

            <div className="dashboard-summary">
                <section className="summary-card profit-summary-card" title={formatFullCurrency(lucroBruto)}>
                    <h3>Lucro Bruto</h3>
                    <strong>{formatCompactNumber(lucroBruto)}</strong>
                </section>
                <section className="summary-card profit-summary-card" title={formatFullCurrency(faturamentoBruto)}>
                    <h3>Faturamento Bruto</h3>
                    <strong>{formatCompactNumber(faturamentoBruto)}</strong>
                </section>
                <section className="summary-card profit-summary-card">
                    <h3>Margem Bruta</h3>
                    <strong>
                        <span>{margemBruta.toString().replace('.', ',')} %</span>
                        <MarginArrow isPositive={margemBruta >= 0} />
                    </strong>
                </section>
            </div>

            <section className="projection-card">
                <div className="projection-heading">
                    <h3>Projeções de Lucro</h3>
                    <p>Projeções de Lucros com Diferentes Cenários</p>
                </div>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Cenário</th>
                                <th>Vendas</th>
                                <th>CMV</th>
                                <th>Custos</th>
                                <th>Lucro</th>
                                <th>Margem (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectionRows.map((row) => (
                                <tr key={row.scenario}>
                                    <td>{row.scenario}</td>
                                    <td>{formatFullCurrency(row.revenue)}</td>
                                    <td>{formatFullCurrency(row.cmv)}</td>
                                    <td>{formatFullCurrency(row.costs)}</td>
                                    <td>{formatFullCurrency(row.profit)}</td>
                                    <td>{row.margin.toString().replace('.', ',')}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default ProfitPoint;
