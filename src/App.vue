<script setup lang="ts">
import { ref, type Ref, onMounted, nextTick, computed } from "vue"
import { marked } from "marked"
import { useQuestionStore } from "./stores/question"
import { useScoreStore } from "./stores/score"
import { convertStringToHiragana } from "./convert"

// Focus on <input> on page load
const input = ref({}) as Ref<HTMLInputElement>
onMounted(() => {
  nextTick(() => {
    input.value.focus()
  })
})

const response = ref("")
const scores = useScoreStore()
const questions = useQuestionStore()

// Show a plus score message on answer success (e.g. +1)
const showScorePlus = ref(false)
const arrowClass = computed(() => {
  return {
    "opacity-0": !showScorePlus.value,
    "opacity-100": showScorePlus.value,
    "transition-opacity": true,
    "duration-150": true,
  }
})

// Show scorePlus if duration > 0
const scorePlusStreak = ref(0)
const scorePlusDuration = ref(0)
function startTimer() {
  const interval = 1000
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

function clearResponse() {
  response.value = ""
}

function newQuestion() {
  clearResponse()
  questions.changeQuestion()
  // kanji question with two possible answers
  // question.value = jpdefs.find((v) => v.question === "思惑")
}

startTimer()
const streakTime = 3000

function checkAnswer() {
  // Skip question
  const skipKeys = ["s", "skip", "sきp", "すきっぷ", "スキップ"]
  if (skipKeys.includes(response.value.trim())) {
    newQuestion()
  }

  // Add hint
  const hintKeys = ["h", "hint", "ひんt", "ひんと", "ヒント"]
  if (hintKeys.includes(response.value.trim())) {
    questions.hintLevel += 1
    clearResponse()
  }

  const answers = questions.currentQuestion.answer.map((answer) =>
    convertStringToHiragana(answer)
  )
  const hiragana = convertStringToHiragana(response.value.trim())
  if (answers.includes(hiragana)) {
    scores.currentScore += 1
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

const confirmClass = computed(() => {
  const isConfirm = resetMessage.value === "confirm?"

  return {
    "text-[0px]": !isConfirm,
    "text-base": isConfirm,
    // "transition-all": true,
    "transition-[font-size]": true,
    "duration-200": true,
    "border-solid": isConfirm,
    "border-2": isConfirm,
    "border-gray-500": isConfirm,
    "p-1": true,
    "rounded-md": true,
  }
})

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
        <h1 class="text-gray-700 p-4 text-xl">
          {{ questions.currentQuestion.answer }}
        </h1>

        <!-- Hint for current question -->
        <h3 class="tracking-widest text-gray-400 p-4 text-xl">
          {{ questions.currentHint }}
        </h3>

        <h2
          v-if="questions.deckType === 'kanji'"
          class="text-7xl text-[color:var(--accent-color)] m-4"
        >
          {{ questions.currentQuestion.question }}
        </h2>
        <pre
          v-if="questions.deckType === 'def'"
          class="text-lg"
          v-html="marked.parse(questions.currentQuestion.question)"
        ></pre>

        <input
          class="bg-transparent m-2 text-lg border-solid border-2 border-gray-500 rounded-sm text-center"
          ref="input"
          v-model="response"
          @keyup.enter="checkAnswer"
        />

        <div class="flex flex-col m-2">
          <span class="mt-3"
            >current score: {{ scores.currentScore }}
            <span :class="arrowClass" class="text-[color:var(--accent-color)]"
              >+{{ scorePlusStreak || 1 }}</span
            >
            <!-- Duration of score plus indicator (+1, +2...) -->
            <!-- <span> ({{ scorePlusDuration }})</span> -->
          </span>

          <span class="mt-1">overall: {{ scores.totalScore }}</span>
          <div class="flex flex-col mt-2 gap-2">
            <button
              class="border-solid border-2 border-gray-500 p-1 rounded-md"
              @click="resetScores"
            >
              {{ resetMessage }}
            </button>
            <!-- <button
              v-if="resetMessage === 'confirm?'"
              :class="confirmClass"
              @click="() => (resetMessage = 'reset')"
            > -->
            <button
              :class="confirmClass"
              @click="() => (resetMessage = 'reset')"
            >
              cancel
            </button>
          </div>
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
