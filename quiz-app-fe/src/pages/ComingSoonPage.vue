<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
    <div class="animate-fade-in-up text-center">
      <div class="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
        <Rocket class="text-primary h-10 w-10" />
      </div>
      <h1 class="text-foreground mb-3 text-2xl font-bold">Coming Soon</h1>
      <p class="text-muted-foreground mx-auto max-w-md text-base">
        We're working hard to bring you this feature. Stay tuned for updates!
      </p>
      <Button class="mt-6" @click="goBack">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Go Back
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Rocket, ArrowLeft } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
