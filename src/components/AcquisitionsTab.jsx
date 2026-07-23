import { useState, useEffect } from 'react'
import { formatCurrency } from '../lib/utils'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { id: 'grinding',  label: 'Grinding Machine',   emoji: '⚙️' },
  { id: 'drying',    label: 'Drying Machine',      emoji: '🌡️' },
  { id: 'packaging_machine', label: 'Packaging Machine', emoji: '🏷️' },
  { id: 'premises',  label: 'Premises / Rent',     emoji: '🏭' },
  { id: 'solar',     label: 'Solar Panels',         emoji: '☀️' },
  { id: 'battery',   label: 'Solar Batteries',      emoji: '🔋' },
  { id: 'water',     label: 'Water & Utilities',    emoji: '💧' },
  { id: 'transport', label: 'Transport',             emoji: '🚛' },
  { id: 'packaging', label: 'Packaging Materials',  emoji: '📦' },
  { id: 'legal',     label: 'Legal & Admin',         emoji: '📋' },
  { id: 'raw',       label: 'Raw Materials',         emoji: '🌿' },
]

const STATUS_COLORS = {
  planned:    { bg: '#FEF9C3', text: '#854D0E', label: 'Planned' },
  inprogress: { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' },
  acquired:   { bg: '#D1FAE5', text: '#065F46', label: 'Acquired' },
}

const inputClass = "w-full px-3 py-2.5 bg-[#FAF6F5] border-2 border-[#E8D8D5] rounded-xl text-sm font-semibold text-[#1A0A0D] outline-none focus:border-[#8B1A2B] focus:bg-white transition-all"
const selectClass = "w-full px-3 py-2.5 bg-[#FAF6F5] border-2 border-[#E8D8D5] rounded-xl text-sm font-semibold text-[#1A0A0D] outline-none focus:border-[#8B1A2B] cursor-pointer"

export default function AcquisitionsTab({ baseCurrency }) {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({
    name: '', category: 'grinding', estimated_cost: '',
    notes: '', status: 'planned', priority: 'medium'
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('acquisitions')
        .select('*')
        .order('created_at', { ascending: true })
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name || !form.estimated_cost) return
    setSaving(true)
    const { data, error } = await supabase
      .from('acquisitions')
      .insert({
        name:           form.name,
        category:       form.category,
        estimated_cost: parseFloat(form.estimated_cost),
        notes:          form.notes,
        status:         form.status,
        priority:       form.priority,
        currency:       'XOF'
      })
      .select()
      .single()
    if (!error) {
      setItems(prev => [...prev, data])
      setForm({ name: '', category: 'grinding', estimated_cost: '', notes: '', status: 'planned', priority: 'medium' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    await supabase.from('acquisitions').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function handleStatusChange(id, status) {
    await supabase.from('acquisitions').update({ status }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }

  async function handleCostEdit(id, newCost) {
    const cost = parseFloat(newCost)
    if (isNaN(cost) || cost <= 0) return
    await supabase.from('acquisitions').update({ estimated_cost: cost }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, estimated_cost: cost } : i))
  }

  const totalEstimated = items.reduce((acc, i) => acc + (i.estimated_cost || 0), 0)
  const totalAcquired  = items.filter(i => i.status === 'acquired').reduce((acc, i) => acc + (i.estimated_cost || 0), 0)
  const acquiredPct    = totalEstimated > 0 ? Math.round((totalAcquired / totalEstimated) * 100) : 0
  const getCat         = id => CATEGORIES.find(c => c.id === id) || { emoji: '📌', label: id }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-[#8B1A2B] font-bold animate-pulse">Loading acquisitions...</div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1A0A0D]">Acquisitions</h2>
          <p className="text-sm text-[#9B7B7E] mt-0.5">
            Everything SIGUI needs — machines, premises, energy, materials
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 font-bold text-sm text-white rounded-xl shadow-md transition-all"
          style={{ background: showForm ? '#9B7B7E' : '#8B1A2B' }}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E8E6] p-5 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9B7B7E]">Total Estimated Cost</div>
          <div className="text-2xl font-black text-[#8B1A2B] mt-2">{formatCurrency(totalEstimated, baseCurrency)}</div>
          <div className="text-xs text-[#C4A0A0] mt-1">{items.length} items tracked</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Already Acquired</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(totalAcquired, baseCurrency)}</div>
          <div className="text-xs text-emerald-400 mt-1">{items.filter(i => i.status === 'acquired').length} items done</div>
        </div>
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-widest text-purple-700">Acquisition Progress</div>
          <div className="text-2xl font-black text-purple-700 mt-2">{acquiredPct}%</div>
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden mt-2">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${acquiredPct}%`, background: 'linear-gradient(to right, #8B1A2B, #C9A84C)' }} />
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5ECEB]"
            style={{ background: 'linear-gradient(to right, #FAF6F5, white)' }}>
            <div className="font-black text-[#1A0A0D] text-sm">New Acquisition Item</div>
            <div className="text-[11px] text-[#9B7B7E]">Add a machine, asset, or cost SIGUI needs</div>
          </div>
          <form onSubmit={handleAdd} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#9B7B7E] uppercase tracking-wide mb-1.5">Item Name</label>
                <input type="text" className={inputClass}
                  placeholder="e.g. Grinding Machine Model X"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#9B7B7E] uppercase tracking-wide mb-1.5">Category</label>
                <select className={selectClass} value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#9B7B7E] uppercase tracking-wide mb-1.5">Estimated Cost (XOF)</label>
                <input type="number" className={inputClass} placeholder="e.g. 1500000"
                  value={form.estimated_cost}
                  onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#9B7B7E] uppercase tracking-wide mb-1.5">Status</label>
                <select className={selectClass} value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="planned">Planned</option>
                  <option value="inprogress">In Progress</option>
                  <option value="acquired">Acquired</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#9B7B7E] uppercase tracking-wide mb-1.5">Priority</label>
                <select className={selectClass} value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#9B7B7E] uppercase tracking-wide mb-1.5">Notes</label>
              <input type="text" className={inputClass}
                placeholder="e.g. Need 2 units, check supplier in Bamako"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-60"
              style={{ background: '#8B1A2B' }}>
              {saving ? 'Saving...' : '+ Add to Acquisitions'}
            </button>
          </form>
        </div>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0E8E6] p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="font-black text-[#1A0A0D] text-sm">No acquisitions yet</div>
          <div className="text-xs text-[#C4A0A0] mt-1">
            Click "+ Add Item" to start tracking what SIGUI needs
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => {
            const cat    = getCat(item.category)
            const status = STATUS_COLORS[item.status] || STATUS_COLORS.planned
            const priority = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢'
            return (
              <AcquisitionCard
                key={item.id}
                item={item}
                cat={cat}
                status={status}
                priority={priority}
                baseCurrency={baseCurrency}
                onStatusChange={handleStatusChange}
                onCostEdit={handleCostEdit}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

    </div>
  )
}

function AcquisitionCard({ item, cat, status, priority, baseCurrency, onStatusChange, onCostEdit, onDelete }) {
  const [editingCost, setEditingCost] = useState(false)
  const [draftCost, setDraftCost]     = useState(item.estimated_cost)

  return (
    <div className="bg-white rounded-2xl border border-[#F0E8E6] shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* Card Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(to right, #FAF6F5, white)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cat.emoji}</span>
          <div>
            <div className="font-black text-[#1A0A0D] text-sm leading-tight">{item.name}</div>
            <div className="text-[10px] text-[#9B7B7E] font-medium">{cat.label}</div>
          </div>
        </div>
        <span className="text-lg">{priority}</span>
      </div>

      {/* Card Body */}
      <div className="px-4 py-3 space-y-3">

        {/* Editable Cost */}
        {editingCost ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="number"
              value={draftCost}
              onChange={e => setDraftCost(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onCostEdit(item.id, draftCost)
                  setEditingCost(false)
                }
              }}
              className="w-full px-2 py-1.5 border-2 border-[#8B1A2B] rounded-lg text-sm font-bold text-[#8B1A2B] outline-none"
            />
            <button onClick={() => { onCostEdit(item.id, draftCost); setEditingCost(false) }}
              className="px-2 py-1.5 bg-[#8B1A2B] text-white text-xs font-bold rounded-lg">✓</button>
            <button onClick={() => setEditingCost(false)}
              className="px-2 py-1.5 bg-[#F0E8E6] text-[#9B7B7E] text-xs font-bold rounded-lg">✕</button>
          </div>
        ) : (
          <button onClick={() => { setDraftCost(item.estimated_cost); setEditingCost(true) }}
            className="group flex items-center gap-2">
            <span className="text-xl font-black text-[#8B1A2B]">
              {formatCurrency(item.estimated_cost || 0, baseCurrency)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#F2D4D0] text-[#8B1A2B] rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all">
              edit
            </span>
          </button>
        )}

        {item.notes && (
          <div className="text-xs text-[#9B7B7E] leading-relaxed">{item.notes}</div>
        )}

        {/* Status + Delete */}
        <div className="flex items-center justify-between">
          <select
            value={item.status}
            onChange={e => onStatusChange(item.id, e.target.value)}
            className="text-xs font-bold px-2 py-1 rounded-lg border-none outline-none cursor-pointer"
            style={{ background: status.bg, color: status.text }}>
            <option value="planned">Planned</option>
            <option value="inprogress">In Progress</option>
            <option value="acquired">Acquired</option>
          </select>
          <button onClick={() => onDelete(item.id)}
            className="text-xs font-bold px-2 py-1 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all">
            ✕ Remove
          </button>
        </div>
      </div>
    </div>
  )
}