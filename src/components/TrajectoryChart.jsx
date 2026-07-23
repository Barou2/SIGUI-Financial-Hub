import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { convertToBase, formatCurrency, formatDate } from '../lib/utils'

export default function TrajectoryChart({ payments, expenses, baseCurrency }) {

  // Build combined timeline
  const events = []
  payments.forEach(p => events.push({
    date: p.date, type: 'capital',
    amount: convertToBase(p.amount, p.currency, baseCurrency, p.rate)
  }))
  expenses.forEach(e => events.push({
    date: e.date, type: 'expense',
    amount: convertToBase(e.amount, e.currency, baseCurrency, e.rate)
  }))
  events.sort((a, b) => new Date(a.date) - new Date(b.date))

  let capCum = 0, expCum = 0
  const data = [{ label: 'Start', capital: 0, expenses: 0 }]
  events.forEach(ev => {
    if (ev.type === 'capital') capCum += ev.amount
    else expCum += ev.amount
    data.push({
      label: formatDate(ev.date),
      capital: Math.round(capCum),
      expenses: Math.round(expCum)
    })
  })

  function formatTick(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k'
    return value
  }

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-[#F0E8E6] rounded-xl shadow-lg p-3 text-xs">
        <div className="font-black text-[#1A0A0D] mb-2">{label}</div>
        {payload.map(entry => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }}></span>
            <span className="text-[#9B7B7E] font-medium capitalize">{entry.name}:</span>
            <span className="font-black" style={{ color: entry.color }}>
              {formatCurrency(entry.value, baseCurrency)}
            </span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-[#F0E8E6] flex justify-between">
          <span className="text-[#9B7B7E]">Net:</span>
          <span className="font-black text-[#8B1A2B]">
            {formatCurrency((payload[0]?.value || 0) - (payload[1]?.value || 0), baseCurrency)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F5ECEB]"
        style={{ background: 'linear-gradient(to right, #FAF6F5, white)' }}>
        <div className="font-black text-[#1A0A0D] text-sm">Net Trajectory</div>
        <div className="text-[11px] text-[#9B7B7E] mt-0.5">
          Capital invested vs expenses over time — the gap is your remaining cash
        </div>
      </div>
      <div className="p-4" style={{ height: 280 }}>
        {data.length <= 1 ? (
          <div className="h-full flex items-center justify-center text-[#C4A0A0] text-sm font-medium">
            Add entries to see the trajectory chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5ECEB" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9B7B7E', fontWeight: 600 }}
                tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={formatTick} tick={{ fontSize: 10, fill: '#9B7B7E', fontWeight: 600 }}
                tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={val => <span style={{ fontSize: 11, fontWeight: 700, color: '#4A3035', textTransform: 'capitalize' }}>{val}</span>}
              />
              <Line type="monotone" dataKey="capital" name="Capital"
                stroke="#059669" strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#059669' }} />
              <Line type="monotone" dataKey="expenses" name="Expenses"
                stroke="#8B1A2B" strokeWidth={2.5}
                dot={{ fill: '#8B1A2B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8B1A2B' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}