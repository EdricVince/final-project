import { onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * Keeps shared, multi-user data fresh by re-running a task on an interval —
 * a lightweight "realtime" for screens like leaderboards and class rosters.
 *
 * - Runs once immediately (unless `immediate: false`).
 * - Skips ticks while the browser tab is hidden, and refreshes as soon as the
 *   tab becomes visible again, so background tabs don't hammer the server.
 * - Stops automatically when the component unmounts.
 *
 * @param task        the async work to repeat (e.g. re-fetch a list)
 * @param intervalMs  how often to run, in milliseconds (default 10s)
 */
export function usePolling(
  task: () => void | Promise<void>,
  intervalMs = 10000,
  options: { immediate?: boolean } = {},
) {
  const { immediate = true } = options
  let timer: ReturnType<typeof setInterval> | null = null
  const isPolling = ref(false)

  const run = async () => {
    if (typeof document !== 'undefined' && document.hidden) return
    await task()
  }

  const start = () => {
    if (timer) return
    isPolling.value = true
    timer = setInterval(() => { void run() }, intervalMs)
  }

  const stop = () => {
    if (timer) { clearInterval(timer); timer = null }
    isPolling.value = false
  }

  const onVisibility = () => {
    if (!document.hidden) void run()
  }

  onMounted(() => {
    if (immediate) void run()
    start()
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return { start, stop, refresh: run, isPolling }
}
