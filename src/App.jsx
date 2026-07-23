import { useState } from 'react'
import { useTreasury } from './hooks/useTreasury'
import StatCards from './components/StatCards'
import TreasuryForms from './components/TreasuryForms'
import LedgerTables from './components/LedgerTables'
import TrajectoryChart from './components/TrajectoryChart'
import GoalsTab from './components/GoalsTab'
import AcquisitionsTab from './components/AcquisitionsTab'
import EquityChart from './components/EquityChart'

const TABS = [
  { id: 'treasury',     label: 'Treasury' },
  { id: 'goals',        label: 'Goals' },
  { id: 'projections',  label: 'Projections' },
  { id: 'acquisitions', label: 'Acquisitions' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('treasury')
  const {
    payments, expenses, baseCurrency, startupTarget,
    loading, error,
    handleAddPayment, handleDeletePayment,
    handleAddExpense, handleDeleteExpense,
    handleUpdateTarget, handleUpdateCurrency
  } = useTreasury()

  return (
    <div className="min-h-screen bg-[#FAF6F5]">

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6B1220 0%, #8B1A2B 60%, #B22535 100%)' }}
        className="sticky top-0 z-50 shadow-xl">
        <div style={{ height: '3px', background: 'linear-gradient(to right, #F2D4D0, #C9A84C, #F2D4D0)' }} />
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src="/sigui-logo.png" alt="SIGUI"
              className="w-14 h-14 rounded-2xl object-cover"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }} />
            <div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '22px', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                SIGUI <span style={{ color: '#E8C97A' }}>Financial Hub</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(242,212,208,0.8)', fontWeight: 500, marginTop: '4px' }}>
                Hamid &bull; barou &bull; Sana — Partnership Ledger
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Currency selector */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#F2D4D0' }}>Currency:</span>
              <select value={baseCurrency} onChange={e => handleUpdateCurrency(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', fontWeight: 800, outline: 'none', cursor: 'pointer' }}>
                <option value="XOF" style={{ color: '#1A0A0D' }}>XOF (CFA)</option>
                <option value="USD" style={{ color: '#1A0A0D' }}>USD ($)</option>
                <option value="EUR" style={{ color: '#1A0A0D' }}>EUR (€)</option>
              </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: activeTab === tab.id ? '#F2D4D0' : 'transparent',
                    color: activeTab === tab.id ? '#6B1220' : 'rgba(255,255,255,0.6)'
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

          </div>
        </div>
        <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#8B1A2B] font-bold text-sm animate-pulse">Loading SIGUI data...</div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm font-medium">
            ⚠ Error: {error}
          </div>
        )}

        {!loading && !error && activeTab === 'treasury' && (
          <>
            <StatCards
              payments={payments}
              expenses={expenses}
              baseCurrency={baseCurrency}
              startupTarget={startupTarget}
              onUpdateTarget={handleUpdateTarget}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TrajectoryChart
                  payments={payments}
                  expenses={expenses}
                  baseCurrency={baseCurrency}
                />
              </div>
              <EquityChart payments={payments} baseCurrency={baseCurrency} />
            </div>
            <TreasuryForms
              onAddPayment={handleAddPayment}
              onAddExpense={handleAddExpense}
            />
            <LedgerTables
              payments={payments}
              expenses={expenses}
              baseCurrency={baseCurrency}
              onDeletePayment={handleDeletePayment}
              onDeleteExpense={handleDeleteExpense}
            />
          </>
        )}

        {!loading && !error && activeTab === 'goals' && (
          <GoalsTab
            payments={payments}
            expenses={expenses}
            baseCurrency={baseCurrency}
            startupTarget={startupTarget}
            onUpdateTarget={handleUpdateTarget}
          />
        )}

        {!loading && !error && activeTab === 'projections' && (
          <div className="bg-white rounded-2xl border border-[#F0E8E6] p-8 text-center">
            <div className="text-[#8B1A2B] font-black text-lg">Projections</div>
            <div className="text-[#9B7B7E] text-sm mt-2">Coming in the next step.</div>
          </div>
        )}

        {!loading && !error && activeTab === 'acquisitions' && (
          <AcquisitionsTab baseCurrency={baseCurrency} />
        )}

      </main>

      {/* Footer */}
      <footer style={{ background: '#6B1220', marginTop: '60px' }}
        className="py-4 text-center">
        <p style={{ fontSize: '11px', color: 'rgba(242,212,208,0.6)', fontWeight: 600, letterSpacing: '0.05em' }}>
          SIGUI FINANCIAL HUB &bull; HAMID &bull; BAROU &bull; SANA &bull; BAMAKO, MALI
        </p>
      </footer>

    </div>
  )
}