import { ref, type Ref, readonly } from "vue"
import { decks } from "../dictionaries/index"
import { defineStore } from "pinia"

export const useSettingsStore = defineStore("store", () => {
  const deckList = Object.keys(decks)
  const currentDeck: Ref<keyof typeof decks> = ref("anagrams5")

  return { deckList: readonly(deckList), currentDeck }
})
