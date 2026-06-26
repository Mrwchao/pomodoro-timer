<template>
  <div class="timer card">
    <div class="timer-modes">
      <button 
        :class="['mode-btn', { active: currentMode === 'work' }]"
        @click="setMode('work')"
      >
        工作
      </button>
      <button 
        :class="['mode-btn', { active: currentMode === 'shortBreak' }]"
        @click="setMode('shortBreak')"
      >
        短休息
      </button>
      <button 
        :class="['mode-btn', { active: currentMode === 'longBreak' }]"
        @click="setMode('longBreak')"
      >
        长休息
      </button>
    </div>

    <div class="timer-display" :class="currentMode">
      <svg class="progress-ring" viewBox="0 0 140 140">
        <defs>
          <linearGradient :id="'gradient-' + currentMode" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :stop-color="gradientColors.start" />
            <stop offset="100%" :stop-color="gradientColors.end" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle 
          class="progress-ring-bg"
          cx="70" 
          cy="70" 
          r="62"
        />
        <circle 
          class="progress-ring-fill"
          cx="70" 
          cy="70" 
          r="62"
          :stroke="gradientUrl"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="timer-text">
        <span class="time" :class="currentMode">{{ timer.formattedTime.value }}</span>
      </div>
    </div>

    <div class="timer-controls">
      <button 
        v-if="!timer.isRunning.value && !timer.isPaused.value"
        class="btn-primary"
        @click="timer.start()"
      >
        开始专注
      </button>
      <button 
        v-else-if="timer.isPaused.value"
        class="btn-success"
        @click="timer.resume()"
      >
        继续
      </button>
      <button 
        v-else
        class="btn-warning"
        @click="timer.pause()"
      >
        暂停
      </button>
      <button 
        class="btn-secondary"
        @click="handleReset"
      >
        <svg class="icon-reset" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      </button>
    </div>

    <div class="pomodoro-count">
      <span 
        v-for="i in longBreakInterval" 
        :key="i" 
        :class="['pomodoro-dot', { completed: i <= completedPomodoros % longBreakInterval || completedPomodoros >= longBreakInterval }]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useTimer } from '../composables/useTimer'

const props = defineProps({
  workDuration: { type: Number, default: 25 },
  breakDuration: { type: Number, default: 5 },
  longBreakDuration: { type: Number, default: 15 },
  longBreakInterval: { type: Number, default: 4 },
  completedPomodoros: { type: Number, default: 0 }
})

const emit = defineEmits(['pomodoro-complete'])

const currentMode = ref('work')

const timer = useTimer(props.workDuration * 60)

const circumference = 2 * Math.PI * 62

const gradientColors = computed(() => {
  switch (currentMode.value) {
    case 'work': return { start: '#ff6b6b', end: '#ee5a5a' }
    case 'shortBreak': return { start: '#4ecdc4', end: '#45b7aa' }
    case 'longBreak': return { start: '#a8e6cf', end: '#8dd9bd' }
    default: return { start: '#ff6b6b', end: '#ee5a5a' }
  }
})

const gradientUrl = computed(() => `url(#gradient-${currentMode.value})`)

const dashOffset = computed(() => {
  return circumference * (1 - timer.progress.value / 100)
})

const setMode = (mode) => {
  currentMode.value = mode
  let duration
  
  switch (mode) {
    case 'work': duration = props.workDuration; break
    case 'shortBreak': duration = props.breakDuration; break
    case 'longBreak': duration = props.longBreakDuration; break
  }
  
  timer.setDuration(duration)
}

const handleReset = () => {
  setMode(currentMode.value)
}

// 监听计时器完成
watch(
  () => timer.remaining.value,
  (newVal, oldVal) => {
    if (newVal === 0 && oldVal === 1) {
      playSound()
      emit('pomodoro-complete')
      
      if (currentMode.value === 'work') {
        setMode('shortBreak')
      } else {
        setMode('work')
      }
    }
  }
)

const playSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2chol8gImUn5+UhnVqbHV+i5CTkYqAd3N2gImQmJmPfn16dXyDi5CbmY99fnl1fISLj5eZh4B+e3V7hYyQl5eHgoF6dXyFi4+WloaBgXp1fIWKj5aWhoKBenV8hYiOlpaFgoF6dXyFiY2VloSCgXp1fIWIjJWVhIKBenV8hYeMlJWEgoF6dXyFiIyUlYSCgXp1fIWIjJOUhIKBenV8hYeLkpSEgoF6dXyFiIyTkoSCgXp1fIWIjJGRhIKBenV8hYaKkpOEgoF6dXyFhoySk4SCgXp1fIWGiZKTg4F6dXyFhomSk4OBenV8hYaIkpODgXp1fIWGh4+Rg4F6dXyFhoePkoF6dXyFhoePkoF6dXyFhoePkoF6dXyFhoePkYCAgICAgICAgICAgICAf39/f39/f39/fw==')
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch (e) {}
}

watch(
  () => [props.workDuration, props.breakDuration, props.longBreakDuration],
  () => {
    if (!timer.isRunning.value && !timer.isPaused.value) {
      setMode(currentMode.value)
    }
  }
)
</script>

<style scoped>
.timer {
  text-align: center;
  padding: var(--space-2xl) var(--space-xl);
  position: relative;
  overflow: hidden;
}

.timer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(
    180deg, 
    rgba(255, 107, 107, 0.06) 0%, 
    transparent 100%
  );
  pointer-events: none;
}

.timer-modes {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
  position: relative;
  z-index: 1;
}

.mode-btn {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  background: var(--color-bg-body);
  border-radius: var(--radius-full);
  font: var(--font-body);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s var(--ease-out-quart);
}

.mode-btn.active {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-button);
}

.mode-btn:hover:not(.active) {
  background: var(--color-border-light);
  color: var(--color-text-primary);
}

.timer-display {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto var(--space-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-ring-bg {
  fill: none;
  stroke: var(--color-border-light);
  stroke-width: 6;
}

.progress-ring-fill {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 389.6;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.5s linear, stroke 0.4s ease;
  filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.3));
}

.timer-text {
  position: relative;
  z-index: 1;
}

.time {
  font: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  transition: color 0.3s ease;
}

.time.work { color: var(--color-work); }
.time.short-break { color: var(--color-short-break); }
.time.long-break { color: var(--color-long-break); }

.timer-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  position: relative;
  z-index: 1;
}

.btn-primary {
  padding: 14px 36px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font: var(--font-body);
  font-weight: 600;
  box-shadow: var(--shadow-button);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-2px);
}

.btn-success {
  padding: 14px 36px;
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-md);
  font: var(--font-body);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-success:hover {
  background: #219a52;
  transform: translateY(-2px);
}

.btn-warning {
  padding: 14px 36px;
  background: var(--color-warning);
  color: white;
  border-radius: var(--radius-md);
  font: var(--font-body);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn-warning:hover {
  background: #d68910;
  transform: translateY(-2px);
}

.btn-secondary {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-body);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-soft);
}

.btn-secondary:hover {
  background: var(--color-border-light);
  color: var(--color-text-primary);
  transform: translateY(-2px);
}

.icon-reset {
  transition: transform 0.3s ease;
}

.btn-secondary:active .icon-reset {
  transform: rotate(180deg);
}

.pomodoro-count {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  position: relative;
  z-index: 1;
}

.pomodoro-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-border-light);
  transition: all 0.4s var(--ease-out-quart);
}

.pomodoro-dot.completed {
  background: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary-glow);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .timer {
    padding: var(--space-xl) var(--space-lg);
  }
  
  .timer-modes {
    gap: var(--space-xs);
  }
  
  .mode-btn {
    padding: var(--space-xs) var(--space-md);
    font-size: 0.813rem;
  }
  
  .timer-display {
    width: 180px;
    height: 180px;
  }
  
  .time {
    font-size: 2.2rem;
  }
  
  .timer-controls {
    gap: var(--space-sm);
  }
  
  .btn-primary,
  .btn-success,
  .btn-warning {
    padding: 12px 24px;
    font-size: 0.875rem;
  }
  
  .btn-secondary {
    width: 44px;
    height: 44px;
  }
}
</style>