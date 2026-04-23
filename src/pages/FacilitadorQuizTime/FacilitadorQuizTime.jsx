import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../index.css';
import './FacilitadorQuizTime.css';

const FacilitadorQuizTime = () => {
    const navigate = useNavigate();
    const { code } = useParams();
    const [companies, setCompanies] = useState([]);
    const [acertos, setAcertos] = useState({});
    const [loading, setLoading] = useState(true);
    const facilitadorToken = localStorage.getItem('facilitadorToken');

    useEffect(() => {
        // Buscar empresas da sala
        fetch(`${import.meta.env.VITE_API_URL}/companies/${code}`)
            .then(res => res.json())
            .then(data => {
                setCompanies(data);
                // Inicializar acertos com 0 para cada empresa
                const acertosIniciais = {};
                data.forEach(company => {
                    acertosIniciais[company.id] = 0;
                });
                setAcertos(acertosIniciais);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro ao buscar empresas:', err);
                setLoading(false);
            });

        // Conectar ao socket para ouvir eventos
        const socket = io(import.meta.env.VITE_API_URL);
        socket.emit('join_room', code);

        socket.on('all_companies_confirmed', () => {
            // Quando todas as empresas confirmarem, ir para o dashboard
            navigate(`/facilitador/${code}`);
        });

        return () => {
            socket.disconnect();
        };
    }, [code, navigate]);

    const handleAcertosChange = (companyId, value) => {
        const numValue = parseInt(value) || 0;
        setAcertos(prev => ({
            ...prev,
            [companyId]: numValue
        }));
    };

    const handleIniciarPartida = async () => {
        try {
            // Enviar os acertos para o backend
            await fetch(`${import.meta.env.VITE_API_URL}/rooms/${code}/acertos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-facilitator-token': facilitadorToken,
                },
                body: JSON.stringify(acertos),
            });

            // Iniciar o jogo
            await fetch(`${import.meta.env.VITE_API_URL}/rooms/${code}/start`, {
                method: 'PATCH',
                headers: {
                    'x-facilitator-token': facilitadorToken,
                },
            });
        } catch (error) {
            console.error('Erro ao iniciar partida:', error);
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
                                        value={acertos[company.id] || 0}
                                        onChange={(e) => handleAcertosChange(company.id, e.target.value)}
                                        className="facilitador-quiz-input"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        className="facilitador-quiz-btn-iniciar"
                        onClick={handleIniciarPartida}
                    >
                        Iniciar Partida
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacilitadorQuizTime;