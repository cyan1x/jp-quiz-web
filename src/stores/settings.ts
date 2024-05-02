import { ref, type Ref, computed } from "vue"
import { decks } from "../dictionaries/index"
import { defineStore } from "pinia"

export const useSettingsStore = defineStore("store", () => {
  const currentDeck: Ref<keyof typeof decks> = ref("n1")

  return { currentDeck }
})
