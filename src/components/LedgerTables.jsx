import { formatCurrency, formatDate, convertToBase } from '../lib/utils'

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold text-xs px-2 py-1 rounded-lg transition-all">
      ✕
    </button>
  )
}

function EmptyRow({ message }) {
  return (
    <tr>
      <td colSpan={5} className="px-5 py-10 text-center text-[#C4A0A0] text-xs font-medium">
        {message}
      </td>
    </tr>
  )
}

function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#9B7B7E] bg-[#FAF6F5] border-b border-[#F0E8E6] text-left">
      {children}
    </th>
  )
}

export default function LedgerTables({
  payments, expenses, baseCurrency,
  onDeletePayment, onDeleteExpense
}) {
  function downloadCSV(type) {
    const lines = []
    if (type === 'capital') {
      lines.push('SIGUI Capital Registry')
      lines.push('Investor,Date,Amount,Currency,Base Value,Notes')
      payments.forEach(p => {
        const base = convertToBase(p.amount, p.currency, baseCurrency, p.rate)
        lines.push(`${p.investor},${p.date},${p.amount},${p.currency},${Math.round(base)},"${p.notes || ''}"`)
      })
    } else {
      lines.push('SIGUI Expense Registry')
      lines.push('Item,Date,Amount,Currency,Base Value,Notes')
      expenses.forEach(e => {
        const base = convertToBase(e.amount, e.currency, baseCurrency, e.rate)
        lines.push(`${e.title},${e.date},${e.amount},${e.currency},${Math.round(base)},"${e.notes || ''}"`)
      })
    }
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURI(lines.join('\n'))
    a.download = `sigui_${type}_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Capital Table */}
      <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5ECEB] flex items-center justify-between"
          style={{ background: 'linear-gradient(to right, #F0FAF5, white)' }}>
          <div>
            <div className="font-black text-[#1A0A0D] text-sm">Capital History</div>
            <div className="text-[11px] text-[#9B7B7E] mt-0.5">Investments by partners</div>
          </div>
          <button onClick={() => downloadCSV('capital')}
            className="px-3 py-1.5 bg-[#FAF6F5] border border-[#E8D8D5] rounded-lg text-xs font-bold text-[#4A3035] hover:bg-[#F0E8E6] transition-all">
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <TableHeader>Partner</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Base</TableHeader>
                <TableHeader>Del</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5ECEB]">
              {payments.length === 0
                ? <EmptyRow message="No capital entries yet." />
                : payments.map(p => {
                    const base = convertToBase(p.amount, p.currency, baseCurrency, p.rate)
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF6F5] transition-colors">
                        <td className="px-4 py-3 font-black text-[#1A0A0D] text-sm">{p.investor}</td>
                        <td className="px-4 py-3 text-[#9B7B7E] text-xs">{formatDate(p.date)}</td>
                        <td className="px-4 py-3 text-[#9B7B7E] text-xs font-mono">
                          {p.amount.toLocaleString()} {p.currency}
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-600 text-xs font-mono">
                          +{formatCurrency(base, baseCurrency)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DeleteBtn onClick={() => onDeletePayment(p.id)} />
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5ECEB] flex items-center justify-between"
          style={{ background: 'linear-gradient(to right, #FEF5F4, white)' }}>
          <div>
            <div className="font-black text-[#1A0A0D] text-sm">Expense History</div>
            <div className="text-[11px] text-[#9B7B7E] mt-0.5">Operational outlays</div>
          </div>
          <button onClick={() => downloadCSV('expenses')}
            className="px-3 py-1.5 bg-[#FAF6F5] border border-[#E8D8D5] rounded-lg text-xs font-bold text-[#4A3035] hover:bg-[#F0E8E6] transition-all">
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <TableHeader>Item</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Base</TableHeader>
                <TableHeader>Del</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5ECEB]">
              {expenses.length === 0
                ? <EmptyRow message="No expenses logged yet." />
                : expenses.map(e => {
                    const base = convertToBase(e.amount, e.currency, baseCurrency, e.rate)
                    return (
                      <tr key={e.id} className="hover:bg-[#FAF6F5] transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-black text-[#1A0A0D] text-sm">{e.title}</div>
                          {e.notes && <div className="text-[10px] text-[#C4A0A0]">{e.notes}</div>}
                        </td>
                        <td className="px-4 py-3 text-[#9B7B7E] text-xs">{formatDate(e.date)}</td>
                        <td className="px-4 py-3 text-[#9B7B7E] text-xs font-mono">
                          {e.amount.toLocaleString()} {e.currency}
                        </td>
                        <td className="px-4 py-3 font-black text-rose-600 text-xs font-mono">
                          -{formatCurrency(base, baseCurrency)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DeleteBtn onClick={() => onDeleteExpense(e.id)} />
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}