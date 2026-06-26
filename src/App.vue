<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <h1 class="logo">
          <span class="logo-icon">🍅</span>
          <span class="logo-text">番茄钟</span>
        </h1>
        <button class="btn-settings" @click="showSettings = true" aria-label="设置">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </button>
      </div>
    </header>
    
    <main class="main">
      <Timer 
        :work-duration="settings.workDuration"
        :break-duration="settings.breakDuration"
        :long-break-interval="settings.longBreakInterval"
        :completed-pomodoros="todayPomodoros"
        @pomodoro-complete="handlePomodoroComplete"
      />
      
      <TaskList 
        :tasks="tasks"
        @add-task="addTask"
        @toggle-task="toggleTask"
        @delete-task="deleteTask"
        @update-task="updateTask"
      />
    </main>

    <Settings 
      v-if="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @update="updateSettings"
    />

    <!-- 今日成就提示 -->
    <Transition name="fade">
      <div v-if="showAchievement" class="achievement-toast" @click="showAchievement = false">
        <div class="achievement-content">
          <span class="achievement-icon">🎉</span>
          <span class="achievement-text">今日已完成 {{ todayPomodoros }} 个番茄钟</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Timer from './components/Timer.vue'
import TaskList from './components/TaskList.vue'
import Settings from './components/Settings.vue'
import { useStorage } from './composables/useStorage'
import { useNotification } from './composables/useNotification'

const showSettings = ref(false)
const showAchievement = ref(false)

const settings = ref({
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationEnabled: true
})

const tasks = ref([])
const todayPomodoros = ref(0)
const prevPomodoros = ref(0)

const { load, save } = useStorage('pomodoro-')
const { sendNotification } = useNotification()

onMounted(() => {
  const savedSettings = load('settings')
  const savedTasks = load('tasks')
  const savedStats = load('stats')
  
  if (savedSettings) settings.value = savedSettings
  if (savedTasks) tasks.value = savedTasks
  
  const today = new Date().toDateString()
  if (savedStats?.date !== today) {
    todayPomodoros.value = 0
  } else {
    todayPomodoros.value = savedStats?.count || 0
  }
  
  prevPomodoros.value = todayPomodoros.value
})

watch(todayPomodoros, (newVal, oldVal) => {
  if (newVal > 0 && newVal % 4 === 0 && newVal !== oldVal) {
    showAchievement.value = true
    setTimeout(() => {
      showAchievement.value = false
    }, 3000)
  }
})

const updateSettings = (newSettings) => {
  settings.value = newSettings
  save('settings', settings.value)
}

const addTask = (title) => {
  const task = {
    id: Date.now(),
    title,
    completed: false,
    createdAt: new Date().toISOString()
  }
  tasks.value.push(task)
  save('tasks', tasks.value)
}

const toggleTask = (id) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
    save('tasks', tasks.value)
  }
}

const deleteTask = (id) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
  save('tasks', tasks.value)
}

const updateTask = (id, title) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.title = title
    save('tasks', tasks.value)
  }
}

const handlePomodoroComplete = () => {
  todayPomodoros.value++
  save('stats', { date: new Date().toDateString(), count: todayPomodoros.value })
  
  if (settings.value.notificationEnabled) {
    sendNotification('番茄钟完成！', {
      body: '休息时间到，继续加油！',
      icon: '/favicon.svg'
    })
  }
}
</script>

<style scoped>
.app {
  max-width: 520px;
  margin: 0 auto;
  padding: var(--space-lg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: var(--space-md) 0;
  margin-bottom: var(--space-xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin: 0;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  font: var(--font-display);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-settings {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.btn-settings:hover {
  background: var(--color-bg-body);
  color: var(--color-text-primary);
  transform: rotate(45deg);
}

.btn-settings:active {
  transform: rotate(90deg);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* 成就提示 */
.achievement-toast {
  position: fixed;
  bottom: var(--space-2xl);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text-primary);
  color: white;
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-hover);
  cursor: pointer;
  z-index: 1000;
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font: var(--font-body);
  font-weight: 500;
}

.achievement-icon {
  font-size: 1.2rem;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .app {
    padding: var(--space-md);
  }
  
  .header {
    margin-bottom: var(--space-lg);
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
  
  .btn-settings {
    width: 40px;
    height: 40px;
  }
}
</style>