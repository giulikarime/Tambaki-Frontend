import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip } from '../ui/chart';
import { getCosts } from '../../services/costs';
import { getOrders } from '../../services/orders';
import './profit_point.css';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const INGREDIENTS_CATEGORY = 'Insumos_Ingredientes';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
});

function getDateParts(value) {
    if (typeof value === 'string') {
        const match = /^(\d{4})-(\d{2})-\d{2}/.exec(value);
        if (match) {
            return { year: Number(match[1]), month: Number(match[2]) - 1 };
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return { year: date.getFullYear(), month: date.getMonth() };
}

function validateData(orders, costs) {
    if (!Array.isArray(orders) || !Array.isArray(costs)) {
        throw new Error('A API retornou dados financeiros em um formato inesperado.');
    }

    for (const order of orders) {
        if (!Number.isFinite(Number(order.total_value))) {
            throw new Error('A API retornou um pedido sem um faturamento válido.');
        }
    }

    for (const cost of costs) {
        if (!Number.isFinite(Number(cost.amount))) {
            throw new Error('A API retornou um custo sem um valor válido.');
        }
    }
}

function ProfitChart({ title, values, year }) {
    const data = values.map((value, index) => ({
        month: MONTHS[index],
        value,
    }));

    return (
        <section className="profit-chart-card" aria-label={`${title} em ${year}`}>
            <h3>{title}</h3>
            <div className="profit-chart-scroll">
                <ChartContainer
                    config={{ value: { label: title, color: '#5379f5' } }}
                    className="profit-chart"
                >
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => numberFormatter.format(value)}
                            width={52}
                        />
                        <ChartTooltip
                            cursor={false}
                            valueFormatter={(value) => currencyFormatter.format(Number(value))}
                        />
                        <Line
                            dataKey="value"
                            type="monotone"
                            stroke="var(--color-value)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--color-value)', r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ChartContainer>
            </div>
        </section>
    );
}

function ProfitPoint() {
    const [orders, setOrders] = useState([]);
    const [costs, setCosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isActive = true;

        async function loadFinancialData() {
            setIsLoading(true);
            setError('');

            try {
                const [ordersData, costsData] = await Promise.all([getOrders(), getCosts()]);
                validateData(ordersData, costsData);

                if (isActive) {
                    setOrders(ordersData);
                    setCosts(costsData);
                }
            } catch (loadError) {
                if (isActive) {
                    setError(loadError.message || 'Não foi possível carregar os dados financeiros.');
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadFinancialData();

        return () => {
            isActive = false;
        };
    }, [reloadKey]);

    const year = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const monthlyMetrics = useMemo(() => {
        const months = Array.from({ length: 12 }, () => ({
            revenue: 0,
            cmv: 0,
            fixedCosts: 0,
            variableCosts: 0,
        }));

        orders.forEach((order) => {
            if (order.status !== 'Paga' && order.status !== 'Fechada') return;

            const date = getDateParts(order.order_date);
            if (!date || date.year !== year || date.month < 0 || date.month > 11) return;
            months[date.month].revenue += Number(order.total_value);
        });

        costs.forEach((cost) => {
            const date = getDateParts(cost.date);
            if (!date || date.year !== year || date.month < 0 || date.month > 11) return;

            const amount = Number(cost.amount);
            if (cost.costCategory === INGREDIENTS_CATEGORY) {
                months[date.month].cmv += amount;
            } else if (cost.costType === 'Fixo') {
                months[date.month].fixedCosts += amount;
            } else if (cost.costType === 'Variavel') {
                months[date.month].variableCosts += amount;
            }
        });

        return months.map((month) => ({
            ...month,
            expenses: month.fixedCosts + month.variableCosts,
            profit: month.revenue - month.cmv - month.fixedCosts - month.variableCosts,
        }));
    }, [orders, costs, year]);

    const currentMetrics = monthlyMetrics[currentMonth];
    const hasCurrentYearData = monthlyMetrics.some((month) =>
        month.revenue !== 0 || month.cmv !== 0 || month.expenses !== 0,
    );

    const projections = [
        {
            scenario: 'Base atual',
            revenue: currentMetrics.revenue,
            cmv: currentMetrics.cmv,
            expenses: currentMetrics.expenses,
        },
        {
            scenario: 'Aumento de 10% nas vendas',
            revenue: currentMetrics.revenue * 1.1,
            cmv: currentMetrics.cmv * 1.1,
            expenses: currentMetrics.expenses,
        },
        {
            scenario: 'Redução de 5% nos custos fixos',
            revenue: currentMetrics.revenue,
            cmv: currentMetrics.cmv,
            expenses: currentMetrics.fixedCosts * 0.95 + currentMetrics.variableCosts,
        },
        {
            scenario: 'Aumento de 8% no CMV',
            revenue: currentMetrics.revenue,
            cmv: currentMetrics.cmv * 1.08,
            expenses: currentMetrics.expenses,
        },
    ].map((projection) => {
        const profit = projection.revenue - projection.cmv - projection.expenses;
        return {
            ...projection,
            profit,
            margin: projection.revenue === 0 ? 0 : profit / projection.revenue * 100,
        };
    });

    if (isLoading) {
        return <section className="profit-message" role="status">Carregando dados financeiros...</section>;
    }

    if (error) {
        return (
            <section className="profit-message profit-message-error" role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                    Tentar novamente
                </button>
            </section>
        );
    }

    return (
        <section className="profit-point">
            {!hasCurrentYearData && (
                <p className="profit-empty-notice">
                    Ainda não há pedidos finalizados ou custos registrados em {year}.
                </p>
            )}

            <div className="profit-charts">
                <ProfitChart
                    title="Evolução do Lucro Líquido ao Longo dos Meses"
                    values={monthlyMetrics.map((month) => month.profit)}
                    year={year}
                />
                <ProfitChart
                    title="Faturamento"
                    values={monthlyMetrics.map((month) => month.revenue)}
                    year={year}
                />
            </div>

            <div className="profit-summary">
                <article className="profit-summary-card">
                    <h3>Lucro do período</h3>
                    <p>{currencyFormatter.format(currentMetrics.profit)}</p>
                    <span>{MONTHS[currentMonth]} de {year}</span>
                </article>
                <article className="profit-summary-card">
                    <h3>Faturamento bruto</h3>
                    <p>{currencyFormatter.format(currentMetrics.revenue)}</p>
                    <span>Pedidos fechados ou pagos</span>
                </article>
                <article className="profit-summary-card">
                    <h3>Margem de lucro</h3>
                    <p>{currentMetrics.revenue === 0 ? '0%' : `${(currentMetrics.profit / currentMetrics.revenue * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}</p>
                    <span>Lucro ÷ faturamento</span>
                </article>
            </div>

            <section className="profit-projections">
                <h3>Projeções de Lucro</h3>
                <p className="profit-projections-caption">
                    Cenários calculados individualmente com base nos valores de {MONTHS[currentMonth]}.
                </p>
                <div className="profit-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Cenário</th>
                                <th>Vendas</th>
                                <th>CMV</th>
                                <th>Custos fixos e variáveis</th>
                                <th>Lucro</th>
                                <th>Margem (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projections.map((projection) => (
                                <tr key={projection.scenario}>
                                    <td>{projection.scenario}</td>
                                    <td>{currencyFormatter.format(projection.revenue)}</td>
                                    <td>{currencyFormatter.format(projection.cmv)}</td>
                                    <td>{currencyFormatter.format(projection.expenses)}</td>
                                    <td>{currencyFormatter.format(projection.profit)}</td>
                                    <td>{projection.margin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="profit-calculation-note">
                    Lucro = faturamento - CMV - custos fixos e variáveis. O CMV considera custos da categoria Insumos/Ingredientes.
                </p>
            </section>
        </section>
    );
}

export default ProfitPoint;
