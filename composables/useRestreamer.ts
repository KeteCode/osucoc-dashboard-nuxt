export const useRestreamer = () => {
  const supabase = useSupabaseClient()
  const status = ref<string | null>(null)
  const startTime = ref<string | null>(null)
  const uptimeRemaining = ref<number>(0)
  const logs = ref<string>('')
  const loading = ref(false)

  const fetchStatus = async (includeLogs = false) => {
    loading.value = true
    try {
      const { data, error } = await supabase.functions.invoke('manage-vm', {
        method: 'GET',
        queries: includeLogs ? { logs: 'true' } : {},
      })
      if (error) throw error
      status.value = data.status
      startTime.value = data.startTime
      uptimeRemaining.value = data.uptimeRemaining
      if (includeLogs) {
        logs.value = data.logs
      }
    } catch (err) {
      console.error('Error fetching VM status:', err)
    } finally {
      loading.value = false
    }
  }

  const startVM = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase.functions.invoke('manage-vm', {
        method: 'POST',
        body: { action: 'start' },
      })
      if (error) throw error
      // Poll status after starting
      setTimeout(() => fetchStatus(true), 5000)
    } catch (err) {
      console.error('Error starting VM:', err)
    } finally {
      loading.value = false
    }
  }

  const stopVM = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase.functions.invoke('manage-vm', {
        method: 'POST',
        body: { action: 'stop' },
      })
      if (error) throw error
      // Poll status after stopping
      setTimeout(() => fetchStatus(true), 5000)
    } catch (err) {
      console.error('Error stopping VM:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    status,
    startTime,
    uptimeRemaining,
    logs,
    loading,
    fetchStatus,
    startVM,
    stopVM,
  }
}
