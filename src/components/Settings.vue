<template>
  <div class="settings-overlay" @click.self="$emit('close')">
    <div class="settings-modal">
      <div class="settings-header">
        <h2>设置</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="settings-content">
        <div class="setting-group">
          <h3>时长设置</h3>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">工作时长</span>
              <span class="label-value">{{ localSettings.workDuration }} 分钟</span>
            </div>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="localSettings.workDuration"
                min="1"
                max="60"
                step="1"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">短休息时长</span>
              <span class="label-value">{{ localSettings.breakDuration }} 分钟</span>
            </div>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="localSettings.breakDuration"
                min="1"
                max="30"
                step="1"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">长休息时长</span>
              <span class="label-value">{{ localSettings.longBreakDuration }} 分钟</span>
            </div>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="localSettings.longBreakDuration"
                min="5"
                max="45"
                step="1"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <span class="label-text">长休息间隔</span>
              <span class="label-value">每 {{ localSettings.longBreakInterval }} 个番茄</span>
            </div>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="localSettings.longBreakInterval"
                min="2"
                max="8"
                step="1"
              />
            </div>
          </div>
        </div>

        <div class="setting-group">
          <h3>通知与提醒</h3>
          
          <div class="setting-item toggle">
            <div class="toggle-label">
              <span class="toggle-icon">🔔</span>
              <span class="label-text">桌面通知</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="localSettings.notificationEnabled" />
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item toggle">
            <div class="toggle-label">
              <span class="toggle-icon">🔊</span>
              <span class="label-text">提示音</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="localSettings.soundEnabled" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-group">
          <h3>数据管理</h3>
          <button class="btn-danger" @click="clearAllData">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            清除所有数据
          </button>
        </div>
      </div>

      <div class="settings-footer">
        <button class="btn-primary" @click="saveSettings">
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  settings: { type: Object, required: true }
})

const emit = defineEmits(['close', 'update'])

const localSettings = ref({ ...props.settings })

watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = { ...newSettings }
  },
  { deep: true }
)

const saveSettings = () => {
  emit('update', { ...localSettings.value })
  emit('close')
}

const clearAllData = () => {
  if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
    localStorage.clear()
    location.reload()
  }
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 52, 54, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.settings-modal {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  animation: modalSlide 0.3s var(--ease-out-quart);
}

@keyframes modalSlide {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.settings-header h2 {
  margin: 0;
  font: var(--font-title);
  color: var(--color-text-primary);
}

.close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-bg-body);
  color: var(--color-text-primary);
}

.settings-content {
  padding: var(--space-xl);
}

.setting-group {
  margin-bottom: var(--space-2xl);
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group h3 {
  font: var(--font-caption);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-lg);
}

.setting-item {
  margin-bottom: var(--space-lg);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.label-text {
  font: var(--font-body);
  color: var(--color-text-primary);
}

.label-value {
  font: var(--font-caption);
  font-weight: 600;
  color: var(--color-primary);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.slider-container input[type="range"] {
  flex: 1;
  height: 6px;
  appearance: none;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: var(--shadow-button);
  transition: transform 0.2s ease;
}

.slider-container input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.setting-item.toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.toggle-icon {
  font-size: 1.1rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border-subtle);
  transition: 0.3s var(--ease-out-quart);
  border-radius: var(--radius-full);
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s var(--ease-out-quart);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  color: var(--color-danger);
  border: 2px solid var(--color-danger);
  border-radius: var(--radius-md);
  font: var(--font-body);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: var(--color-danger);
  color: white;
}

.settings-footer {
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--color-border-light);
}

.btn-primary {
  width: 100%;
  padding: var(--space-md) var(--space-xl);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font: var(--font-body);
  font-weight: 600;
  box-shadow: var(--shadow-button);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-2px);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .settings-modal {
    max-height: 80vh;
  }
  
  .settings-content {
    padding: var(--space-lg);
  }
  
  .setting-group {
    margin-bottom: var(--space-xl);
  }
}
</style>