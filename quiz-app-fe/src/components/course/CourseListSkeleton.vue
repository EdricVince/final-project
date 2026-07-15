<template>
  <div class="bg-card flex gap-5 rounded-2xl p-5">
    <div class="skeleton h-24 w-24 flex-shrink-0 rounded-xl"></div>
    <div class="flex-1 space-y-3">
      <div class="skeleton h-6 w-3/4 rounded"></div>
      <div class="skeleton h-4 w-1/2 rounded"></div>
      <div class="skeleton h-3 w-full rounded"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    var(--secondary) 50%,
    var(--muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
