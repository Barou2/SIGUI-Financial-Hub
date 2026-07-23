import { useState, useEffect } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatCurrency, convertToBase } from '../lib/utils'
import { supabase } from '../lib/supabase'

function EditableField({ value, onSave, prefix = '', suffix = '', type = 'number', valueClassName = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function handleSave() {
    if (type === 'number') {
      const parsed = parseFloat(draft)
      if (!isNaN(parsed) && parsed > 0) onSave(parsed)
    } else {
      if (draft.trim()) onSave(draft.trim())
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        {prefix && <span className="text-[#9B7B7E] font-bold text-sm">{prefix}</span>}
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="px-3 py-1.5 border-2 border-[#8B1A2B] rounded-xl text-sm font-bold text-[#8B1A2B] outline-none w-48"
        />
        {suffix && <span className="text-[#9B7B7E] font-bold text-sm">{suffix}</span>}
        <button onClick={handleSave}
          className="px-3 py-1.5 bg-[#8B1A2B] text-white text-xs font-bold rounded-lg">
          Save
        </button>
        <button onClick={() => setEditing(false)}
          className="px-3 py-1.5 bg-[#F0E8E6] text-[#9B7B7E] text-xs font-bold rounded-lg">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => { setDraft(value); setEditing(true) }}
      className="flex items-center gap-2 group">
      <span className="text-[#9B7B7E] font-bold text-sm">{prefix}</span>
      <span className={`border-b-2 border-dashed border-[#C9A84C] text-[#1A0A0D] font-black group-hover:border-[#8B1A2B] transition-all ${valueClassName}`}>
        {value}
      </span>
      <span className="text-[#9B7B7E] font-bold text-sm">{suffix}</span>
      <span className="text-[10px] px-2 py-0.5 bg-[#F2D4D0] text-[#8B1A2B] rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all">
        click to edit
      </span>
    </button>
  )
}

export default function GoalsTab({
  payments, expenses, baseCurrency,
  startupTarget, onUpdateTarget
}) {
  const [goalName, setGoalName] = useState('Launch Production Run')
  const [targetMonths, setTargetMonths] = useState(24)

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['goal_name', 'target_months'])
      data?.forEach(row => {
        if (row.key === 'goal_name') setGoalName(row.value)
        if (row.key === 'target_months') setTargetMonths(parseFloat(row.value))
      })
    }
    loadSettings()
  }, [])

  async function handleGoalNameSave(name) {
    setGoalName(name)
    await supabase.from('settings').upsert({ key: 'goal_name', value: name }, { onConflict: 'key' })
  }

  async function handleTargetMonthsSave(months) {
    setTargetMonths(months)
    await supabase.from('settings').upsert({ key: 'target_months', value: String(months) }, { onConflict: 'key' })
  }

  // Net balance from treasury
  const totalInvested = payments.reduce((acc, p) =>
    acc + convertToBase(p.amount, p.currency, baseCurrency, p.rate), 0)
  const totalExpenses = expenses.reduce((acc, e) =>
    acc + convertToBase(e.amount, e.currency, baseCurrency, e.rate), 0)
  const netBalance = totalInvested - totalExpenses

  // Progress
  const pct = startupTarget > 0
    ? Math.min(100, Math.round((netBalance / startupTarget) * 100))
    : 0
  const gap = Math.max(0, startupTarget - netBalance)

  // Growth rate — average monthly based on payments
  function getMonthlyGrowthRate() {
    if (payments.length === 0) return 0
    const sorted = [...payments].sort((a, b) => new Date(a.date) - new Date(b.date))
    const first = new Date(sorted[0].date)
    const last = new Date(sorted[sorted.length - 1].date)
    const months = Math.max(1, (last - first) / (1000 * 60 * 60 * 24 * 30))
    return totalInvested / months
  }
  const monthlyRate = getMonthlyGrowthRate()
  const monthsToGoal = monthlyRate > 0 ? Math.ceil(gap / monthlyRate) : null

  // Chart data — cumulative net over time
  const events = []
  payments.forEach(p => events.push({
    date: p.date, type: 'in',
    amt: convertToBase(p.amount, p.currency, baseCurrency, p.rate)
  }))
  expenses.forEach(e => events.push({
    date: e.date, type: 'out',
    amt: convertToBase(e.amount, e.currency, baseCurrency, e.rate)
  }))
  events.sort((a, b) => new Date(a.date) - new Date(b.date))

  let running = 0
  const chartData = [{ label: 'Start', net: 0, target: startupTarget }]
  events.forEach(ev => {
    running += ev.type === 'in' ? ev.amt : -ev.amt
    const d = ev.date.split('-')
    chartData.push({
      label: `${d[2]}/${d[1]}/${d[0]}`,
      net: Math.round(running),
      target: startupTarget
    })
  })

  // Radial chart data
  const radialData = [{ name: 'Progress', value: pct, fill: '#8B1A2B' }]

  function formatTick(v) {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
    if (v >= 1000) return (v / 1000).toFixed(0) + 'k'
    return v
  }

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-[#F0E8E6] rounded-xl shadow-lg p-3 text-xs">
        <div className="font-black text-[#1A0A0D] mb-2">{label}</div>
        {payload.map(entry => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }}></span>
            <span className="text-[#9B7B7E]">{entry.name}:</span>
            <span className="font-black" style={{ color: entry.color }}>
              {formatCurrency(entry.value, baseCurrency)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Goal Header Card */}
      <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
        <div style={{ background: 'linear-gradient(135deg, #6B1220, #8B1A2B)' }}
          className="px-6 py-5">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#F2D4D0] mb-2">
            Startup Capital Goal
          </div>
          <EditableField
            value={goalName}
            onSave={handleGoalNameSave}
            type="text"
          />
          <div className="mt-4 flex flex-wrap gap-6 items-end">
            <div>
              <div className="text-[10px] text-[#F2D4D0] font-bold uppercase tracking-wider mb-1">Target Amount</div>
              <EditableField
                value={startupTarget}
                onSave={onUpdateTarget}
                suffix="XOF"
              />
            </div>
            <div>
              <div className="text-[10px] text-[#F2D4D0] font-bold uppercase tracking-wider mb-1">Current Net</div>
              <div className="font-black text-white text-lg">{formatCurrency(netBalance, baseCurrency)}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#F2D4D0] font-bold uppercase tracking-wider mb-1">Still Needed</div>
              <div className="font-black text-[#C9A84C] text-lg">{formatCurrency(gap, baseCurrency)}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#9B7B7E]">Progress toward goal</span>
            <span className="text-sm font-black text-[#8B1A2B]">{pct}%</span>
          </div>
          <div className="h-4 bg-[#F0E8E6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(to right, #8B1A2B, #C9A84C)'
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#C4A0A0]">0</span>
            <span className="text-[10px] text-[#C4A0A0]">{formatCurrency(startupTarget, baseCurrency)}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl border border-[#F0E8E6] p-5 shadow-sm text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9B7B7E] mb-2">Goal Reached</div>
          <div className="text-5xl font-black text-[#8B1A2B]">{pct}%</div>
          <div className="text-xs text-[#C4A0A0] mt-1">of startup target</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E8E6] p-5 shadow-sm text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9B7B7E] mb-2">Avg Monthly Inflow</div>
          <div className="text-2xl font-black text-emerald-600">
            {monthlyRate > 0 ? formatCurrency(monthlyRate, baseCurrency) : '—'}
          </div>
          <div className="text-xs text-[#C4A0A0] mt-1">based on contribution history</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E8E6] p-5 shadow-sm text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9B7B7E] mb-2">Est. Time to Goal</div>
          <EditableField
            value={targetMonths}
            onSave={handleTargetMonthsSave}
            suffix="months"
            valueClassName="text-5xl"
          />
          <div className="text-xs text-[#C4A0A0] mt-1">
            {monthsToGoal !== null ? `auto: ${monthsToGoal} months at current pace` : 'set your target timeline'}
          </div>
        </div>

      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5ECEB]"
          style={{ background: 'linear-gradient(to right, #FAF6F5, white)' }}>
          <div className="font-black text-[#1A0A0D] text-sm">Progress Chart</div>
          <div className="text-[11px] text-[#9B7B7E] mt-0.5">
            Your net treasury vs the goal over time
          </div>
        </div>
        <div className="p-4" style={{ height: 300 }}>
          {chartData.length <= 1 ? (
            <div className="h-full flex items-center justify-center text-[#C4A0A0] text-sm font-medium">
              Add treasury entries to see progress chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5ECEB" />
                <XAxis dataKey="label"
                  tick={{ fontSize: 10, fill: '#9B7B7E', fontWeight: 600 }}
                  tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={formatTick}
                  tick={{ fontSize: 10, fill: '#9B7B7E', fontWeight: 600 }}
                  tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net" name="Net Balance"
                  stroke="#8B1A2B" strokeWidth={3}
                  dot={{ fill: '#8B1A2B', r: 4 }}
                  activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" name="Goal"
                  stroke="#C9A84C" strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  )
}