import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ounjiaancfpxvcsjmgte.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bmppYWFuY2ZweHZjc2ptZ3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTgwNjUsImV4cCI6MjEwMDM3NDA2NX0.s-C4attiUUlIjde8gwsSZ7HICHsVlunn-5lBOoUhGHg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)