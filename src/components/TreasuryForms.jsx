import { useState } from 'react'
import { PARTNERS } from '../lib/utils'

const today = new Date().toISOString().split('T')[0]

function FormField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-700 text-[#9B7B7E] uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "w-full px-3 py-2.5 bg-[#FAF6F5] border-2 border-[#E8D8D5] rounded-xl text-sm font-semibold text-[#1A0A0D] outline-none focus:border-[#8B1A2B] focus:bg-white transition-all"
const selectClass = "w-full px-3 py-2.5 bg-[#FAF6F5] border-2 border-[#E8D8D5] rounded-xl text-sm font-semibold text-[#1A0A0D] outline-none focus:border-[#8B1A2B] cursor-pointer"

export default function TreasuryForms({ onAddPayment, onAddExpense }) {
  const [contrib, setContrib] = useState({
    investor: 'Hamid', date: today, amount: '', currency: 'XOF', rate: '', notes: ''
  })
  const [expense, setExpense] = useState({
    title: '', date: today, amount: '', currency: 'XOF', rate: '', notes: ''
  })
  const [loading, setLoading] = useState({ contrib: false, expense: false })

  async function handleContrib(e) {
    e.preventDefault()
    if (!contrib.amount || parseFloat(contrib.amount) <= 0) return
    setLoading(l => ({ ...l, contrib: true }))
    await onAddPayment({
      investor: contrib.investor,
      date:     contrib.date,
      amount:   parseFloat(contrib.amount),
      currency: contrib.currency,
      rate:     contrib.rate ? parseFloat(contrib.rate) : null,
      notes:    contrib.notes
    })
    setContrib(c => ({ ...c, amount: '', rate: '', notes: '' }))
    setLoading(l => ({ ...l, contrib: false }))
  }

  async function handleExpense(e) {
    e.preventDefault()
    if (!expense.title || !expense.amount || parseFloat(expense.amount) <= 0) return
    setLoading(l => ({ ...l, expense: true }))
    await onAddExpense({
      title:    expense.title,
      date:     expense.date,
      amount:   parseFloat(expense.amount),
      currency: expense.currency,
      rate:     expense.rate ? parseFloat(expense.rate) : null,
      notes:    expense.notes
    })
    setExpense(ex => ({ ...ex, title: '', amount: '', rate: '', notes: '' }))
    setLoading(l => ({ ...l, expense: false }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Capital Form */}
      <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5ECEB] flex items-center gap-3"
          style={{ background: 'linear-gradient(to right, #F0FAF5, white)' }}>
          <div className="p-2 bg-emerald-100 rounded-xl">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-[#1A0A0D] text-sm">Capital Contribution</div>
            <div className="text-[11px] text-[#9B7B7E]">Cash injected into SIGUI account</div>
          </div>
        </div>
        <form onSubmit={handleContrib} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Partner">
              <select className={selectClass} value={contrib.investor}
                onChange={e => setContrib(c => ({ ...c, investor: e.target.value }))}>
                {PARTNERS.map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Date">
              <input type="date" className={inputClass} value={contrib.date}
                onChange={e => setContrib(c => ({ ...c, date: e.target.value }))} required />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FormField label="Amount">
                <input type="number" className={inputClass} style={{ color: '#059669' }}
                  placeholder="e.g. 500000" value={contrib.amount}
                  onChange={e => setContrib(c => ({ ...c, amount: e.target.value }))} required />
              </FormField>
            </div>
            <FormField label="Currency">
              <select className={selectClass} value={contrib.currency}
                onChange={e => setContrib(c => ({ ...c, currency: e.target.value }))}>
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Exchange Rate (optional)">
              <input type="number" step="any" className={inputClass} placeholder="Default auto"
                value={contrib.rate}
                onChange={e => setContrib(c => ({ ...c, rate: e.target.value }))} />
            </FormField>
            <FormField label="Reference Notes">
              <input type="text" className={inputClass} placeholder="e.g. Wire transfer"
                value={contrib.notes}
                onChange={e => setContrib(c => ({ ...c, notes: e.target.value }))} />
            </FormField>
          </div>
          <button type="submit" disabled={loading.contrib}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all">
            {loading.contrib ? 'Saving...' : '+ Add Capital Entry'}
          </button>
        </form>
      </div>

      {/* Expense Form */}
      <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5ECEB] flex items-center gap-3"
          style={{ background: 'linear-gradient(to right, #FEF5F4, white)' }}>
          <div className="p-2 bg-rose-100 rounded-xl">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-[#1A0A0D] text-sm">Company Expense</div>
            <div className="text-[11px] text-[#9B7B7E]">Deduct from SIGUI treasury</div>
          </div>
        </div>
        <form onSubmit={handleExpense} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Description">
              <input type="text" className={inputClass} placeholder="e.g. Office rent"
                value={expense.title}
                onChange={e => setExpense(ex => ({ ...ex, title: e.target.value }))} required />
            </FormField>
            <FormField label="Date">
              <input type="date" className={inputClass} value={expense.date}
                onChange={e => setExpense(ex => ({ ...ex, date: e.target.value }))} required />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FormField label="Amount">
                <input type="number" className={inputClass} style={{ color: '#DC2626' }}
                  placeholder="e.g. 150000" value={expense.amount}
                  onChange={e => setExpense(ex => ({ ...ex, amount: e.target.value }))} required />
              </FormField>
            </div>
            <FormField label="Currency">
              <select className={selectClass} value={expense.currency}
                onChange={e => setExpense(ex => ({ ...ex, currency: e.target.value }))}>
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Exchange Rate (optional)">
              <input type="number" step="any" className={inputClass} placeholder="Default auto"
                value={expense.rate}
                onChange={e => setExpense(ex => ({ ...ex, rate: e.target.value }))} />
            </FormField>
            <FormField label="Paid By / Reference">
              <input type="text" className={inputClass} placeholder="e.g. Notary receipt"
                value={expense.notes}
                onChange={e => setExpense(ex => ({ ...ex, notes: e.target.value }))} />
            </FormField>
          </div>
          <button type="submit" disabled={loading.expense}
            className="w-full py-3 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            style={{ background: loading.expense ? '#9B7B7E' : '#8B1A2B' }}>
            {loading.expense ? 'Saving...' : '− Add Expense Entry'}
          </button>
        </form>
      </div>

    </div>
  )
}