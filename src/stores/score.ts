import { ref, computed } from "vue"
import { defineStore } from "pinia"

export const useScoreStore = defineStore(
  "score",
  () => {
    const currentScore = ref(0)
    const totalScore = ref(0)

    const doubleScore = computed(() => totalScore.value * 2)
    function increment() {
      totalScore.value += 1
    }

    function reset() {
      currentScore.value = 0
      totalScore.value = 0
    }

    return { currentScore, totalScore, doubleScore, increment, reset }
  },
  {
    persist: {
      paths: ["totalScore"],
    },
  }
)
