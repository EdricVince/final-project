<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="animate-fade-in-down mb-8">
      <button
        class="group mb-4 flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-3.5 py-1.5 text-sm font-semibold text-indigo-400 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/15 active:scale-95"
        @click="$router.push('/teacher/tests')"
      >
        <svg class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Tests
      </button>
      <h1 class="text-foreground text-2xl font-bold tracking-tight lg:text-3xl">
        {{ isEditing ? 'Edit Test' : 'Create New Test' }}
      </h1>
    </div>

    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Test Settings -->
      <div class="lg:col-span-1">
        <div class="bg-card border-border sticky top-24 rounded-2xl border p-6">
          <h2 class="text-foreground mb-4 font-semibold">Test Settings</h2>

          <div class="space-y-4">
            <div>
              <label class="text-foreground mb-2 block text-sm font-medium">Title *</label>
              <input
                v-model="testForm.title"
                type="text"
                placeholder="Test title"
                class="bg-secondary text-foreground placeholder:text-muted-foreground h-10 w-full rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label class="text-foreground mb-2 block text-sm font-medium">Description</label>
              <textarea
                v-model="testForm.description"
                rows="3"
                placeholder="Test description"
                class="bg-secondary text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border-0 p-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              ></textarea>
            </div>

            <div>
              <label class="text-foreground mb-2 block text-sm font-medium">Time Limit (minutes)</label>
              <input
                v-model.number="testForm.time_limit"
                type="number"
                min="1"
                placeholder="30"
                class="bg-secondary text-foreground placeholder:text-muted-foreground h-10 w-full rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div class="space-y-3">
              <label class="flex items-center gap-3">
                <input
                  v-model="testForm.shuffle_questions"
                  type="checkbox"
                  class="text-primary h-4 w-4 rounded"
                />
                <span class="text-foreground text-sm">Shuffle questions</span>
              </label>

              <label class="flex items-center gap-3">
                <input
                  v-model="testForm.show_answers_after"
                  type="checkbox"
                  class="text-primary h-4 w-4 rounded"
                />
                <span class="text-foreground text-sm">Show answers after submission</span>
              </label>
            </div>

            <Button class="w-full" @click="saveTest">
              <Save class="mr-2 h-4 w-4" />
              {{ isEditing ? 'Save Changes' : 'Save Test' }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div class="lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-foreground font-semibold">Questions ({{ questions.length }})</h2>
          <Button @click="addQuestion">
            <Plus class="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(question, qIndex) in questions"
            :key="question.id"
            class="bg-card border-border rounded-2xl border p-6"
          >
            <!-- Question Header -->
            <div class="mb-4 flex items-start justify-between">
              <div class="flex items-center gap-2">
                <span class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {{ qIndex + 1 }}
                </span>
                <select
                  v-model="question.question_type"
                  class="bg-secondary text-foreground h-8 rounded-lg border-0 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="question.points"
                  type="number"
                  min="1"
                  class="bg-secondary text-foreground h-8 w-16 rounded-lg border-0 px-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span class="text-muted-foreground text-sm">pts</span>
                <button
                  class="text-muted-foreground hover:text-destructive ml-2 transition-colors"
                  @click="removeQuestion(qIndex)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Question Text -->
            <div class="mb-4">
              <textarea
                v-model="question.question_text"
                rows="2"
                placeholder="Enter your question..."
                class="bg-secondary text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border-0 p-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              ></textarea>
            </div>

            <!-- Answers -->
            <div v-if="question.question_type !== 'short_answer'" class="space-y-2">
              <div
                v-for="(answer, aIndex) in question.answers"
                :key="aIndex"
                class="flex items-center gap-3"
              >
                <button
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                  :class="answer.is_correct ? 'border-primary bg-primary text-primary-foreground' : 'border-border'"
                  @click="setCorrectAnswer(qIndex, aIndex)"
                >
                  <Check v-if="answer.is_correct" class="h-4 w-4" />
                </button>
                <input
                  v-model="answer.answer_text"
                  type="text"
                  :placeholder="`Answer ${aIndex + 1}`"
                  class="bg-secondary text-foreground placeholder:text-muted-foreground h-10 flex-1 rounded-xl border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  v-if="question.answers.length > 2"
                  class="text-muted-foreground hover:text-destructive transition-colors"
                  @click="removeAnswer(qIndex, aIndex)"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>

              <button
                v-if="question.question_type === 'multiple_choice' && question.answers.length < 6"
                class="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
                @click="addAnswer(qIndex)"
              >
                <Plus class="h-4 w-4" />
                Add Answer
              </button>
            </div>

            <!-- Short Answer Hint -->
            <div v-else class="bg-secondary rounded-xl p-4">
              <p class="text-muted-foreground text-sm">Students will type their answer in a text field.</p>
              <input
                v-model="question.answers[0]!.answer_text"
                type="text"
                placeholder="Expected answer (for grading reference)"
                class="bg-card text-foreground placeholder:text-muted-foreground mt-2 h-10 w-full rounded-lg border-0 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="questions.length === 0"
            class="bg-card border-border flex flex-col items-center justify-center rounded-2xl border border-dashed p-12"
          >
            <div class="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <HelpCircle class="text-muted-foreground h-8 w-8" />
            </div>
            <h3 class="text-foreground mb-2 font-medium">No questions yet</h3>
            <p class="text-muted-foreground mb-4 text-sm">Add your first question to get started</p>
            <Button @click="addQuestion">
              <Plus class="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, Save, Trash2, Check, X, HelpCircle } from '@/components/icons'
import Button from '@/components/ui/button/Button.vue'
import { useToast } from '@/composables/useToast'
import type { Question, Answer, QuestionType } from '@/types/test'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)

const testForm = ref({
  title: '',
  description: '',
  time_limit: 30,
  shuffle_questions: false,
  show_answers_after: true,
})

const questions = ref<Question[]>([])

const createDefaultAnswers = (type: QuestionType): Answer[] => {
  if (type === 'true_false') {
    return [
      { answer_text: 'True', is_correct: true },
      { answer_text: 'False', is_correct: false },
    ]
  }
  if (type === 'short_answer') {
    return [{ answer_text: '', is_correct: true }]
  }
  return [
    { answer_text: '', is_correct: true },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
  ]
}

const addQuestion = () => {
  const newQuestion: Question = {
    id: Date.now(),
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    order: questions.value.length + 1,
    answers: createDefaultAnswers('multiple_choice'),
  }
  questions.value.push(newQuestion)
}

const removeQuestion = (index: number) => {
  questions.value.splice(index, 1)
}

const addAnswer = (qIndex: number) => {
  questions.value[qIndex]?.answers.push({ answer_text: '', is_correct: false })
}

const removeAnswer = (qIndex: number, aIndex: number) => {
  questions.value[qIndex]?.answers.splice(aIndex, 1)
}

const setCorrectAnswer = (qIndex: number, aIndex: number) => {
  const question = questions.value[qIndex]
  if (!question) return
  if (question.question_type === 'multiple_choice') {
    question.answers.forEach((a, i) => {
      a.is_correct = i === aIndex
    })
  } else {
    if (question.answers[aIndex]) question.answers[aIndex]!.is_correct = !question.answers[aIndex]!.is_correct
  }
}

const saveTest = () => {
  if (!testForm.value.title.trim()) {
    toast.error('Please enter a test title')
    return
  }
  if (questions.value.length === 0) {
    toast.error('Please add at least one question')
    return
  }

  // Save test logic here
  toast.success(isEditing.value ? 'Test updated!' : 'Test created!')
  router.push('/teacher/tests')
}
</script>
