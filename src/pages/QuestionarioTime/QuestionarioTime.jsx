import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../index.css';
import './QuestionarioTime.css';

const QuestionarioTime = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [isReady, setIsReady] = useState(false);
  const [isSubmittingReady, setIsSubmittingReady] = useState(false);
  const [gameReleased, setGameReleased] = useState(false);

  const companyName = localStorage.getItem('companyName') || 'sua empresa';
  const playerName = localStorage.getItem('playerName') || 'participante';
  const roomCode = localStorage.getItem('codeRoom');

  useEffect(() => {
    if (!companyId) {
      navigate('/lobby');
    }
  }, [companyId, navigate]);

  useEffect(() => {
    if (!roomCode) {
      return;
    }

    const socket = io(import.meta.env.VITE_API_URL);
    socket.emit('join_room', roomCode);

    socket.on('game_started', () => {
      setGameReleased(true);
    });

    return () => {
      socket.off('game_started');
      socket.disconnect();
    };
  }, [roomCode]);

  useEffect(() => {
    if (isReady && gameReleased) {
      navigate(`/config/${companyId}`);
    }
  }, [isReady, gameReleased, companyId, navigate]);

  const handleReady = async () => {
    if (!companyId || !roomCode || isReady || isSubmittingReady) {
      return;
    }

    setIsSubmittingReady(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies/${companyId}/ready`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomCode }),
      });

      // Permite continuidade mesmo quando o backend não tiver o endpoint novo.
      if (!response.ok && response.status !== 404) {
        throw new Error('Falha ao confirmar que você está pronto.');
      }

      setIsReady(true);
      if (gameReleased) {
        navigate(`/config/${companyId}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingReady(false);
    }
  };

  return (
    <div className="questionario-container">
      <div className="questionario-card">
        <div className="questionario-hero">
          <span className="questionario-badge">Etapa liberada</span>
          <h1>Hora do questionário</h1>
          <p>
            Chegou o momento de responder às perguntas e avançar para a próxima fase da experiência.
          </p>
        </div>

        <div className="questionario-details">
          <div className="questionario-info-card">
            <span className="questionario-label">Sua empresa</span>
            <strong>{companyName}</strong>
          </div>
          <div className="questionario-info-card questionario-info-highlight">
            <span className="questionario-label">Participante</span>
            <strong>{playerName}</strong>
          </div>
        </div>

        <div className="questionario-body">
          <p className="questionario-text">
            O facilitador ativou a etapa do questionário. Clique em "Estou pronto" e aguarde o facilitador iniciar o jogo.
          </p>

          <div className="questionario-callout">
            <div className="questionario-callout-icon">?</div>
            <div>
              <strong>Responda com atenção</strong>
              <span>As perguntas vão guiar a sua jornada nesta rodada.</span>
            </div>
          </div>

          <button className="questionario-button" type="button" onClick={handleReady} disabled={isReady || isSubmittingReady}>
            {isSubmittingReady ? 'Confirmando...' : isReady ? 'Pronto! Aguarde o facilitador' : 'Estou pronto'}
          </button>

          {isReady && (
            <p className="questionario-feedback" aria-live="polite">
              Presença confirmada. Você será redirecionado quando o facilitador iniciar o jogo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionarioTime;