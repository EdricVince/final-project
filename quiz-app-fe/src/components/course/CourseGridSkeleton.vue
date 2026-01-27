<template>
  <div class="bg-card rounded-2xl p-5">
    <div class="skeleton mb-4 h-36 w-full rounded-xl"></div>
    <div class="skeleton mb-3 h-6 w-3/4 rounded"></div>
    <div class="skeleton mb-4 h-4 w-1/2 rounded"></div>
    <div class="skeleton h-3 w-full rounded"></div>
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
