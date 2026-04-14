import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../index.css';
import '../../assets/css/RoomConfig.css';
import './FacilitadorDashboard.css';
import { io } from 'socket.io-client'
import Modal from '../../components/Modal'

const FacilitadorDashboard = () => {
  const { code } = useParams();
  const [configRoom, setConfigRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState(false);
  const [error, setError] = useState(null);
  const [roundAtual, setRoundAtual] = useState(1);
  const [resultado, setResultado] = useState([]);
  const [companies, setCompanies] = useState([]);
  const facilitadorToken = localStorage.getItem('facilitadorToken')

  const readyCount = companies.filter((company) => company.ready).length;
  const totalParticipants = companies.length;
  // Buscar dados da sala
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.emit('join_room', code);

    fetch(`${import.meta.env.VITE_API_URL}/companies/${code}`)
      .then((response) => response.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao buscar empresas:', err));

    socket.on('connect', () => console.log('Socket conectado:', socket.id));
    socket.on('disconnect', () => console.log('Socket desconectado'));

    socket.on('companies_updated', (updatedCompanies) => {
      console.log('Empresas atualizadas:', updatedCompanies);
      setCompanies(updatedCompanies);
    });

    socket.on('participants_ready_updated', ({ ready, total }) => {
      setCompanies((prev) => {
        if (prev.length === total) {
          const next = [...prev];
          for (let i = 0; i < next.length; i += 1) {
            next[i] = { ...next[i], ready: i < ready };
          }
          return next;
        }
        return prev;
      });
    });

    return () => {
      socket.off('companies_updated');
      socket.off('participants_ready_updated');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [code]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/rooms/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar dados da sala');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Dados da sala recebidos:', data);
        setConfigRoom(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar os dados da sala. Por favor, tente novamente mais tarde.');
      });
  }, [code]);
  useEffect(() => {
    console.log('Buscando dados da sala com código:', code);
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/rooms/${code}/resultado/${roundAtual}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-facilitator-token': `${facilitadorToken}`,

      },
    })
      .then((response) => {
        if (!response.ok) {
          setWarning(true);
          setTimeout(() => setWarning(false), 4500);
          throw new Error('Erro ao buscar dados da sala');
        }

        return response.json();
      })
      .then((data) => {
        console.log('Dados da sala recebidos:', data);
        setResultado(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar os dados da sala. Por favor, tente novamente mais tarde.');
        setLoading(false);
      });

  }, [code]);


  const fmt = (v) => {
    if (v === undefined || v === null || isNaN(v)) return 'R$ 0,00';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const fmtPercent = (v) => {
    if (v === undefined || v === null || isNaN(v)) return '0%';
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + '%';
  };


  return (
    <div className="config-container">
      {/* Sidebar */}
      <aside className="config-sidebar">
        <div className="sidebar-top">
          <h1 className="config-title">Dashboard<br />do Facilitador</h1>
          <span className="config-title-accent" />
          <p className="config-subtitle">
            Acompanhe os resultados e o ranking das empresas em tempo real.
          </p>
        </div>

        <div className="dash-info-card">
          <span className="dash-info-label">Sala</span>
          <strong className="dash-info-value">{code}</strong>
        </div>

        <div className="dash-info-card">
          <span className="dash-info-label">Empresas Conectadas</span>
          <strong className="dash-info-value">{totalParticipants}</strong>
        </div>

        <div className="dash-info-card">
          <span className="dash-info-label">Participantes Prontos</span>
          <strong className="dash-info-value">{readyCount} / {totalParticipants}</strong>
        </div>

        <div className="dash-info-card">
          <span className="dash-info-label">Rodada Atual</span>
          <strong className="dash-info-value">{roundAtual} / {resultado.totalRounds || '—'}</strong>
        </div>
      </aside>

      {/* Painel principal */}
      <div className="config-main">
        <div className="config-content">
          {/* SEÇÃO 1: Resultados das Empresas */}
          <section className="config-section">
            <h3 className="section-subtitle">Resultados das Empresas</h3>
            <div className="dash-table">
              <div className="dash-table-header">
                <span>Empresa</span>
                <span className="dash-center">Preço Médio<br />da Cesta</span>
                <span className="dash-center">Disponibilidade</span>
                <span className="dash-center">CSAT</span>
                <span className="dash-center">% Part. Demanda<br />de Vendas</span>
              </div>
              {resultado.length === 0 && !loading && (
                <div className="dash-table-empty">Nenhuma empresa encontrada.</div>
              )}
              {resultado.map((empresa, index) => (
                <div className="dash-table-row" key={empresa.id || empresa.name || index}>
                  <span className="dash-empresa-name">{empresa.company.name}</span>
                  <span className="dash-center">{fmt(empresa.precoMedioCesta)}</span>
                  <span className="dash-center">{fmtPercent(empresa.disponibilidade)}</span>
                  <span className="dash-center">{fmtPercent(empresa.csat)}</span>
                  <span className="dash-center">{fmtPercent(empresa.percentualDemanda * 100)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SEÇÃO 2: Ranking */}
          <section className="config-section">
            <h3 className="section-subtitle">Ranking</h3>
            <div className="dash-table">
              <div className="dash-table-header dash-ranking-header">
                <span>Colocação</span>
                <span>Empresa</span>
                <span>Gerente</span>
                <span className="dash-center">Total de Vendas</span>
              </div>
              {resultado.map((empresa, index) => {
                return (
                  <div className={`dash-table-row dash-ranking-row ${index === 0 ? 'dash-row-first' : ''}`} key={empresa.id || empresa.name || index}>
                    <span className="dash-position">{index + 1}°</span>
                    <span className="dash-empresa-name">{empresa.company.name || `Empresa ${index + 1}`}</span>
                    <span>{empresa.company.managerName || '—'}</span>
                    <span className="dash-center dash-total-score">
                      <strong>{fmt(empresa.receitaTotal)}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SEÇÃO 3: Vendas por Rodada */}
          <section className="config-section">
            <h3 className="section-subtitle">Demanda de vendas da rodada</h3>

            {/* Demanda do round */}
            <div className="dash-table" style={{ marginBottom: 20 }}>
              <div className="dash-table-header dash-demanda-header">
                <span>Rodada</span>
                <span className="dash-center">Perecíveis</span>
                <span className="dash-center">Mercearia</span>
                <span className="dash-center">Eletro</span>
                <span className="dash-center">Hipel</span>
                <span className="dash-center">Total</span>
              </div>
              {configRoom ? (
                <div className="dash-table-row dash-demanda-row">
                  <span className="dash-empresa-name">Rodada {roundAtual} - {configRoom.demandaEstqRounds?.[roundAtual - 1] || 0}%</span>
                  <span className="dash-center">
                    {(
                      (configRoom.estoqueDisponivelPereciveis || 0) *
                      ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100)
                    ).toLocaleString('pt-BR')}
                  </span>
                  <span className="dash-center">
                    {(
                      (configRoom.estoqueDisponivelMercearia || 0) *
                      ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100)
                    ).toLocaleString('pt-BR')}
                  </span>
                  <span className="dash-center">
                    {(
                      (configRoom.estoqueDisponivelEletro || 0) *
                      ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100)
                    ).toLocaleString('pt-BR')}
                  </span>
                  <span className="dash-center">
                    {(
                      (configRoom.estoqueDisponivelHipel || 0) *
                      ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100)
                    ).toLocaleString('pt-BR')}
                  </span>
                  <span className="dash-center">
                    <strong>
                      {(
                        ((configRoom.estoqueDisponivelPereciveis || 0) * ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100)) +
                        ((configRoom.estoqueDisponivelMercearia || 0) * ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100)) +
                        ((configRoom.estoqueDisponivelEletro || 0) * ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100)) +
                        ((configRoom.estoqueDisponivelHipel || 0) * ((configRoom.demandaEstqRounds?.[roundAtual - 1] || 0) / 100))
                      ).toLocaleString('pt-BR')}
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="dash-table-empty">Carregando demanda...</div>
              )}
            </div>
          </section>

          {/* Vendas por empresa */}
          <section className="config-section">
            <h3 className="section-subtitle">Vendas por Empresa</h3>
            <div className="dash-table">

              <div className="dash-table-header dash-vendas-header">
                <span>Empresa</span>
                <span className="dash-center">Perecíveis</span>
                <span className="dash-center">Mercearia</span>
                <span className="dash-center">Eletro</span>
                <span className="dash-center">Hipel</span>
                <span className="dash-center">Total estoque vendido</span>
              </div>
              {resultado.map((empresa, index) => {
                return (
                  <div className="dash-table-row dash-vendas-row" key={empresa.id || empresa.company.name || index}>
                    <span className="dash-empresa-name">{empresa.company.name || `Empresa ${index + 1}`}</span>
                    <span className="dash-center">{(empresa.qtdVendidaPereciveis || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center">{(empresa.qtdVendidaMercearia || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center">{(empresa.qtdVendidaEletro || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center">{(empresa.qtdVendidaHipel || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center dash-total-score">
                      <strong>{(empresa.qtdVendidaPereciveis + empresa.qtdVendidaMercearia + empresa.qtdVendidaHipel + empresa.qtdVendidaEletro)}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="config-section">
            <h3 className="section-subtitle">Receita detalhada por empresa</h3>
            <div className="dash-table">

              <div className="dash-table-header dash-vendas-header">
                <span>Empresa</span>
                <span className="dash-center">Perecíveis</span>
                <span className="dash-center">Mercearia</span>
                <span className="dash-center">Eletro</span>
                <span className="dash-center">Hipel</span>
                <span className="dash-center">Total estoque vendido</span>
              </div>
              {resultado.map((empresa, index) => {
                return (
                  <div className="dash-table-row dash-vendas-row" key={empresa.id || empresa.company.name || index}>
                    <span className="dash-empresa-name">{empresa.company.name || `Empresa ${index + 1}`}</span>
                    <span className="dash-center">{fmt(empresa.receitaPereciveis || 0)}</span>
                    <span className="dash-center">{fmt(empresa.receitaMercearia || 0)}</span>
                    <span className="dash-center">{fmt(empresa.receitaEletro || 0)}</span>
                    <span className="dash-center">{fmt(empresa.receitaHipel || 0)}</span>
                    <span className="dash-center dash-total-score">
                      <strong>{fmt(empresa.receitaTotal)}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          {facilitadorToken && (
            <div className="waiting-actions">
              <button className="btn-start" disabled>
                Próxima rodada (em preparação)
              </button>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={loading}
        type="loading"
        title="Carregando Dashboard"
        message="Aguarde enquanto os dados são carregados..."
      />
      <Modal
        isOpen={warning}
        type="warning"
        title="Erro ao Carregar Dados"
        message="Não foi possível carregar os dados da sala. Por favor, tente novamente mais tarde."
      />
    </div>
  );
};

export default FacilitadorDashboard;
