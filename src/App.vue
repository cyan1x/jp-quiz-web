<script setup lang="ts">
import { ref, type Ref, onMounted, nextTick, computed } from "vue"
import { marked } from "marked"
import { jpdefs } from "./dictionaries/jpdefs"
import { useScoreStore } from "./stores/counter"
import { convertStringToHiragana } from "./convert"

// Focus on <input> on page load
const input = ref({}) as Ref<HTMLInputElement>
onMounted(() => {
  nextTick(() => {
    input.value.focus()
  })
})

const question = ref({}) as Ref<(typeof jpdefs)[number]>
const hint = ref("")
const response = ref("")
const scores = useScoreStore()
const score = ref(0)
const showScorePlus = ref(false)

const arrowClass = computed(() => {
  return {
    "opacity-0": !showScorePlus.value,
    "opacity-100": showScorePlus.value,
    "transition-opacity": true,
    "duration-150": true,
  }
})

const scorePlusStreak = ref(0)
const scorePlusDuration = ref(0)

const interval = 1000

// show scorePlus if duration > 0
function startTimer() {
  const timer = setInterval(() => {
    if (scorePlusDuration.value > 0) {
      scorePlusDuration.value = Math.max(
        0,
        (scorePlusDuration.value -= interval)
      )

      showScorePlus.value = true
    } else {
      showScorePlus.value = false
      restartTimer(timer)
    }
  }, interval)

  return timer
}

function restartTimer(timer: NodeJS.Timeout | null) {
  if (!timer) {
    return
  }

  clearInterval(timer)
  const transitionDuration = 150

  // if a user answers here...
  setTimeout(() => {
    scorePlusStreak.value = 0
    startTimer()
  }, transitionDuration)
}

startTimer()
const streakTime = 2500

function newQuestion() {
  response.value = ""
  question.value = jpdefs[Math.floor(Math.random() * jpdefs.length)]
  hint.value = "_".repeat(question.value.answer[1].length)
}

function addHint() {
  // TODO: Change random "_" in the string to the correct character
}

function checkAnswer() {
  // Skip question
  const skipKeys = ["s", "skip", "sきp", "すきっぷ", "スキップ"]
  if (skipKeys.includes(response.value.trim())) {
    newQuestion()
  }

  // Add hint
  const hintKeys = ["h", "hint", "ひんt", "ひんと", "ヒント"]
  if (hintKeys.includes(response.value.trim())) {
    addHint()
  }

  const answers = question.value.answer.map((answer) =>
    convertStringToHiragana(answer)
  )
  const hiragana = convertStringToHiragana(response.value.trim())
  console.log(hiragana)
  if (answers.includes(hiragana)) {
    score.value += 1
    showScorePlus.value = true
    scorePlusStreak.value += 1
    scorePlusDuration.value = streakTime
    scores.increment()
    newQuestion()
  }
}

const resetMessages = ["reset", "confirm?"] as const
const resetMessage: Ref<(typeof resetMessages)[number]> = ref("reset")

function resetScores() {
  if (resetMessage.value === "reset") {
    resetMessage.value = "confirm?"
  } else {
    scores.reset()
    resetMessage.value = "reset"
  }
}

newQuestion()
</script>

<template>
  <!-- <header>
  </header> -->

  <main>
    <div
      class="bg-zinc-800 text-gray-300 flex justify-center items-center h-screen relative"
    >
      <div class="absolute top-4 left-6 md:top-8 md:left-8">
        <h1 class="text-xl md:text-2xl">
          <span class="">jp-</span>
          <span class="border-b-2 border-[color:var(--accent-color)]">q</span>
          <span class="">uiz</span>
        </h1>
      </div>

      <div
        class="flex lg:w-7/12 p-6 flex-col justify-center items-center flex-wrap"
      >
        <!-- Answer to current question -->
        <!-- <h1 class="text-gray-700 p-4 text-xl">{{ question.answer }}</h1> -->

        <!-- Hint for current question -->
        <h3 class="tracking-widest text-gray-400 p-4 text-xl">{{ hint }}</h3>

        <pre class="text-lg" v-html="marked.parse(question.question)"></pre>

        <input
          class="bg-transparent m-2 text-lg border-solid border-2 border-gray-500 rounded-sm text-center"
          ref="input"
          v-model="response"
          @keyup.enter="checkAnswer"
        />

        <span class="mt-3"
          >current score: {{ score }}
          <span :class="arrowClass" class="text-[color:var(--accent-color)]"
            >+{{ scorePlusStreak }}</span
          >
          <!-- Duration of score plus indicator (+1, +2...) -->
          <!-- <span> ({{ scorePlusDuration }})</span> -->
        </span>

        <span class="mt-1">overall: {{ scores.score }}</span>

        <div>
          <button
            class="border-solid border-2 border-gray-500 mt-1 p-1 rounded-md"
            @click="resetScores"
          >
            {{ resetMessage }}
          </button>
          <button
            v-if="resetMessage === 'confirm?'"
            class="border-solid border-2 border-gray-500 m-2 p-1 rounded-md"
            @click="() => (resetMessage = 'reset')"
          >
            cancel
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
:deep(pre strong) {
  color: var(--accent-color);
}
</style>
