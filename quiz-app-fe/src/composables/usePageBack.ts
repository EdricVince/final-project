import { ref } from 'vue'

const backLabel = ref('')
const backFn = ref<(() => void) | null>(null)

export function usePageBack() {
  function setBack(label: string, fn: () => void) {
    backLabel.value = label
    backFn.value = fn
  }
  function clearBack() {
    backLabel.value = ''
    backFn.value = null
  }
  return { backLabel, backFn, setBack, clearBack }
}
