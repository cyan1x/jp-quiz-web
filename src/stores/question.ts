import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { decks } from "../dictionaries/index"
import { useSettingsStore } from "./settings"

const types = ["_", "-", "●"]
const preferredType = types[0]

function toHint(s: string) {
  return preferredType.repeat(s.length)
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = array.slice()

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

let previousHint = ""

export const useQuestionStore = defineStore("question", () => {
  const settingsStore = useSettingsStore()
  const deckData = computed(() => decks[settingsStore.currentDeck])

  const deckType = computed<"kanji" | "def" | "anagrams">(() => {
    if (settingsStore.currentDeck === "jpdefs") {
      return "def"
    } else if (settingsStore.currentDeck === "n1") {
      return "kanji"
    } else if (settingsStore.currentDeck.includes("anagrams")) {
      return "anagrams"
    }

    throw new Error(`Unknown deck type ${settingsStore.currentDeck}`)
  })

  let refreshKey = ref(0)
  const questionIndex = computed(() => {
    refreshKey.value
    return Math.floor(Math.random() * deckData.value.length)
  })

  const currentQuestion = computed(() => {
    if (deckType.value === "anagrams") {
      return {
        ...deckData.value[questionIndex.value],
        question: shuffleArray(
          deckData.value[questionIndex.value].question.split("")
        ).join(""),
      }
    }

    return deckData.value[questionIndex.value]
  })

  const answerForHint = computed(() => {
    if (deckType.value === "kanji" || deckType.value === "anagrams") {
      return currentQuestion.value.answer[0]
    }

    if (deckType.value === "def") {
      return currentQuestion.value.answer[
        currentQuestion.value.answer.length - 1
      ]
    }

    throw new Error(`Unknown deck type ${settingsStore.currentDeck}`)
  })

  const hintLevel = ref(0)

  const currentHint = computed(() => {
    const hintLetters = (previousHint || toHint(answerForHint.value)).split("")
    const revealedLetterCount =
      hintLetters.length - hintLetters.filter((x) => x === preferredType).length

    const getIndex = () =>
      Math.floor(Math.random() * answerForHint.value.length)

    for (let i = revealedLetterCount; i < hintLevel.value; i += 1) {
      let index = 0
      let letterAlreadyRevealed = true

      do {
        index = getIndex()
        if (hintLetters[index] === preferredType) {
          letterAlreadyRevealed = false
        }
      } while (
        letterAlreadyRevealed &&
        hintLetters.join("") !== answerForHint.value
      )

      hintLetters[index] = answerForHint.value[index]
    }

    previousHint = hintLetters.join("")

    return hintLetters.join("")
  })

  function changeQuestion() {
    previousHint = ""
    hintLevel.value = 0

    // Refresh currentQuestion
    refreshKey.value += 1
  }

  return { currentQuestion, hintLevel, currentHint, deckType, changeQuestion }
})
