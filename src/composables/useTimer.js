import { ref, computed, onUnmounted } from 'vue'

export function useTimer(initialDuration = 25 * 60) {
  const duration = ref(initialDuration)
  const remaining = ref(initialDuration)
  const isRunning = ref(false)
  const isPaused = ref(false)
  let intervalId = null

  const progress = computed(() => {
    return ((duration.value - remaining.value) / duration.value) * 100
  })

  const minutes = computed(() => Math.floor(remaining.value / 60))
  const seconds = computed(() => remaining.value % 60)
  const formattedTime = computed(() => {
    return `${String(minutes.value).padStart(2, '0')}:${String(seconds.value).padStart(2, '0')}`
  })

  const start = () => {
    if (isRunning.value) return
    
    isRunning.value = true
    isPaused.value = false
    
    intervalId = setInterval(() => {
      if (remaining.value > 0) {
        remaining.value--
      } else {
        stop()
      }
    }, 1000)
  }

  const pause = () => {
    if (isRunning.value) {
      isPaused.value = true
      stop()
    }
  }

  const resume = () => {
    if (isPaused.value) {
      start()
    }
  }

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
    isPaused.value = false
  }

  const reset = () => {
    stop()
    remaining.value = duration.value
  }

  const setDuration = (minutes) => {
    duration.value = minutes * 60
    reset()
  }

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  })

  return {
    duration,
    remaining,
    isRunning,
    isPaused,
    progress,
    minutes,
    seconds,
    formattedTime,
    start,
    pause,
    resume,
    stop,
    reset,
    setDuration
  }
}