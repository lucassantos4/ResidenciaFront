import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../index.css';
import './GerenteQuizTime.css';

const TOTAL_SECONDS = 4;

const GerenteQuizTime = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [countdown, setCountdown] = useState(TOTAL_SECONDS);
    const companyName = localStorage.getItem('companyName') || 'sua empresa';

    useEffect(() => {
        if (!companyId) {
            navigate('/lobby');
            return; // Adicionado para evitar a execução do restante
        }

        const interval = setInterval(() => {
            setCountdown((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [companyId, navigate]);

    useEffect(() => {
        if (countdown === 0) {
            navigate(`/config/${companyId}`); // Corrigido
        }
    }, [countdown, companyId, navigate]);

    const progress = ((TOTAL_SECONDS - countdown) / TOTAL_SECONDS) * 100;

    return (
        <div className="quiztime-container">
            <div className="quiztime-card">
                <div className="quiztime-hero">
                    <span className="quiztime-badge">Etapa do gerente</span>
                    <h1>Hora do Quiz</h1>
                    <p>O jogo começou! Agora é sua vez de planejar as decisões da empresa.</p>
                </div>
                <div className="quiztime-details">
                    <div className="quiztime-info-card">
                        <span className="quiztime-label">Empresa</span>
                        <strong>{companyName}</strong>
                    </div>
                    <div className="quiztime-info-card quiztime-info-highlight">
                        <span className="quiztime-label">Próxima etapa</span>
                        <strong>Configuração da empresa</strong>
                    </div>
                </div>
                <div className="quiztime-body">
                    <p className="quiztime-text">
                        Aguarde um instante. Em breve você será direcionado automaticamente para definir estratégia de estoques, preços e investimentos.
                    </p>
                    <div className="quiztime-progress-bar">
                        <div className="quiztime-progress-fill" style={{ width: `${progress}%` }} /> {/* Corrigido */}
                    </div>
                    <div className="quiztime-countdown" aria-live="polite">
                        <strong>{countdown}</strong> segundo{countdown === 1 ? '' : 's'} para iniciar a configuração.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GerenteQuizTime;