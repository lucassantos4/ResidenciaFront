import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../index.css";
import './ConfigureRoom.css';
import { createRoom } from '../../services/createRoomService';
import Modal from '../../components/Modal';

const ConfiguracaoSala = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate();
  const [config, setConfig] = useState({
    caixa: 700000,
    juros: 12,
    totalRounds: 4,
    quebrasPereceiveis: 2,
    quebrasMercearia: 1.5,
    quebrasEletro: 0,
    quebrasHipel: 1,
    agingEletro: 1.3,
    agingHipel: 1.1,
    agingMercearia: 0.8,
    agingPereceiveis: 5.8,
    impostoPereceiveis: 12,
    impostoMercearia: 7,
    impostoEletro: 25,
    impostoHipel: 17,
    custoUntPereceiveis: 0,
    custoUntMercearia: 0,
    custoUntEletro: 0,
    custoUntHipel: 0,
    capexSeguranca: 0,
    capexBalancaFreezer: 0,
    capexRedes: 0,
    capexSites: 0,
    capexSelfCheckout: 0,
    capexMelhoriaContinua: 0,
  });
  const [events, setEvents] = useState([]);
  const handleChange = (e) => {
      const { name, value } = e.target;
      setConfig((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    };
  

  const handleAddEvent = () => {
    setEvents((prev) => [
      ...prev,
      { round: 1, type: 'EQUIPMENT_FAILURE', description: '' },
    ]);
  };

  const handleRemoveEvent = (index) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEventChange = (index, field, value) => {
    setEvents((prev) =>
      prev.map((event, i) =>
        i === index
          ? { ...event, [field]: field === 'round' ? parseInt(value) : value }
          : event
      )
    );
  };

  const totalCapex =
    config.capexSeguranca +
    config.capexBalancaFreezer +
    config.capexRedes +
    config.capexSites +
    config.capexSelfCheckout +
    config.capexMelhoriaContinua;
  


  

  const handleSubmit = async (e) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  setIsLoading(true); // Inicia o loading
  try {
    console.log("Configurações enviadas para criação da sala:", config);
    console.log("Eventos enviados para criação da sala:", events);
    const data = await createRoom({
      ...config, 
      events});
    localStorage.setItem('facilitadorToken', data.room.facilitatorToken);
    navigate(`/waitingroom/${data.room.code}`);
    
    
  } catch (error) {
    console.error("Erro ao criar sala:", error);
    // Aqui você pode adicionar um toast ou mensagem de erro para o usuário
  } finally {
    setIsLoading(false); // Encerra o loading
  }
};

  return (
    
    <div className="config-container">
      {/* Sidebar decorativo para manter semântica visual */}
      <aside className="config-sidebar">
        <div className="sidebar-top">
          <h1 className="config-title">Configuração<br />da Sala</h1>
          <span className="config-title-accent" />
          <p className="config-subtitle">Defina os parâmetros e eventos para a sala.</p>
        </div>
      </aside>

      <div className="config-main">
        <div className="config-main-header">
          <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Voltar">
            ← Voltar
          </button>
          <h2 className="main-title">Configuração da Sala</h2>
          <p className="main-description">Preencha todos os campos e confirme para criar a sala.</p>
        </div>
        <div className="config-content">
          <form onSubmit={handleSubmit}>
            <section className="config-section">
              <h3 className="section-subtitle">Geral &amp; Financeiro</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Caixa Inicial</label>
                  <input type="number" name="caixa" value={config.caixa} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Taxa de Juros (%)</label>
                  <input type="number" name="juros" value={config.juros} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Total de Rounds</label>
                  <input type="number" name="totalRounds" value={config.totalRounds} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Quebras (%)</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="quebrasPereceiveis" value={config.quebrasPereceiveis} onChange={handleChange} step="0.1" />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="quebrasMercearia" value={config.quebrasMercearia} onChange={handleChange} step="0.1" />
                </div>
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="quebrasEletro" value={config.quebrasEletro} onChange={handleChange} step="0.1" />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="quebrasHipel" value={config.quebrasHipel} onChange={handleChange} step="0.1" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Aging</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="agingEletro" value={config.agingEletro} onChange={handleChange} step="0.1" />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="agingHipel" value={config.agingHipel} onChange={handleChange} step="0.1" />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="agingMercearia" value={config.agingMercearia} onChange={handleChange} step="0.1" />
                </div>
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="agingPereceiveis" value={config.agingPereceiveis} onChange={handleChange} step="0.1" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Impostos (%)</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="impostoPereceiveis" value={config.impostoPereceiveis} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="impostoMercearia" value={config.impostoMercearia} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="impostoEletro" value={config.impostoEletro} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="impostoHipel" value={config.impostoHipel} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Custo Unitário</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="custoUntPereceiveis" value={config.custoUntPereceiveis} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="custoUntMercearia" value={config.custoUntMercearia} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="custoUntEletro" value={config.custoUntEletro} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="custoUntHipel" value={config.custoUntHipel} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">CAPEX</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Segurança</label>
                  <input type="number" name="capexSeguranca" value={config.capexSeguranca} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Balança / Freezer</label>
                  <input type="number" name="capexBalancaFreezer" value={config.capexBalancaFreezer} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Redes</label>
                  <input type="number" name="capexRedes" value={config.capexRedes} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Sites</label>
                  <input type="number" name="capexSites" value={config.capexSites} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Self Checkout</label>
                  <input type="number" name="capexSelfCheckout" value={config.capexSelfCheckout} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Melhoria Contínua</label>
                  <input type="number" name="capexMelhoriaContinua" value={config.capexMelhoriaContinua} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Total CAPEX</label>
                  <input type="number" value={totalCapex} readOnly />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Eventos que aconteceram na Rodada</h3>
              {events.length === 0 && (
                <p className="event-empty-message">
                  Nenhum evento configurado. Clique em "Adicionar Evento" para criar.
                </p>
              )}
              {events.map((event, index) => (
                <div key={index} className="event-item">
                  <div>
                    <label>Round</label>
                    <input
                      type="number"
                      min="1"
                      max={config.totalRounds}
                      value={event.round}
                      onChange={(e) => handleEventChange(index, 'round', e.target.value)}
                      className="event-input-no-margin"
                    />
                  </div>
                  <div>
                    <label>Tipo</label>
                    <select
                      value={event.type}
                      onChange={(e) => handleEventChange(index, 'type', e.target.value)}
                      className="event-select"
                    >
                      <option value="EQUIPMENT_FAILURE">Falha de Equipamento</option>
                      <option value="SYSTEM_FAILURE">Falha de Sistema</option>
                      <option value="OTHER">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label>Descrição</label>
                    <input
                      type="text"
                      placeholder="Ex: A balança quebra neste round"
                      value={event.description}
                      onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                      className="event-input-no-margin"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(index)}
                    className="event-remove-button"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddEvent}
                className="event-add-button"
              >
                + Adicionar Evento
              </button>
            </section>

            <button
              type="button"
              className="btn-confirm"
              onClick={() => setShowModal(true)}
              style={{ marginTop: 24 }}
            >
              Criar jogo
            </button>
          </form>
        </div>
      </div>
      <Modal
        isOpen={showModal}
        type={isLoading ? "loading" : "confirm"}
        title={isLoading ? "Criando Sala..." : "Confirmar Configurações"}
        message="Tem certeza que deseja criar a sala com essas configurações?"
        confirmText="Sim, criar sala"
        cancelText="Não, voltar"
        onConfirm={() => {
          if (!isLoading) {
            handleSubmit();
          }
        }}
        onCancel={() => {
          if (!isLoading) {
            setShowModal(false);
          }
        }}
      />
    </div>
  );
};

export default ConfiguracaoSala;