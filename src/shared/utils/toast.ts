// Simple toast notification system
type ToastType = 'info' | 'success' | 'warning' | 'error'

let toastContainer: HTMLDivElement | null = null

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const container = ensureToastContainer()
  
  const toast = document.createElement('div')
  const bgColor = {
    info: 'bg-blue-600/90',
    success: 'bg-green-600/90',
    warning: 'bg-yellow-600/90',
    error: 'bg-red-600/90',
  }[type]
  
  const textColor = {
    info: 'text-blue-50',
    success: 'text-green-50',
    warning: 'text-yellow-50',
    error: 'text-red-50',
  }[type]
  
  toast.className = `${bgColor} ${textColor} px-4 py-2 rounded-md shadow-lg text-sm pointer-events-auto min-w-[300px] max-w-[500px]`
  toast.textContent = message
  
  container.appendChild(toast)
  
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, duration)
}

