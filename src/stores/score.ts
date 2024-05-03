import { ref, readonly, watch } from "vue"
import { defineStore, storeToRefs } from "pinia"
import { useSettingsStore } from "./settings"

export const useScoreStore = defineStore(
  "score",
  () => {
    const { currentDeck } = storeToRefs(useSettingsStore())

    const currentScore = ref(0)
    const totalScore = ref(0)

    watch(currentDeck, (newDeck, oldDeck) => {
      if (newDeck !== oldDeck) {
        currentScore.value = 0
      }
    })

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
      // Cannot be set as readonly, as readonly data cannot be persisted
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
