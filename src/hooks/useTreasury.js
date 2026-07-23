import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTreasury() {
  const [payments, setPayments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [baseCurrency, setBaseCurrency] = useState('XOF')
  const [startupTarget, setStartupTarget] = useState(10000000)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('payments').select('*')
        if (error) throw error
        setPayments(data || [])
      } catch(err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleAddPayment(payment) {
    const { data, error } = await supabase.from('payments').insert(payment).select().single()
    if (error) throw error
    setPayments(prev => [...prev, data])
  }

  async function handleDeletePayment(id) {
    await supabase.from('payments').delete().eq('id', id)
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  async function handleAddExpense(expense) {
    const { data, error } = await supabase.from('expenses').insert(expense).select().single()
    if (error) throw error
    setExpenses(prev => [...prev, data])
  }

  async function handleDeleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  async function handleUpdateTarget(value) {
    setStartupTarget(value)
    await supabase.from('settings').update({ value: String(value) }).eq('key', 'startup_target')
  }

  async function handleUpdateCurrency(cur) {
    setBaseCurrency(cur)
    await supabase.from('settings').update({ value: cur }).eq('key', 'base_currency')
  }

  return {
    payments, expenses, baseCurrency, startupTarget,
    loading, error,
    handleAddPayment, handleDeletePayment,
    handleAddExpense, handleDeleteExpense,
    handleUpdateTarget, handleUpdateCurrency
  }
}
