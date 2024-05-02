import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { decks } from "../dictionaries/index"
import { useSettingsStore } from "./settings"

const types = ["_", "-", "●"]
const preferredType = types[0]

function toHint(s: string) {
  return preferredType.repeat(s.length)
}

let previousHint = ""

export const useQuestionStore = defineStore("question", () => {
  const settingsStore = useSettingsStore()
  const deckData = decks[settingsStore.currentDeck]

  const deckType = computed<"kanji" | "def">(() => {
    if (settingsStore.currentDeck === "jpdefs") {
      return "def"
    } else if (settingsStore.currentDeck === "n1") {
      return "kanji"
    }

    throw new Error(`Unknown deck type ${settingsStore.currentDeck}`)
  })

  const currentQuestion = ref(
    deckData[Math.floor(Math.random() * deckData.length)]
  )

  const answerForHint = computed(() => {
    if (deckType.value === "kanji") {
      return currentQuestion.value.answer[0]
    } else if (deckType.value === "def") {
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
    currentQuestion.value =
      deckData[Math.floor(Math.random() * deckData.length)]
  }

  return { currentQuestion, hintLevel, currentHint, deckType, changeQuestion }
})
