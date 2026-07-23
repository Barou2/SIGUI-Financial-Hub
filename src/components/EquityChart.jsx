import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PARTNERS, convertToBase, formatCurrency } from '../lib/utils'

const COLORS = ['#059669', '#8B1A2B', '#C9A84C']

export default function EquityChart({ payments, baseCurrency }) {

  const totals = PARTNERS.map(partner =>
    payments
      .filter(p => p.investor === partner)
      .reduce((acc, p) => acc + convertToBase(p.amount, p.currency, baseCurrency, p.rate), 0)
  )
  const grandTotal = totals.reduce((acc, t) => acc + t, 0)
  const data = PARTNERS.map((partner, i) => ({ name: partner, value: totals[i] }))

  function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    const entry = payload[0]
    const pct = grandTotal > 0 ? Math.round((entry.value / grandTotal) * 100) : 0
    return (
      <div className="bg-white border border-[#F0E8E6] rounded-xl shadow-lg p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.payload.fill }}></span>
          <span className="font-black text-[#1A0A0D]">{entry.name}</span>
        </div>
        <div className="font-black mt-1" style={{ color: entry.payload.fill }}>
          {formatCurrency(entry.value, baseCurrency)} &bull; {pct}%
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F5ECEB]"
        style={{ background: 'linear-gradient(to right, #FAF6F5, white)' }}>
        <div className="font-black text-[#1A0A0D] text-sm">Equity Split</div>
        <div className="text-[11px] text-[#9B7B7E] mt-0.5">
          Capital contributed per partner
        </div>
      </div>
      <div className="p-4" style={{ height: 280 }}>
        {grandTotal <= 0 ? (
          <div className="h-full flex items-center justify-center text-[#C4A0A0] text-sm font-medium">
            Add capital entries to see the equity split
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name"
                innerRadius={50} outerRadius={80}
                paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="px-5 pb-5 space-y-2">
        {data.map((entry, i) => {
          const pct = grandTotal > 0 ? Math.round((entry.value / grandTotal) * 100) : 0
          return (
            <div key={entry.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                <span className="font-bold text-[#4A3035]">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[#1A0A0D]">{formatCurrency(entry.value, baseCurrency)}</span>
                <span className="text-[#9B7B7E] font-medium">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
