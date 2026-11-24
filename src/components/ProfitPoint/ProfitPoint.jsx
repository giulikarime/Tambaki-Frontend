import '../CMV/cmv.css';

function ProfitPoint(){
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const grossRevenue = [16000,14500,15000,10500,5500,10500,14500,14800,15000,14800,14900,15000];
    const billing = [14500,13200,13800,9800,5200,9800,13200,13600,13800,13700,13900,14000];
    const rows = [
        { scenario: 'Base Atual', revenue: 'R$ 100.000', cmv: 'R$ 25.000', fixed: 'R$ 25.000', grossProfit: 'R$ 50.000', margin: '50%' },
        { scenario: 'Aumento de 10% nas Vendas', revenue: 'R$ 110.000', cmv: 'R$ 28.500', fixed: 'R$ 25.000', grossProfit: 'R$ 56.500', margin: '51%' },
        { scenario: 'Redução de 15% nos Custos Fixos', revenue: 'R$ 100.000', cmv: 'R$ 25.000', fixed: 'R$ 21.250', grossProfit: 'R$ 53.750', margin: '54%' },
        { scenario: 'Aumento de 8% no CMV', revenue: 'R$ 100.000', cmv: 'R$ 27.000', fixed: 'R$ 25.000', grossProfit: 'R$ 48.000', margin: '48%' },
    ];

    function LineChart({ values, title }) {
        const width = 440;
        const height = 180;
        const padding = { top: 16, right: 16, bottom: 28, left: 48 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const points = values.map((value, index) => {
            const x = padding.left + (index * chartWidth) / (values.length - 1);
            const y = padding.top + ((20000 - value) * chartHeight) / 20000;
            return [x, y];
        });

        return (
            <section className="dashboard-chart-card">
                <h3>{title}</h3>
                <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
                    {[0,5000,10000,15000,20000].map((tick) => {
                        const y = padding.top + ((20000 - tick) * chartHeight) / 20000;
                        return (
                            <g key={tick}>
                                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="chart-grid" />
                                <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-label">{tick === 0 ? '0' : `${tick / 1000},000`}</text>
                            </g>
                        );
                    })}
                    {months.map((month, index) => {
                        const x = padding.left + (index * chartWidth) / (months.length - 1);
                        return <text key={month} x={x} y={height - 7} textAnchor="middle" className="chart-month">{month}</text>;
                    })}
                    <polyline points={points.map(point => point.join(',')).join(' ')} fill="none" className="chart-line" />
                    {points.map(([x,y], index) => <circle key={index} cx={x} cy={y} r="3" className="chart-dot" />)}
                </svg>
            </section>
        );
    }

    return (
        <div className="financial-dashboard">
            <div className="dashboard-charts">
                <LineChart values={grossRevenue} title="Evolução do Lucro Líquido ao Longo dos Meses" />
                <LineChart values={billing} title="Faturamento" />
            </div>
            <div className="dashboard-summary">
                <section className="summary-card"><h3>Lucro Bruto</h3><strong>12,5k</strong></section>
                <section className="summary-card"><h3>Faturamento Bruto</h3><strong>13,1k</strong></section>
                <section className="summary-card"><h3>Margem Bruta</h3><strong><span>24 %</span><span className="trend-up">↑</span></strong></section>
            </div>
            <section className="projection-card">
                <div className="projection-heading">
                    <h3>Projeções de Lucro</h3>
                    <p>Projeções de Lucros com Diferentes Cenários</p>
                </div>
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>Cenário</th><th>Vendas</th><th>CMV</th><th>Custos</th><th>Lucro</th><th>Margem (%)</th></tr></thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.scenario}>
                                    <td>{row.scenario}</td><td>{row.revenue}</td><td>{row.cmv}</td><td>{row.fixed}</td><td>{row.grossProfit}</td><td>{row.margin}</td>
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