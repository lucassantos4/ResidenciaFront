import React, { createContext, useContext, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import '../assets/css/Toast.css'

const ToastContext = createContext()

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    className: 'toast',
  },
  error: {
    icon: XCircle,
    className: 'toast',
  },
  warning: {
    icon: AlertTriangle,
    className: 'toast',
  },
  info: {
    icon: Info,
    className: 'toast',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => {
          const config = TOAST_CONFIG[toast.type]
          const Icon = config.icon

          return (
            <div key={toast.id} className={`toast ${config.className}`}>
              <div className="toast-icon">
                <Icon size={18} strokeWidth={2} />
              </div>
              <span className="toast-message">{toast.message}</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}