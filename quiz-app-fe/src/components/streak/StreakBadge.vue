<template>
  <div class="streak-badge" :class="[`tier-${tier}`, { 'milestone-pop': showPop }]">
    <div class="streak-icon">
      <span class="flame">{{ tierIcon }}</span>
      <span v-if="streakCount > 0" class="streak-glow" :style="{ background: glowColor }" />
    </div>
    <div class="streak-info">
      <span class="streak-number" :style="{ color: tierColor }">{{ streakCount }}</span>
      <span class="streak-label">{{ compact ? '' : t('streak.days') }}</span>
    </div>
    <div v-if="!compact && tierLabel !== 'Starter'" class="tier-badge" :style="{ background: tierColor }">
      {{ tierLabel }}
    </div>
    <div v-if="showPop" class="milestone-toast">
      {{ t('streak.milestone', { n: streakCount }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  streakCount: number
  compact?: boolean
  milestoneReached?: boolean
}>()

const showPop = ref(false)

watch(() => props.milestoneReached, (val) => {
  if (val) {
    showPop.value = true
    setTimeout(() => { showPop.value = false }, 3000)
  }
})

const tierConfig = computed(() => {
  const s = props.streakCount
  if (s >= 365) return { tier: 'legendary', label: 'Legendary', color: '#9333ea', icon: '👑' }
  if (s >= 200) return { tier: 'diamond',   label: 'Diamond',   color: '#3b82f6', icon: '💎' }
  if (s >= 100) return { tier: 'gold',      label: 'Gold',      color: '#f59e0b', icon: '⚡' }
  if (s >= 50)  return { tier: 'silver',    label: 'Silver',    color: '#94a3b8', icon: '🔥' }
  if (s >= 10)  return { tier: 'bronze',    label: 'Bronze',    color: '#f97316', icon: '🔥' }
  return           { tier: 'starter',   label: 'Starter',   color: '#6b7280', icon: '🔥' }
})

const tier      = computed(() => tierConfig.value.tier)
const tierLabel = computed(() => tierConfig.value.label)
const tierColor = computed(() => tierConfig.value.color)
const tierIcon  = computed(() => tierConfig.value.icon)
const glowColor = computed(() => `radial-gradient(circle, ${tierConfig.value.color}66, transparent)`)
</script>

<style scoped>
.streak-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;
  cursor: default;
}

.streak-icon { position: relative; display: flex; align-items: center; }
.flame { font-size: 1.25rem; line-height: 1; }
.streak-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(8px);
  pointer-events: none;
}

.streak-info { display: flex; align-items: baseline; gap: 3px; }
.streak-number { font-size: 1.1rem; font-weight: 700; line-height: 1; }
.streak-label { font-size: 0.7rem; color: #9ca3af; }

.tier-badge {
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  padding: 1px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tier animations */
.tier-bronze .flame  { animation: flicker 1.5s ease-in-out infinite; }
.tier-silver .flame  { animation: flicker 1.2s ease-in-out infinite, shimmer 2s linear infinite; }
.tier-gold .flame    { animation: flicker 1s ease-in-out infinite; filter: drop-shadow(0 0 6px #f59e0b); }
.tier-diamond .flame { animation: flicker 0.8s ease-in-out infinite; filter: drop-shadow(0 0 8px #3b82f6); }
.tier-legendary .flame {
  animation: legendary-pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 10px #9333ea);
}

.tier-gold      { border-color: #f59e0b44; box-shadow: 0 0 12px #f59e0b22; }
.tier-diamond   { border-color: #3b82f644; box-shadow: 0 0 12px #3b82f622; }
.tier-legendary { border-color: #9333ea44; box-shadow: 0 0 16px #9333ea33; animation: rainbow-border 3s linear infinite; }

@keyframes flicker {
  0%,100% { transform: scale(1) rotate(-2deg); }
  50%      { transform: scale(1.1) rotate(2deg); }
}
@keyframes shimmer {
  0%   { filter: brightness(1); }
  50%  { filter: brightness(1.3); }
  100% { filter: brightness(1); }
}
@keyframes legendary-pulse {
  0%,100% { transform: scale(1); filter: drop-shadow(0 0 10px #9333ea); }
  50%     { transform: scale(1.15); filter: drop-shadow(0 0 18px #ec4899); }
}
@keyframes rainbow-border {
  0%   { border-color: #9333ea44; }
  25%  { border-color: #3b82f644; }
  50%  { border-color: #f59e0b44; }
  75%  { border-color: #ef444444; }
  100% { border-color: #9333ea44; }
}

.milestone-pop { animation: pop 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
@keyframes pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.2); }
  80%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.milestone-toast {
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
  animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s forwards;
  z-index: 10;
}
@keyframes toast-in  { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes toast-out { to   { opacity: 0; transform: translateX(-50%) translateY(-8px); } }
</style>
