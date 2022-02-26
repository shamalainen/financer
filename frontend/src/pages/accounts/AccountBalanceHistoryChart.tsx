import { useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import { MONTH_IN_MS } from '../../constants/months';
import { useTransactionsByAccountId } from '../../hooks/transaction/useTransactionsByAccountId';
import {
  formatCurrency,
  formatCurrencyAbbreviation,
} from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface IChartData {
  dateStr: string;
  date: Date;
  balance: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>): JSX.Element => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-2 bg-gray-800 shadow-lg">
        <p className="text-white">
          Balance {formatCurrency(payload[0].value as number)}
        </p>
        <p className="text-white">{label}</p>
      </div>
    );
  }

  return <div />;
};

interface IAccountBalanceHistoryChartProps {
  accountId: IAccount['_id'];
}

export const AccountBalanceHistoryChart = ({
  accountId,
}: IAccountBalanceHistoryChartProps): JSX.Element => {
  const [chartData, setChartData] = useState<IChartData[]>([]);
  const [transactions] = useTransactionsByAccountId(accountId);

  useEffect(() => {
    if (!transactions) return;

    setChartData(
      transactions
        .map(
          ({
            toAccount,
            toAccountBalance = 0,
            fromAccountBalance = 0,
            date,
            amount,
          }) => ({
            dateStr: formatDate(new Date(date)),
            date: new Date(date),
            balance:
              toAccount === accountId
                ? toAccountBalance + amount
                : fromAccountBalance - amount,
          })
        )
        .sort(
          ({ date: dateA }, { date: dateB }) =>
            dateA.getTime() - dateB.getTime()
        )
    );
  }, [transactions, accountId]);

  const monthAgoDate = new Date().getTime() - MONTH_IN_MS;
  const monthAgoIndex = chartData.indexOf(
    chartData.find((tick) => tick.date.getTime() > monthAgoDate) || chartData[0]
  );

  return (
    <div className="bg-white border rounded-lg min-h-[450px] h-[33vh] md:h-auto md:min-h-0 md:aspect-video pl-2 py-6 pr-6">
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c64f2" stopOpacity={0.4} />
              <stop offset="75%" stopColor="#1c64f2" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Tooltip content={CustomTooltip} isAnimationActive={false} />
          <YAxis
            dataKey="balance"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: '14px' }}
            tickFormatter={(tick) => {
              return formatCurrencyAbbreviation(tick);
            }}
            type="number"
            width={75}
          />
          <XAxis
            dataKey="dateStr"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: '14px' }}
            tickMargin={10}
            height={40}
          />
          <Area
            dataKey="balance"
            stroke="#1c64f2"
            fill="url(#color)"
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Brush dataKey="dateStr" stroke="#1c64f2" startIndex={monthAgoIndex}>
            <AreaChart>
              <CartesianGrid />
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Area dataKey="balance" stroke="#1c64f2" fill="#1c64f2" />
            </AreaChart>
          </Brush>
          <CartesianGrid vertical={false} opacity={0.25} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
