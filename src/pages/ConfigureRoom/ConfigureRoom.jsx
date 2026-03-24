import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../index.css";
import './ConfigureRoom.css';
import { createRoom } from '../../services/createRoomService';
const ConfiguracaoSala = () => {
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


  

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("Eventos enviados para criação da sala:", events);
    const data = await createRoom({
      ...config, 
      events});
    localStorage.setItem('facilitadorToken', data.room.facilitatorToken);
    navigate(`/waitingroom/${data.room.code}`);
    
    
  } catch (error) {
    console.error("Erro ao criar sala:", error);
    // Aqui você pode adicionar um toast ou mensagem de erro para o usuário
  }
};

  return (
    <div className="config-container">
      <header>
        <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Voltar">
          ← Voltar
        </button>
        <h1>Configuração da Sala</h1>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid-config">
          <section>
            <h2>Geral & Financeiro</h2>
            <label>Caixa Inicial</label>
            <input type="number" name="caixa" value={config.caixa} onChange={handleChange} />
            
            <label>Taxa de Juros (%)</label>
            <input type="number" name="juros" value={config.juros} onChange={handleChange} />
            
            <label>Total de Rounds</label>
            <input type="number" name="totalRounds" value={config.totalRounds} onChange={handleChange} />
          </section>

          <section>
            <h2>Quebras (%)</h2>
            <label>Perecíveis</label>
            <input type="number" name="quebrasPereceiveis" value={config.quebrasPereceiveis} onChange={handleChange} step="0.1" />
            <label>Mercearia</label>
            <input type="number" name="quebrasMercearia" value={config.quebrasMercearia} onChange={handleChange} step="0.1" />
            <label>Eletro</label>
            <input type="number" name="quebrasEletro" value={config.quebrasEletro} onChange={handleChange} step="0.1" />
            <label>Hipel</label>
            <input type="number" name="quebrasHipel" value={config.quebrasHipel} onChange={handleChange} step="0.1" />
          </section>

          <section>
            <h2>Aging</h2>
            <label>Eletro</label>
            <input type="number" name="agingEletro" value={config.agingEletro} onChange={handleChange} step="0.1" />
            <label>Hipel</label>
            <input type="number" name="agingHipel" value={config.agingHipel} onChange={handleChange} step="0.1" />
            <label>Mercearia</label>
            <input type="number" name="agingMercearia" value={config.agingMercearia} onChange={handleChange} step="0.1" />
            <label>Perecíveis</label>
            <input type="number" name="agingPereceiveis" value={config.agingPereceiveis} onChange={handleChange} step="0.1" />
          </section>

          <section>
            <h2>Impostos (%)</h2>
            <label>Perecíveis</label>
            <input type="number" name="impostoPereceiveis" value={config.impostoPereceiveis} onChange={handleChange} />
            <label>Mercearia</label>
            <input type="number" name="impostoMercearia" value={config.impostoMercearia} onChange={handleChange} />
            <label>Eletro</label>
            <input type="number" name="impostoEletro" value={config.impostoEletro} onChange={handleChange} />
            <label>Hipel</label>
            <input type="number" name="impostoHipel" value={config.impostoHipel} onChange={handleChange} />
          </section>

          <section>
            <h2>Custo Unitário</h2>
            <label>Perecíveis</label>
            <input type="number" name="custoUntPereceiveis" value={config.custoUntPereceiveis} onChange={handleChange} />
            <label>Mercearia</label>
            <input type="number" name="custoUntMercearia" value={config.custoUntMercearia} onChange={handleChange} />
            <label>Eletro</label>
            <input type="number" name="custoUntEletro" value={config.custoUntEletro} onChange={handleChange} />
            <label>Hipel</label>
            <input type="number" name="custoUntHipel" value={config.custoUntHipel} onChange={handleChange} />
          </section>

          <section className="full-width">
            <h2>Eventos que aconteceram na Rodada</h2>

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
    

       
        </div>

        <div className="form-actions">
          <button type="submit">Criar jogo</button>
        </div>
      </form>
    </div>
  );
};

export default ConfiguracaoSala;