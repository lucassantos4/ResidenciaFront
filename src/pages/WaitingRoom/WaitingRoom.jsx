import React, { useEffect, useState } from 'react'
import { data, useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import '../../index.css'
import './WaitingRoom.css'


const WaitingRoom = () => {
  const navigate = useNavigate()
  const { code } = useParams()

  const role = localStorage.getItem('role')
  const companyId = localStorage.getItem('companyId')
    const facilitadorToken = localStorage.getItem('facilitadorToken')
  const roomCode = code

  const [companies, setCompanies] = useState([])
  const [connected, setConnected] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCancelRoomModal, setShowCancelRoomModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL)
    // busca lista inicial de empresas
    fetch(`${import.meta.env.VITE_API_URL}/companies/${roomCode}`)
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Erro ao buscar empresas:', err))

    // conecta no socket e entra na sala
    socket.emit('join_room', roomCode)
    setConnected(true)

    // escuta atualizações em tempo real
    socket.on('companies_updated', (updatedCompanies) => {
      setCompanies(updatedCompanies)
    })

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    return () => {
      socket.off('companies_updated')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [roomCode])

  const handleStartGame = async () => {
    // implementar quando fizer o endpoint de iniciar
    console.log('iniciar jogo')
  }

  const handleCancelRoom = async () => {
    setShowCancelRoomModal(true)
  }

  const handleConfirmCancelRoom = async () => {
    console.log(facilitadorToken)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomCode}/cancel`, {
        method: 'PATCH',
        headers: {
          'x-facilitador-token': `${facilitadorToken}`,
        },
      })
      
      setShowCancelRoomModal(false)
      setSuccessMessage('Sala cancelada com sucesso!')
      setShowSuccessModal(true)
      
      setTimeout(() => {
        localStorage.clear()
        navigate('/lobby')
      }, 2000)
    } catch (error) {
      console.error('Erro ao cancelar sala:', error)
      setShowCancelRoomModal(false)
      alert('Erro ao cancelar sala')
    }
  }

  const handleCancelCancelRoom = () => {
    setShowCancelRoomModal(false)
  }

  const handleLeaveRoom = async () => {
    setShowConfirmModal(true)
  }

  const handleConfirmLeave = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies/${companyId}/leave`, {
        method: 'DELETE',
      })
      console.log('Resposta ao sair da sala:', response)
      if (!response.ok) {
        console.error(`Erro ao sair: ${response.status}`)
      }
      
      localStorage.clear()
      navigate('/lobby')
    } catch (error) {
      console.error('Erro ao sair da sala:', error)
      setShowConfirmModal(false)
    }
  }

  const handleCancelLeave = () => {
    setShowConfirmModal(false)
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }


  return (
    <div className="waiting-container">
      <div className="waiting-header">
        <h1>Aguardando Participantes</h1>
        <div className="waiting-room-code">
          <span>Código da sala</span>
          <strong>{roomCode}</strong>
        </div>
      </div>

      <div className="waiting-status">
        <div className={`status-dot ${connected ? '' : 'disconnected'}`} />
        {connected ? 'Conectado em tempo real' : 'Reconectando...'}
      </div>

      <div className="waiting-content">
        <div className="waiting-card">
          <h2>Empresas na sala</h2>
          <p className="companies-count">
            <strong>{companies.length}</strong> empresa{companies.length !== 1 ? 's' : ''} conectada{companies.length !== 1 ? 's' : ''}
          </p>

          <div className="company-list">
            {companies.length === 0 ? (
              <p className="company-empty">Nenhuma empresa entrou ainda...</p>
            ) : (
              companies.map((company) => (
                <div key={company.id} className="company-item">
                  <div className="company-avatar">
                    {getInitials(company.name)}
                  </div>
                  <div className="company-info">
                    <span className="company-name">{company.name}</span>
                    <span className="company-manager">{company.managerName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="waiting-card">
          <h2>{facilitadorToken !=null ? 'Instruções para o Facilitador' : 'Aguarde o início'}</h2>
          <div className="instructions-list">
            {facilitadorToken !=null ? (
              <>
                <div className="instruction-item">
                  <div className="instruction-number">1</div>
                  <p className="instruction-text">Compartilhe o código da sala com os participantes.</p>
                </div>
                <div className="instruction-item">
                  <div className="instruction-number">2</div>
                  <p className="instruction-text">Aguarde todas as empresas entrarem na sala.</p>
                </div>
                <div className="instruction-item">
                  <div className="instruction-number">3</div>
                  <p className="instruction-text">Clique em "Iniciar Jogo" quando todos estiverem prontos.</p>
                </div>
              </>
            ) : (
              <>
                <div className="instruction-item">
                  <div className="instruction-number">1</div>
                  <p className="instruction-text">Você entrou na sala com sucesso!</p>
                </div>
                <div className="instruction-item">
                  <div className="instruction-number">2</div>
                  <p className="instruction-text">Aguarde o facilitador iniciar o jogo.</p>
                </div>
                <div className="instruction-item">
                  <div className="instruction-number">3</div>
                  <p className="instruction-text">Quando o jogo começar você será redirecionado automaticamente.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="waiting-actions">
        {facilitadorToken !=null ? (
          <>
            <button className="btn-cancel" onClick={handleCancelRoom}>
              Cancelar Sala
            </button>
            <button
              className="btn-start"
              onClick={handleStartGame}
              disabled={companies.length === 0}
            >
              Iniciar Jogo
            </button>
          </>
        ) : (
          <button className="btn-leave" onClick={handleLeaveRoom}>
            Sair da Sala
          </button>
        )}
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Sair da Sala?</h2>
            <p>Tem certeza que deseja sair da sala? Você precisará inserir o código novamente para entrar.</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel-modal" 
                onClick={handleCancelLeave}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-leave" 
                onClick={handleConfirmLeave}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelRoomModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cancelar Sala?</h2>
            <p>Tem certeza que deseja cancelar a sala? Todos os participantes serão desconectados.</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel-modal" 
                onClick={handleCancelCancelRoom}
              >
                Não, voltar
              </button>
              <button 
                className="btn-confirm-leave" 
                onClick={handleConfirmCancelRoom}
              >
                Sim, cancelar sala
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-success">
            <div className="success-icon">✓</div>
            <h2>Sucesso!</h2>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WaitingRoom