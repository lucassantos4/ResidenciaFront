import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useCompanies } from '../../hooks/useCompanies';
import '../../index.css';
import './FacilitadorQuizTime.css';

const FacilitadorQuizTime = () => {
  const navigate = useNavigate();
  const { code } = useParams();

 
  const { companies, loading, erro: erroCarregamento } = useCompanies(code);

  const [acertos, setAcertos] = useState({});
  const [enviando, setEnviando] = useState(false);   
  const [erro, setErro] = useState('');               

  const facilitadorToken = localStorage.getItem('facilitadorToken');

  useEffect(() => {
    if (companies.length > 0) {
      const acertosIniciais = {};
      companies.forEach(company => {
        acertosIniciais[company.id] = 0;
      });
      setAcertos(acertosIniciais);
    }
  }, [companies]);


  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.emit('join_room', code);

    socket.on('all_companies_confirmed', () => {
      navigate(`/facilitador/${code}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [code, navigate]);

 
  const handleAcertosChange = (companyId, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setAcertos(prev => ({ ...prev, [companyId]: numValue }));
  };

  const handleIniciarPartida = async () => {
    
    const totalAcertos = Object.values(acertos).reduce((a, b) => a + b, 0);
    if (totalAcertos === 0) {
      setErro('Insira ao menos um acerto antes de iniciar a partida.');
      return;
    }

    setErro('');
    setEnviando(true); 

    try {
      const resAcertos = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${code}/acertos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-facilitator-token': facilitadorToken,
        },
        body: JSON.stringify(acertos),
      });

      if (!resAcertos.ok) throw new Error('Erro ao salvar acertos');

      const resStart = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${code}/start`, {
        method: 'PATCH',
        headers: {
          'x-facilitator-token': facilitadorToken,
        },
      });

      if (!resStart.ok) throw new Error('Erro ao iniciar a partida');

      navigate(`/facilitador/${code}`);
    } catch (error) {
      console.error('Erro ao iniciar partida:', error);
    
      setErro('Erro ao iniciar a partida. Verifique sua conexão e tente novamente.');
    } finally {
      setEnviando(false); 
    }
  };


  if (loading) {
    return (
      <div className="facilitador-quiz-container">
        <div className="facilitador-quiz-card">
          <div className="facilitador-quiz-loading">
            <div className="spinner"></div>
            <p>Carregando empresas...</p>
          </div>
        </div>
      </div>
    );
  }

 
  if (erroCarregamento) {
    return (
      <div className="facilitador-quiz-container">
        <div className="facilitador-quiz-card">
          <div className="facilitador-quiz-loading">
            <p className="erro-msg">{erroCarregamento}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="facilitador-quiz-container">
      <div className="facilitador-quiz-card">
        <div className="facilitador-quiz-hero">
          <span className="facilitador-quiz-badge">Etapa do facilitador</span>
          <h1>Quiz - Acertos das Empresas</h1>
          <p>Insira a quantidade de acertos de cada empresa para iniciar a partida.</p>
        </div>

        <div className="facilitador-quiz-body">
          <div className="facilitador-quiz-companies">
            {companies.map((company, index) => (
              <div key={company.id} className="facilitador-quiz-company-row">
                <div className="facilitador-quiz-company-info">
                  <span className="facilitador-quiz-company-number">{index + 1}</span>
                  <span className="facilitador-quiz-company-name">{company.name}</span>
                </div>
                <div className="facilitador-quiz-input-wrapper">
                  <label htmlFor={`acertos-${company.id}`}>Acertos:</label>
                  <input
                    type="number"
                    id={`acertos-${company.id}`}
                    min="0"
                    max="10"
                    value={acertos[company.id] ?? 0}
                    onChange={(e) => handleAcertosChange(company.id, e.target.value)}
                    className="facilitador-quiz-input"
                    disabled={enviando}
                  />
                </div>
              </div>
            ))}
          </div>

          {}
          {erro && <p className="erro-msg">{erro}</p>}

          {}
          <button
            className={`facilitador-quiz-btn-iniciar ${enviando ? 'enviando' : ''}`}
            onClick={handleIniciarPartida}
            disabled={enviando}
          >
            {enviando ? (
              <>
                <span className="btn-spinner"></span>
                Iniciando...
              </>
            ) : (
              'Iniciar Partida'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilitadorQuizTime;