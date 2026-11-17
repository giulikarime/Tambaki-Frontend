import { createContext, useContext, useId } from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';

const ChartContext = createContext(null);

export function ChartContainer({ config, className = '', children, ...props }) {
    const generatedId = useId().replaceAll(':', '');
    const style = Object.entries(config).reduce((variables, [key, item]) => ({
        ...variables,
        [`--color-${key}`]: item.color,
    }), {});

    return (
        <ChartContext.Provider value={config}>
            <div
                {...props}
                data-slot="chart"
                data-chart={generatedId}
                className={`ui-chart-container ${className}`}
                style={style}
            >
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    );
}

function ChartTooltipContent({ active, payload, label, valueFormatter }) {
    const config = useContext(ChartContext);

    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="ui-chart-tooltip">
            <p className="ui-chart-tooltip-label">{label}</p>
            {payload.map((entry) => {
                const item = config[entry.dataKey];
                return (
                    <div className="ui-chart-tooltip-row" key={entry.dataKey}>
                        <span
                            className="ui-chart-tooltip-indicator"
                            style={{ backgroundColor: item?.color || entry.color }}
                        />
                        <span>{item?.label || entry.name || entry.dataKey}</span>
                        <strong>
                            {valueFormatter ? valueFormatter(entry.value) : entry.value}
                        </strong>
                    </div>
                );
            })}
        </div>
    );
}

export function ChartTooltip({ valueFormatter, ...props }) {
    return (
        <Tooltip
            {...props}
            content={(tooltipProps) => (
                <ChartTooltipContent {...tooltipProps} valueFormatter={valueFormatter} />
            )}
        />
    );
}
