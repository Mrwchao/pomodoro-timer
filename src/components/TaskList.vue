<template>
  <div class="task-list card">
    <div class="task-header">
      <h2 class="task-title">任务清单</h2>
      <span class="task-count" v-if="tasks.length">{{ completedCount }}/{{ tasks.length }}</span>
    </div>

    <div class="add-task">
      <input
        v-model="newTaskTitle"
        type="text"
        placeholder="添加新任务..."
        @keyup.enter="handleAddTask"
      />
      <button 
        class="btn-add" 
        @click="handleAddTask" 
        :disabled="!newTaskTitle.trim()"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>
    </div>

    <transition-group name="task" tag="ul" class="tasks">
      <li 
        v-for="task in tasks" 
        :key="task.id"
        :class="['task-item', { completed: task.completed }]"
      >
        <label class="task-checkbox">
          <input
            type="checkbox"
            :checked="task.completed"
            @change="$emit('toggle-task', task.id)"
          />
          <span class="checkmark">
            <svg v-if="task.completed" viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </span>
        </label>
        
        <input
          v-if="editingTaskId === task.id"
          ref="editInput"
          v-model="editingTitle"
          class="task-edit-input"
          @blur="saveEdit(task.id)"
          @keyup.enter="saveEdit(task.id)"
          @keyup.escape="cancelEdit"
        />
        <span 
          v-else 
          class="task-title-text"
          @dblclick="startEdit(task)"
        >
          {{ task.title }}
        </span>
        
        <div class="task-actions">
          <button 
            class="btn-action" 
            @click="startEdit(task)" 
            title="编辑"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button 
            class="btn-action btn-delete" 
            @click="$emit('delete-task', task.id)" 
            title="删除"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </li>
    </transition-group>

    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p>暂无任务，开始添加吧</p>
    </div>

    <div v-else-if="completedCount > 0" class="task-footer">
      <button class="clear-completed" @click="clearCompleted">
        清除已完成
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  tasks: { type: Array, required: true }
})

const emit = defineEmits(['add-task', 'toggle-task', 'delete-task', 'update-task'])

const newTaskTitle = ref('')
const editingTaskId = ref(null)
const editingTitle = ref('')
const editInput = ref(null)

const completedCount = computed(() => {
  return props.tasks.filter(t => t.completed).length
})

const handleAddTask = () => {
  const title = newTaskTitle.value.trim()
  if (title) {
    emit('add-task', title)
    newTaskTitle.value = ''
  }
}

const startEdit = async (task) => {
  editingTaskId.value = task.id
  editingTitle.value = task.title
  await nextTick()
  if (editInput.value) {
    editInput.value.focus()
  }
}

const saveEdit = (id) => {
  if (editingTaskId.value === id) {
    const title = editingTitle.value.trim()
    if (title) {
      emit('update-task', id, title)
    }
    cancelEdit()
  }
}

const cancelEdit = () => {
  editingTaskId.value = null
  editingTitle.value = ''
}

const clearCompleted = () => {
  props.tasks.filter(t => t.completed).forEach(t => {
    emit('delete-task', t.id)
  })
}
</script>

<style scoped>
.task-list {
  padding: var(--space-xl);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.task-title {
  font: var(--font-title);
  color: var(--color-text-primary);
}

.task-count {
  font: var(--font-caption);
  color: var(--color-text-muted);
  background: var(--color-bg-body);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
}

.add-task {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.add-task input {
  flex: 1;
  height: 48px;
}

.btn-add {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.btn-add:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-add:disabled {
  background: var(--color-border-light);
  cursor: not-allowed;
  transform: none;
}

.tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-sm);
  background: var(--color-bg-body);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.task-item:hover {
  border-color: rgba(255, 107, 107, 0.2);
  box-shadow: var(--shadow-soft);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title-text {
  text-decoration: line-through;
}

.task-checkbox {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.task-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid var(--color-border-subtle);
  border-radius: 6px;
  background: var(--color-bg-card);
  transition: all 0.2s ease;
}

.task-checkbox input:checked ~ .checkmark {
  background: var(--color-success);
  border-color: var(--color-success);
}

.task-checkbox input:checked ~ .checkmark svg {
  opacity: 1;
  transform: scale(1);
}

.checkmark svg {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.task-title-text {
  flex: 1;
  cursor: pointer;
  word-break: break-word;
  font: var(--font-body);
  color: var(--color-text-primary);
  transition: color 0.2s ease;
}

.task-item:hover .task-title-text {
  color: var(--color-primary);
}

.task-edit-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font: var(--font-body);
  outline: none;
  background: var(--color-bg-card);
}

.task-actions {
  display: flex;
  gap: var(--space-xs);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: var(--color-border-light);
  color: var(--color-text-primary);
}

.btn-delete:hover {
  background: rgba(231, 76, 60, 0.1);
  color: var(--color-danger);
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl) var(--space-lg);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.empty-state p {
  font: var(--font-body);
  color: var(--color-text-muted);
}

.task-footer {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.clear-completed {
  font: var(--font-caption);
  color: var(--color-text-secondary);
  background: none;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.clear-completed:hover {
  color: var(--color-danger);
  background: rgba(231, 76, 60, 0.1);
}

/* 任务列表动画 */
.task-enter-active {
  animation: taskSlideIn 0.3s var(--ease-out-quart);
}

.task-leave-active {
  animation: taskSlideOut 0.3s var(--ease-in-out);
}

.task-move {
  transition: transform 0.3s var(--ease-out-quart);
}

@keyframes taskSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes taskSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .task-list {
    padding: var(--space-lg);
  }
  
  .add-task {
    flex-direction: row;
  }
  
  .add-task input {
    height: 44px;
  }
  
  .btn-add {
    width: 44px;
    height: 44px;
  }
  
  .task-item {
    padding: var(--space-sm) var(--space-md);
    flex-wrap: wrap;
  }
  
  .task-actions {
    opacity: 1;
    width: 100%;
    justify-content: flex-end;
    margin-top: var(--space-sm);
    padding-top: var(--space-sm);
    border-top: 1px dashed var(--color-border-light);
  }
  
  .btn-action {
    width: 36px;
    height: 36px;
  }
}
</style>