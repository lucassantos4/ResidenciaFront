import { CheckCircle,AlertTriangle, Info, Loader2, Trash2, X } from 'lucide-react'
import '../assets/css/Modal.css'

const MODAL_CONFIG = {
  confirm: {
    icon: CheckCircle,
    iconClass: 'modal-icon-confirm',
    btnClass: 'modal-btn',
  },
  delete: {
    icon: Trash2,
    iconClass: 'modal-icon-confirm',
    btnClass: 'modal-btn',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'modal-icon-warning',
    btnClass: 'modal-btn',
  },
  info: {
    icon: Info,
    iconClass: 'modal-icon-info',
    btnClass: 'modal-btn',
  },
  loading: {
    icon: Loader2,
    iconClass: 'modal-icon-loading',
    btnClass: '',
  },
}

const Modal = ({
  isOpen,
  type = 'confirm',
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  const config = MODAL_CONFIG[type]
  const Icon = config.icon

  return (
    <div className="modal-overlay" onClick={type !== 'loading' ? onCancel : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {type !== 'loading' && onCancel && (
          <button className="modal-close" onClick={onCancel}>
            <X size={18} />
          </button>
        )}

        <div className={`modal-icon ${config.iconClass}`}>
          <Icon
            size={28}
            strokeWidth={1.8}
            className={type === 'loading' ? 'modal-spin-icon' : ''}
          />
        </div>

        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        {type !== 'loading' && (
          <div className="modal-actions">
            {onCancel && (
              <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
                {cancelText}
              </button>
            )}
            {onConfirm && (
              <button className={`modal-btn ${config.btnClass}`} onClick={onConfirm}>
                {confirmText}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Modal