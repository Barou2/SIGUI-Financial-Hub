import { useState } from 'react'
import { formatCurrency, convertToBase, PARTNER_COLORS } from '../lib/utils'

function EditableTarget({ value, baseCurrency, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function handleSave() {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed) && parsed > 0) onSave(parsed)
    setEditing(false)
  }

  return editing ? (
    <div className="flex items-center gap-2 mt-1">
      <input
        type="number"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        className="w-36 px-2 py-1 border-2 border-[#8B1A2B] rounded-lg text-sm font-bold text-[#8B1A2B] outline-none"
        autoFocus
      />
      <button onClick={handleSave}
        className="px-3 py-1 bg-[#8B1A2B] text-white text-xs font-bold rounded-lg">
        Save
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-2xl font-black text-[#6D28D9]">
        {formatCurrency(value, baseCurrency)}
      </span>
      <button onClick={() => { setDraft(value); setEditing(true) }}
        className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold hover:bg-purple-200 transition-all">
        Edit
      </button>
    </div>
  )
}

export default function StatCards({
  payments, expenses, baseCurrency, startupTarget, onUpdateTarget
}) {
  const totalInvested = payments.reduce((acc, p) =>
    acc + convertToBase(p.amount, p.currency, baseCurrency, p.rate), 0)

  const totalExpenses = expenses.reduce((acc, e) =>
    acc + convertToBase(e.amount, e.currency, baseCurrency, e.rate), 0)

  const netBalance = totalInvested - totalExpenses
  const goalPct    = startupTarget > 0
    ? Math.min(100, Math.round((netBalance / startupTarget) * 100))
    : 0

  const partnerTotals = { Hamid: 0, barou: 0, Sana: 0 }
  payments.forEach(p => {
    if (partnerTotals[p.investor] !== undefined)
      partnerTotals[p.investor] += convertToBase(p.amount, p.currency, baseCurrency, p.rate)
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {/* Net Balance */}
      <div className="bg-white rounded-2xl border border-[#F0E8E6] p-5 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-widest text-[#9B7B7E]">Net Cash Balance</div>
        <div className="text-2xl font-black text-[#8B1A2B] mt-2">
          {formatCurrency(netBalance, baseCurrency)}
        </div>
        <div className="text-[11px] text-[#B09090] mt-1">Actual business treasury</div>
      </div>

      {/* Total Invested */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Total Invested</div>
        <div className="text-2xl font-black text-emerald-600 mt-2">
          {formatCurrency(totalInvested, baseCurrency)}
        </div>
        <div className="mt-3 space-y-1.5">
          {Object.entries(partnerTotals).map(([name, val]) => (
            <div key={name} className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ background: PARTNER_COLORS[name] }}></span>
                {name}
              </span>
              <span className="font-bold text-slate-800">{formatCurrency(val, baseCurrency)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-widest text-rose-700">Total Expenses</div>
        <div className="text-2xl font-black text-rose-600 mt-2">
          {formatCurrency(totalExpenses, baseCurrency)}
        </div>
        <div className="text-[11px] text-rose-400 mt-1">Operational costs paid</div>
      </div>

      {/* Startup Capital Target */}
      <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-purple-700">Startup Capital Target</div>
          <span className="text-xs font-black text-[#8B1A2B]">{goalPct}%</span>
        </div>
        <EditableTarget
          value={startupTarget}
          baseCurrency={baseCurrency}
          onSave={onUpdateTarget}
        />
        <div className="mt-3 h-2 bg-purple-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${goalPct}%`, background: 'linear-gradient(to right, #8B1A2B, #C9A84C)' }}
          />
        </div>
      </div>

    </div>
  )
}