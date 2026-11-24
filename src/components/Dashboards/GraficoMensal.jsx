import { dateIntoMonthString } from '../Functions/Functions';// 👈 Adicione esta linha no topo!
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function GraficoMensal({
  dados = [],
  titulo = 'Evolução Mensal',
  unidade = 'Unidade XYZ',
  labelSerie = 'Valor',
  cor = '#3b82f6',
  isMoeda = true,
  altura = 'h-[300px]',
}) {
  const chartConfig = {
    valor: {
      label: labelSerie,
      color: cor,
    },
  };

  const hoje = new Date();
  const mesAtualFormatado = dateIntoMonthString(hoje, 'long');

  const formatarValor = (val) => {
    if (!isMoeda) return `${val}`;
    return Number(val).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{titulo}</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className={`${altura} w-full`}>
          <BarChart
            accessibilityLayer
            data={dados}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => (isMoeda ? `R$ ${value}` : value)}
            />

            <ChartTooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatarValor(value)}
                />
              }
            />

            <Bar
              dataKey="valor"
              fill="var(--color-valor)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}