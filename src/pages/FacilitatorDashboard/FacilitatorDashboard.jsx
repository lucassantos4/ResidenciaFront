import React, { useState, useEffect, use } from 'react';
import { useParams } from 'react-router-dom';
import '../../index.css';
import '../../assets/css/RoomConfig.css';
import './FacilitatorDashboard.css';

const FacilitatorDashboard = () => {
  const { code } = useParams();
  const [Ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roundAtual, setRoundAtual] = useState(1);

  // Buscar dados da sala
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/${code}/resultado/${roundAtual}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar dados da sala');
        return res.json();
      })
      .then(data => {
        setRanking(data);
      })
      .catch(err => {
        console.error(err);
        setError('Falha ao carregar dados. Tente novamente mais tarde.');
        setLoading(false);
      });
  }, [code, roundAtual]);

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
          <strong className="dash-info-value">4</strong>
        </div>

        <div className="dash-info-card">
          <span className="dash-info-label">Rodada Atual</span>
          <strong className="dash-info-value">{roundAtual} / {configRoom.totalRounds || '—'}</strong>
        </div>
      </aside>

      {/* Painel principal */}
      <div className="config-main">
        {loading && <div className="status-message loading">Carregando dados...</div>}
        {error && <div className="status-message error">{error}</div>}

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
              {Ranking.length === 0 && !loading && (
                <div className="dash-table-empty">Nenhuma empresa encontrada.</div>
              )}
              {Ranking.map((empresa, index) => (
                  <div className="dash-table-row" key={empresa.id || empresa.name || index}>
                    <span className="dash-empresa-name">{empresa.name || `Empresa ${index + 1}`}</span>
                    <span className="dash-center">{fmt(empresa.precoCesta)}</span>
                    <span className="dash-center">{fmtPercent(empresa.disponibilidade)}</span>
                    <span className="dash-center">{fmtPercent(empresa.csat)}</span>
                    <span className="dash-center">{fmtPercent(empresa.partDemanda)}</span>
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
              {Ranking.map((empresa, index) => {
                const vendas = empresa.vendas || {};
                const totalVendas = (vendas.pereciveis || 0) + (vendas.mercearia || 0) + (vendas.eletro || 0) + (vendas.hipel || 0);
                return (
                  <div className={`dash-table-row dash-ranking-row ${index === 0 ? 'dash-row-first' : ''}`} key={empresa.id || empresa.name || index}>
                    <span className="dash-position">{index + 1}°</span>
                    <span className="dash-empresa-name">{empresa.name || `Empresa ${index + 1}`}</span>
                    <span>{empresa.gerente || '—'}</span>
                    <span className="dash-center dash-total-score">
                      <strong>{fmt(totalVendas)}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SEÇÃO 3: Vendas por Rodada */}
          <section className="config-section">
            <h3 className="section-subtitle">Vendas — Rodada {roundAtual}</h3>

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
              <div className="dash-table-row dash-demanda-row">
                <span className="dash-empresa-name">Rodada {roundAtual}</span>
                <span className="dash-center">{(configRoom.demandaPereciveisRound || 0).toLocaleString('pt-BR')}</span>
                <span className="dash-center">{(configRoom.demandaMerceariaRound || 0).toLocaleString('pt-BR')}</span>
                <span className="dash-center">{(configRoom.demandaEletroRound || 0).toLocaleString('pt-BR')}</span>
                <span className="dash-center">{(configRoom.demandaHipelRound || 0).toLocaleString('pt-BR')}</span>
                <span className="dash-center">
                  <strong>{((configRoom.demandaPereciveisRound || 0) + (configRoom.demandaMerceariaRound || 0) + (configRoom.demandaEletroRound || 0) + (configRoom.demandaHipelRound || 0)).toLocaleString('pt-BR')}</strong>
                </span>
              </div>
            </div>

            {/* Vendas por empresa */}
            <div className="dash-table">
              <div className="dash-table-header dash-vendas-header">
                <span>Empresa</span>
                <span className="dash-center">Perecíveis</span>
                <span className="dash-center">Mercearia</span>
                <span className="dash-center">Eletro</span>
                <span className="dash-center">Hipel</span>
                <span className="dash-center">Total</span>
              </div>
              {Ranking.map((empresa, index) => {
                const vendas = empresa.vendas || {};
                const totalVendas = (vendas.pereciveis || 0) + (vendas.mercearia || 0) + (vendas.eletro || 0) + (vendas.hipel || 0);
                return (
                  <div className="dash-table-row dash-vendas-row" key={empresa.id || empresa.name || index}>
                    <span className="dash-empresa-name">{empresa.name || `Empresa ${index + 1}`}</span>
                    <span className="dash-center">{(vendas.pereciveis || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center">{(vendas.mercearia || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center">{(vendas.eletro || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center">{(vendas.hipel || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center"><strong>{totalVendas.toLocaleString('pt-BR')}</strong></span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorDashboard;
