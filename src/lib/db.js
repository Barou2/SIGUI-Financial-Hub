import { supabase } from './supabase'

// ── PAYMENTS ──
export async function getPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function addPayment(payment) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePayment(id) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── EXPENSES ──
export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function addExpense(expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExpense(id) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── SETTINGS ──
export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error) throw error
  return data.value
}

export async function updateSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .update({ value: String(value) })
    .eq('key', key)
  if (error) throw error
}