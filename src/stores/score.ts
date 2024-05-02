import { ref, computed, readonly } from "vue"
import { defineStore } from "pinia"

export const useScoreStore = defineStore(
  "score",
  () => {
    const currentScore = ref(0)
    const totalScore = ref(0)

    function increase(amount: number) {
      currentScore.value += amount
      totalScore.value += amount
    }

    function reset() {
      currentScore.value = 0
      totalScore.value = 0
    }

    return {
      currentScore: readonly(currentScore),
      // Persistent data cannot be readonly
      totalScore,
      increase,
      reset,
    }
  },
  {
    persist: {
      paths: ["totalScore"],
    },
  }
)
