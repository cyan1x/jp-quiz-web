<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { useSettingsStore } from "../stores/settings"
import { tailwindToClassObject } from "../utils"

const settings = useSettingsStore()
const visible = ref(false)

function toggleVisible() {
  visible.value = !visible.value
}

defineExpose({
  toggleVisible,
})

const decklistClass = computed(() =>
  tailwindToClassObject(
    "z-10 flex flex-col justify-center fixed h-6/6 h-screen transition-all duration-100",
    {
      "right-8": visible.value,
      // Off-screen
      "-right-64": !visible.value,
    }
  )
)

// const decklistClass = {
//   "z-10": true,
//   flex: true,
//   "flex-col": true,
//   "justify-center": true,
//   fixed: true,
//   "h-6/6": true,
//   "h-screen": true,
//   // "right-8": visible.value,
//   "-right-40": !visible.value,
// }
</script>

<template>
  <div :class="decklistClass">
    <div
      class="bg-zinc-900 text-gray-300 text-center border-2 border-solid border-gray-600 h-5/6 w-48 flex flex-col gap-1 p-3 px-4 rounded-md">
      <h2 class="md:text-lg mt-2 mb-1">Decks</h2>
      <button class="border-solid border-2 border-gray-500 p-1 rounded-md" v-for="deck in settings.deckList"
        @click="() => (settings.currentDeck = deck)">
        {{ deck }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
