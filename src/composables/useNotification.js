export function useNotification() {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }
    
    if (Notification.permission === 'granted') {
      return true
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    
    return false
  }

  const sendNotification = async (title, options = {}) => {
    const granted = await requestPermission()
    
    if (!granted) {
      console.warn('Notification permission not granted')
      return null
    }

    const defaultOptions = {
      icon: '/favicon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    }

    return new Notification(title, defaultOptions)
  }

  return { requestPermission, sendNotification }
}