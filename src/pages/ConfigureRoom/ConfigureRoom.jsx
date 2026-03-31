import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../index.css";
import './ConfigureRoom.css';
import { createRoom } from '../../services/createRoomService';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast.jsx'
const ConfiguracaoSala = () => {
  const { showToast } = useToast();
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
    custoUntPereciveis: 0,
    custoUntMercearia: 0,
    custoUntEletro: 0,
    custoUntHipel: 0,
    capexSegurancaValor: 50000,
    capexBalancaValor: 75000,
    capexFreezerValor: 75000,
    capexRedesValor: 80000,
    capexSiteValor: 65000,
    capexSelfCheckoutValor : 80000,
    capexMelhoriaContinuaValor: 45000,
    estoqueDisponivelPereciveis: 1000,
    estoqueDisponivelMercearia: 1000,
    estoqueDisponivelEletro: 1000,
    estoqueDisponivelHipel: 1000
  });
  const [events, setEvents] = useState([]);

  // Formata número para exibição BR com centavos (ex: 19800.5 → "19.800,50")
  const formatBR = (val) => {
    if (val === '' || val === undefined || val === null) return '';
    return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handler para campos de DINHEIRO (type="text" com máscara)
  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    if (value === '') {
      setConfig((prev) => ({ ...prev, [name]: '' }));
      return;
    }
    // Remove tudo que não é dígito, converte pra centavos
    const digits = value.replace(/\D/g, '');
    const num = parseInt(digits, 10);
    setConfig((prev) => ({
      ...prev,
      [name]: isNaN(num) ? '' : num / 100,
    }));
  };

  // Handler para campos de PERCENTUAL / QUANTIDADE (type="number")
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value),
    }));
  };
  const validateConfig = () => {
  const required = [
    'caixa',
    'juros',
    'totalRounds',
    'quebrasPereceiveis',
    'quebrasMercearia',
    'quebrasEletro',
    'quebrasHipel',
    'agingEletro',
    'agingHipel',
    'agingMercearia',
    'agingPereceiveis',
    'impostoPereceiveis',
    'impostoMercearia',
    'impostoEletro',
    'impostoHipel',
    'custoUntPereciveis',
    'custoUntMercearia',
    'custoUntEletro',
    'custoUntHipel',
    'capexSegurancaValor',
    'capexBalancaValor',
    'capexFreezerValor',
    'capexRedesValor',
    'capexSiteValor',
    'capexSelfCheckoutValor',
    'capexMelhoriaContinuaValor',
  ];
  const notZeroFields = [
    'custoUntPereciveis',
    'custoUntMercearia',
    'custoUntEletro',
    'custoUntHipel',
    'capexSegurancaValor',
    'capexBalancaValor',
    'capexFreezerValor',
    'capexRedesValor',
    'capexSiteValor',
    'capexSelfCheckoutValor',
    'capexMelhoriaContinuaValor',
  ];

  // ✅ Filtra apenas campos realmente vazios (não conta 0 como vazio)
   const missingFields = required.filter(field => {
    const value = config[field];
    return value === '' || value === undefined || value === null;
  });

  // ✅ Filtra campos que são 0 (quando não podem ser)
  const zeroFields = notZeroFields.filter(field => config[field] === 0);

  if (missingFields.length > 0) {
    setTimeout(() => {
      showToast(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`, 'warning');
    }, 100);
    return false;
  }

  if (zeroFields.length > 0) {
    setTimeout(() => {
      showToast(`Estes campos não podem ser 0: ${zeroFields.join(', ')}`, 'warning');
    }, 500);
    return false;
  }

  console.log('✅ Validação passou!');
  return true;
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
    prev.map((event, i) => {
      if (i === index) {
        let finalValue = value;

        // Se o campo for 'round', aplicamos a trava
        if (field === 'round') {
          const num = parseInt(value, 10);
          const max = config.totalRounds;

          if (isNaN(num)) {
            finalValue = ""; // Permite apagar o campo para digitar de novo
          } else {
            // Trava entre 1 e o máximo (ex: se digitar 10319819, vira o valor de 'max')
            finalValue = Math.min(Math.max(num, 1), max);
          }
        }

        return { ...event, [field]: finalValue };
      }
      return event;
    })
  );
};

  const handleSubmit = async (e) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  if (!validateConfig()) {
    setShowModal(false);
    return;
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
        </div>
        <div className="config-content">
          <form onSubmit={handleSubmit}>
            <section className="config-section">
              <h3 className="section-subtitle">Geral &amp; Financeiro</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Caixa Inicial</label>
                  <input type="text" name="caixa" value={formatBR(config.caixa)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Taxa de Juros (%)</label>
                  <input type="number" name="juros" value={config.juros} onChange={handleChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Total de Rounds</label>
                  <input type="number" name="totalRounds" value={config.totalRounds} onChange={handleChange} placeholder="0" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Quebras (%)</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="quebrasPereceiveis" value={config.quebrasPereceiveis} placeholder='0' onChange={handleChange} step="0.1" />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="quebrasMercearia" value={config.quebrasMercearia} onChange={handleChange} placeholder='0' step="0.1" />
                </div>
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="quebrasEletro" value={config.quebrasEletro} onChange={handleChange} placeholder='0' step="0.1" />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="quebrasHipel" value={config.quebrasHipel} onChange={handleChange}  placeholder='0'step="0.1" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Aging(%)</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="agingEletro" value={config.agingEletro} onChange={handleChange} placeholder='0' step="0.1" />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="agingHipel" value={config.agingHipel} onChange={handleChange} placeholder='0' step="0.1" />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="agingMercearia" value={config.agingMercearia} onChange={handleChange} placeholder='0' step="0.1" />
                </div>
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="agingPereceiveis" value={config.agingPereceiveis} onChange={handleChange} placeholder='0' step="0.1" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Impostos (%)</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="impostoPereceiveis" value={config.impostoPereceiveis} onChange={handleChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="impostoMercearia" value={config.impostoMercearia} onChange={handleChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="impostoEletro" value={config.impostoEletro} onChange={handleChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="impostoHipel" value={config.impostoHipel} onChange={handleChange} placeholder="0" />
                </div>
              </div>
            </section>
            <section className="config-section">
              <h3 className="section-subtitle">Estoque Disponível</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="number" name="estoqueDisponivelPereciveis" value={config.estoqueDisponivelPereciveis} onChange={handleChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="number" name="estoqueDisponivelMercearia" value={config.estoqueDisponivelMercearia} onChange={handleChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="number" name="estoqueDisponivelEletro" value={config.estoqueDisponivelEletro} onChange={handleChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="number" name="estoqueDisponivelHipel" value={config.estoqueDisponivelHipel} onChange={handleChange} placeholder="0" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">Custo Unitário</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Perecíveis</label>
                  <input type="text" name="custoUntPereciveis" value={formatBR(config.custoUntPereciveis)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Mercearia</label>
                  <input type="text" name="custoUntMercearia" value={formatBR(config.custoUntMercearia)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Eletro</label>
                  <input type="text" name="custoUntEletro" value={formatBR(config.custoUntEletro)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Hipel</label>
                  <input type="text" name="custoUntHipel" value={formatBR(config.custoUntHipel)} onChange={handleMoneyChange} placeholder="0" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h3 className="section-subtitle">CAPEX</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Segurança</label>
                  <input type="text" name="capexSegurancaValor" value={formatBR(config.capexSegurancaValor)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Balança</label>
                  <input type="text" name="capexBalancaValor" value={formatBR(config.capexBalancaValor)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                 <div className="input-group">
                  <label>Freezer</label>
                  <input type="text" name="capexFreezerValor" value={formatBR(config.capexFreezerValor)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Redes</label>
                  <input type="text" name="capexRedesValor" value={formatBR(config.capexRedesValor)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Sites</label>
                  <input type="text" name="capexSiteValor" value={formatBR(config.capexSiteValor)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Self Checkout</label>
                  <input type="text" name="capexSelfCheckoutValor" value={formatBR(config.capexSelfCheckoutValor)} onChange={handleMoneyChange} placeholder="0" />
                </div>
                <div className="input-group">
                  <label>Melhoria Contínua</label>
                  <input type="text" name="capexMelhoriaContinuaValor" value={formatBR(config.capexMelhoriaContinuaValor)} onChange={handleMoneyChange} placeholder="0" />
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