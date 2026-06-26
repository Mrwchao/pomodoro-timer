import { ref } from 'vue'

export function useStorage(prefix = '') {
  const load = (key) => {
    try {
      const data = localStorage.getItem(`${prefix}${key}`)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
      return null
    }
  }

  const save = (key, value) => {
    try {
      localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }

  const remove = (key) => {
    try {
      localStorage.removeItem(`${prefix}${key}`)
    } catch (e) {
      console.error('Failed to remove from localStorage:', e)
    }
  }

  return { load, save, remove }
}