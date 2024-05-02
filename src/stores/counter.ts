import { ref, computed } from "vue"
import { defineStore } from "pinia"

export const useScoreStore = defineStore(
  "store",
  () => {
    const score = ref(0)
    const doubleScore = computed(() => score.value * 2)
    function increment() {
      score.value += 1
    }

    function reset() {
      score.value = 0
    }

    return { score, doubleScore, increment, reset }
  },
  {
    persist: true,
  }
)
