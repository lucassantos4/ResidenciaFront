import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCompanySettings, saveCompanySettings } from '../../services/CompanyService';
import './CompanyConfigRoom.css';
import "../../index.css";

const CARGOS = ['Serviços', 'Abastecimento', 'Comercial', 'Operacional', 'Gerente'];

const CompanyConfigRoom = () => {
  const { companyId } = useParams();

  const [params, setParams] = useState({
    saldoInicial: 0, juros: 12, custoPorOperador: 3000,
    custoUntPereciveis: 0, custoUntMercearia: 0, custoUntEletro: 0, custoUntHipel: 0,
    capexItems: [],
  });

  const [cargos, setCargos] = useState({
    servicos: '', abastecimento: '', comercial: '', operacional: '', gerente: '',
  });

  const [capexSelected, setCapexSelected] = useState([]);

  const [formData, setFormData] = useState({
    marginPereciveis: 15, marginMercearia: 10, marginEletro: 25, marginHipel: 18,
    estoquePereciveis: 0, estoqueMercearia: 0, estoqueEletro: 0, estoqueHipel: 0,
    operadoresCaixa: 0, operadoresServico: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCompanySettings(companyId);
        setParams(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erro ao carregar dados da empresa');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  // Cálculos dinâmicos
  const totalCapex = capexSelected.reduce((sum, key) => {
    const item = params.capexItems.find(i => i.key === key);
    return sum + (item ? item.cost : 0);
  }, 0);

  const custoEstoque =
    formData.estoquePereciveis * params.custoUntPereciveis +
    formData.estoqueMercearia * params.custoUntMercearia +
    formData.estoqueEletro * params.custoUntEletro +
    formData.estoqueHipel * params.custoUntHipel;

  const custoPessoal = (formData.operadoresCaixa + formData.operadoresServico) * params.custoPorOperador;
  const totalGastos = totalCapex + custoEstoque + custoPessoal;
  const saldoRestante = params.saldoInicial - totalGastos;
  const excedente = Math.max(0, -saldoRestante);
  const jurosPrevistos = excedente * (params.juros / 100);

  const precoCesta =
    params.custoUntPereciveis * (1 + formData.marginPereciveis / 100) +
    params.custoUntMercearia * (1 + formData.marginMercearia / 100) +
    params.custoUntEletro * (1 + formData.marginEletro / 100) +
    params.custoUntHipel * (1 + formData.marginHipel / 100);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleCargoChange = (e) => {
    const { name, value } = e.target;
    setCargos(prev => ({ ...prev, [name]: value }));
  };

  const toggleCapex = (key) => {
    setCapexSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...formData, cargos, capexItems: capexSelected };
      const result = await saveCompanySettings(companyId, payload);
      let msg = result.message || 'Estratégia confirmada com sucesso!';
      if (result.jurosAplicado > 0) {
        msg += `\n⚠️ Juros aplicados: R$ ${result.jurosAplicado.toLocaleString('pt-BR')}`;
      }
      alert(msg);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="config-container">
      {/* Sidebar */}
      <aside className="config-sidebar">
        <div className="sidebar-top">
          <h1 className="config-title">Configuração<br />da Rodada</h1>
          <span className="config-title-accent" />
          <p className="config-subtitle">
            Defina cargos, investimentos, estoque, preços e pessoal para esta rodada.
          </p>
        </div>

        <div className={`balance-card ${saldoRestante < 0 ? 'insufficient-funds' : ''}`}>
          <span className="balance-label">Saldo Disponível</span>
          <strong className="balance-value">{fmt(saldoRestante)}</strong>
          <span className="balance-hint">Gasto: {fmt(totalGastos)}</span>
          {excedente > 0 && (
            <div className="juros-alert">
              ⚠️ Excedente: {fmt(excedente)} → Juros de {params.juros}%: {fmt(jurosPrevistos)}
            </div>
          )}
        </div>

        <div className="cesta-resumo">
          <span className="balance-label">Preço Final da Cesta</span>
          <strong className="balance-value">{fmt(precoCesta)}</strong>
        </div>
      </aside>

      {/* Painel principal */}
      <div className="config-main">
        <div className="config-main-header">
          <h2 className="main-title">Painel de Estratégia</h2>
          <p className="main-description">Preencha todas as seções e confirme sua decisão como equipe.</p>
        </div>

        {loading && <div className="status-message loading">Carregando dados...</div>}
        {error && <div className="status-message error">Erro: {error}</div>}

        <div className="config-content">
          {/* SEÇÃO 1: Gestão de Pessoas */}
          <section className="config-section">
            <h3 className="section-subtitle">Gestão de Pessoas — Cargos</h3>
            <div className="input-grid">
              {CARGOS.map(cargo => (
                <div className="input-group" key={cargo}>
                  <label htmlFor={`cargo-${cargo}`}>{cargo}</label>
                  <input
                    id={`cargo-${cargo}`}
                    name={cargo.toLowerCase()}
                    type="text"
                    placeholder="Nome do integrante"
                    value={cargos[cargo.toLowerCase()] || ''}
                    onChange={handleCargoChange}
                  />
                </div>
              ))}
            </div>

            <h3 className="section-subtitle" style={{ marginTop: 28 }}>Dimensionamento de Pessoal</h3>
            <p className="section-hint">Custo: {fmt(params.custoPorOperador)} por operador</p>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="operadoresCaixa">Operadores de Caixa</label>
                <input id="operadoresCaixa" name="operadoresCaixa" type="number" min="0"
                  value={formData.operadoresCaixa} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="operadoresServico">Operadores de Serviço</label>
                <input id="operadoresServico" name="operadoresServico" type="number" min="0"
                  value={formData.operadoresServico} onChange={handleChange} />
              </div>
              <div className="input-group readonly-group">
                <label>Custo Total Pessoal</label>
                <span className="computed-value">{fmt(custoPessoal)}</span>
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: CAPEX */}
          <section className="config-section">
            <h3 className="section-subtitle">Investimentos (CAPEX)</h3>
            <p className="section-hint">Selecione os itens de infraestrutura. Itens não comprados podem gerar incidentes.</p>
            <div className="capex-grid">
              {params.capexItems.map(item => (
                <div
                  key={item.key}
                  className={`capex-card ${capexSelected.includes(item.key) ? 'selected' : ''}`}
                  onClick={() => toggleCapex(item.key)}
                >
                  <div className="capex-card-header">
                    <span className="capex-check">{capexSelected.includes(item.key) ? '✓' : ''}</span>
                    <strong className="capex-label">{item.label}</strong>
                    <span className="capex-cost">{fmt(item.cost)}</span>
                  </div>
                  <p className="capex-risk">⚠ Risco: {item.risk}</p>
                </div>
              ))}
            </div>
            <div className="capex-total">
              Total CAPEX: <strong>{fmt(totalCapex)}</strong>
            </div>
          </section>

          {/* SEÇÃO 3: Estoque + Margens */}
          <section className="config-section">
            <h3 className="section-subtitle">Abastecimento e Comercial</h3>
            <div className="stock-table">
              <div className="stock-header">
                <span>Categoria</span>
                <span>Custo <br /> Unitário</span>
                <span>Qtd. Comprar</span>
                <span>Custo <br /> Total</span>
                <span>Margem (%)</span>
                <span>Preço <br /> Venda</span>
              </div>
              {[
                { key: 'Pereciveis', label: 'Perecíveis', custo: params.custoUntPereciveis },
                { key: 'Mercearia', label: 'Mercearia', custo: params.custoUntMercearia },
                { key: 'Eletro', label: 'Eletro', custo: params.custoUntEletro },
                { key: 'Hipel', label: 'Hipel', custo: params.custoUntHipel },
              ].map(cat => {
                const qtd = formData[`estoque${cat.key}`];
                const margem = formData[`margin${cat.key}`];
                const custoTotal = qtd * cat.custo;
                const precoVenda = cat.custo * (1 + margem / 100);
                return (
                  <div className="stock-row" key={cat.key}>
                    <span className="stock-cat">{cat.label}</span>
                    <span>{fmt(cat.custo)}</span>
                    <input name={`estoque${cat.key}`} type="number" min="0"
                      value={qtd} onChange={handleChange} />
                    <span>{fmt(custoTotal)}</span>
                    <input name={`margin${cat.key}`} type="number" min="0"
                      value={margem} onChange={handleChange} />
                    <span className="stock-price">{fmt(precoVenda)}</span>
                  </div>
                );
              })}
              <div className="stock-row stock-summary">
                <span className="stock-cat">Total</span>
                <span></span><span></span>
                <span><strong>{fmt(custoEstoque)}</strong></span>
                <span></span>
                <span className="stock-price"><strong>{fmt(precoCesta)}</strong></span>
              </div>
            </div>
          </section>

          <button className="btn-confirm" onClick={handleSave} disabled={saving}>
            {saving ? 'SALVANDO...' : 'CONFIRMAR ESTRATÉGIA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyConfigRoom;