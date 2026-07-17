import { useEffect } from 'react'
import { supabase } from '@backend/supabaseClient'

export default function AppHome() {
  // TEMPORARY, remove in phase 6: quick check that the Supabase connection works.
  useEffect(() => {
    async function checkConnection() {
      const { count, error } = await supabase
        .from('professions')
        .select('*', { count: 'exact' })
      if (error) {
        console.error('Supabase connection error:', error.message)
        return
      }
      console.log(`Supabase connected, professions: ${count}`)
    }
    void checkConnection()
  }, [])

  return <>Dashboard</>
}
