import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../index.css';
import '../../assets/css/RoomConfig.css';
import './GerenteRanking.css';
import { io } from 'socket.io-client';
import Modal from '../../components/Modal';
import GraficoVendas from '../../components/GraficoVendas';

const GerenteRanking = () => {
  const companyId = localStorage.getItem('companyId');
  const [resultado, setResultado] = useState([]);
  const [ meuResultado, setMeuResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roundAtual, setRoundAtual] = useState(1);
  const roomCode = localStorage.getItem('codeRoom');

  

  // Buscar resultado quando tiver roomCode
  useEffect(() => {
    if (!roomCode) return;

    fetch(`${import.meta.env.VITE_API_URL}/rooms/${roomCode}/rank/${roundAtual}?companyId=${companyId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar resultado');
        return res.json();
      })
      .then((data) => {
        console.log('Resultado bruto:', data);
        setMeuResultado(data.meuResultado);
        setResultado(Array.isArray(data.rank) ? data.rank : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [roomCode, roundAtual]);

  // Socket para atualizações em tempo real
  useEffect(() => {
    if (!roomCode) return;

    const socket = io(import.meta.env.VITE_API_URL);
    socket.emit('join_room', roomCode);

    socket.on('round_updated', (data) => {
      if (data.round) setRoundAtual(data.round);
    });

    return () => {
      socket.off('round_updated');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [roomCode]);

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
          <h1 className="config-title">Ranking<br />da Rodada</h1>
          <span className="config-title-accent" />
          <p className="config-subtitle">
            Veja sua posicao e compare com as outras empresas.
          </p>
        </div>

        {meuResultado && (
          <>
            <div className="dash-info-card">
              <span className="dash-info-label">Sua Empresa</span>
              <strong className="dash-info-value">{resultado.find(e => e.company?.id === companyId)?.company?.name || '—'}</strong>
            </div>

            <div className="dash-info-card">
              <span className="dash-info-label">Sua Colocacao</span>
              <strong className="dash-info-value ranking-position">
                {resultado.findIndex(e => e.company?.id === companyId) + 1}° lugar
              </strong>
            </div>

            <div className="dash-info-card">
              <span className="dash-info-label">Rodada</span>
              <strong className="dash-info-value">{roundAtual}</strong>
            </div>

            <div className="dash-info-card">
              <span className="dash-info-label">Receita Total</span>
              <strong className="dash-info-value">{fmt(resultado.find(e => e.company?.id === companyId)?.receitaTotal)}</strong>
            </div>
          </>
        )}
        
      </aside>

        
      {/* Painel principal */}
  
        
      <div className="config-main">
        <div className="config-content">
          {/* Ranking */}
          <section className="config-section">
            <h3 className="section-subtitle">Ranking Geral — Rodada {roundAtual}</h3>
            <div className="dash-table">
              <div className="dash-table-header gr-ranking-header">
                <span>Colocacao</span>
                <span>Empresa</span>
                <span>Gerente</span>
                <span className="dash-center">Receita Total</span>
                <span className="dash-center">Pontos</span>
              </div>
              {resultado.length === 0 && !loading && (
                <div className="dash-table-empty">Nenhum resultado disponivel.</div>
              )}
              {resultado.map((emp, index) => {
                const isMe = emp.companyId === companyId;
                return (
                  <div
                    className={`dash-table-row gr-ranking-row ${index === 0 ? 'dash-row-first' : ''} ${isMe ? 'gr-row-me' : ''}`}
                    key={emp.id || index}
                  >
                    <span className="dash-position">{index + 1}°</span>
                    <span className="dash-empresa-name">
                      {emp.company?.name || `Empresa ${index + 1}`}
                      {isMe && <span className="gr-badge-me">Voce</span>}
                    </span>
                    <span>{emp.company?.managerName || '—'}</span>
                    <span className="dash-center dash-total-score">
                      <strong>{fmt(emp.receitaTotal)}</strong>
                    </span>
                    <span className="dash-center">
                      <strong>{emp.pontosTotais || 0}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>


          {/* Detalhes da minha empresa */}
          {meuResultado && (
            <section className="config-section">
              <h3 className="section-subtitle">Seus Resultados</h3>
              <div className="gr-stats-grid">
                <div className="gr-stat-card">
                  <span className="gr-stat-label">Preco Medio da Cesta</span>
                  <strong className="gr-stat-value">{fmt(meuResultado.precoMedioCesta)}</strong>
                </div>

                <div className="gr-stat-card">
                  <span className="gr-stat-label">Disponibilidade</span>
                  <strong className="gr-stat-value">{fmtPercent(meuResultado.disponibilidade)}</strong>
                </div>

                <div className="gr-stat-card">
                  <span className="gr-stat-label">CSAT</span>
                  <strong className="gr-stat-value">{fmtPercent(meuResultado.csat)}</strong>
                </div>

                <div className="gr-stat-card">
                  <span className="gr-stat-label">Part. Demanda</span>
                  <strong className="gr-stat-value">{fmtPercent((meuResultado.percentualDemanda || 0) * 100)}</strong>
                </div>

                <div className="gr-stat-card">
                  <span className="gr-stat-label">Receita Bruta</span>
                  <strong className="gr-stat-value">{fmt(meuResultado.receitaBruta)}</strong>
                </div>

                <div className="gr-stat-card">
                  <span className="gr-stat-label">Penalidade</span>
                  <strong
                    className="gr-stat-value"
                    style={{ color: (meuResultado.valorPenalidade || 0) > 0 ? '#e74c3c' : 'var(--color-primary-blue)' }}
                  >
                    {fmt(meuResultado.valorPenalidade)}
                  </strong>
                </div>

                <div className="gr-stat-card">
                  <span className="gr-stat-label">Penalidade (%)</span>
                  <strong
                    className="gr-stat-value"
                    style={{ color: (meuResultado.percentualPenalidade || 0) > 0 ? '#e74c3c' : 'var(--color-primary-blue)' }}
                  >
                    {fmtPercent(meuResultado.percentualPenalidade)}
                  </strong>
                </div>

                <div className="gr-stat-card">
                  <span className="gr-stat-label">Receita Final</span>
                  <strong className="gr-stat-value">{fmt(meuResultado.receitaTotal)}</strong>
                </div>
              </div>
            </section>
          )}

          {/* Vendas detalhadas */}
          {meuResultado && (
            <section className="config-section">
              <h3 className="section-subtitle">Suas Vendas</h3>
              <div style={{ marginBottom: '25px' }}>
                <GraficoVendas data={meuResultado} />
              </div>
              <div className="dash-table">
                <div className="dash-table-header gr-vendas-header">
                  <span>Categoria</span>
                  <span className="dash-center">Qtd Vendida</span>
                  <span className="dash-center">Receita</span>
                  <span className="dash-center">Deixou de Vender</span>
                </div>
                {[
                  { label: 'Pereciveis', qtd: meuResultado.qtdVendidaPereciveis, receita: meuResultado.receitaPereciveis, perdeu: meuResultado.deixouDeVenderPereciveis },
                  { label: 'Mercearia', qtd: meuResultado.qtdVendidaMercearia, receita: meuResultado.receitaMercearia, perdeu: meuResultado.deixouDeVenderMercearia },
                  { label: 'Eletro', qtd: meuResultado.qtdVendidaEletro, receita: meuResultado.receitaEletro, perdeu: meuResultado.deixouDeVenderEletro },
                  { label: 'Hipel', qtd: meuResultado.qtdVendidaHipel, receita: meuResultado.receitaHipel, perdeu: meuResultado.deixouDeVenderHipel },
                ].map((cat) => (
                  <div className="dash-table-row gr-vendas-row" key={cat.label}>
                    <span className="dash-empresa-name">{cat.label}</span>
                    <span className="dash-center">{(cat.qtd || 0).toLocaleString('pt-BR')}</span>
                    <span className="dash-center">{fmt(cat.receita)}</span>
                    <span className={`dash-center ${(cat.perdeu || 0) > 0 ? 'gr-perdeu' : ''}`}>
                      {(cat.perdeu || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Modal
        isOpen={loading}
        type="loading"
        title="Carregando Ranking"
        message="Aguarde enquanto os dados sao carregados..."
      />
    </div>
  );
};

export default GerenteRanking;
