// [TASK 1] Distribuição de vendas por rodada — Cencosud Trainer

import { useState, useEffect, useCallback } from "react";
import "./SalesDistributionConfig.css";

const CATEGORIES = [
  { id: "pereciveis", name: "Perecíveis" },
  { id: "mercearia",  name: "Mercearia"  },
  { id: "eletro",     name: "Eletro"     },
  { id: "hipel",      name: "Hipel"      },
];

const formatBRL = (value) => 
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const getSum = (arr) => arr.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);

const buildPctState = (numRounds) => {
  const s = {};
  CATEGORIES.forEach((c) => { s[c.id] = Array(numRounds).fill(""); });
  return s;
};

const buildTotalState = () => {
  const s = {};
  CATEGORIES.forEach((c) => { s[c.id] = ""; });
  return s;
};

const buildPayload = (totais, pcts) => 
  CATEGORIES.map((c) => {
    const total = parseFloat(totais[c.id]) || 0;
    return {
      categoryId: c.id,
      totalVendas: total,
      rounds: (pcts[c.id] || []).map((pct, i) => {
        const p = parseFloat(pct) || 0;
        return {
          roundNumber: i + 1,
          percentage: p,
          value: parseFloat(((total * p) / 100).toFixed(2)),
        };
      }),
    };
  });

const checkValid = (totais, pcts) => {
  const totaisOk = CATEGORIES.every(
    (c) => totais[c.id] !== "" && parseFloat(totais[c.id]) > 0
  );
  const pctsOk = CATEGORIES.every(
    (c) => Math.abs(getSum(pcts[c.id] || []) - 100) < 0.01
  );
  return totaisOk && pctsOk;
};

export default function SalesDistributionConfig({ numRounds = 3, onDataChange }) {
  const [totais, setTotais] = useState(buildTotalState);
  const [pcts, setPcts] = useState(() => buildPctState(numRounds));

  // Reinicia % se o número de rodadas mudar
  useEffect(() => {
    setPcts(buildPctState(numRounds));
  }, [numRounds]);

  // Notifica o pai APENAS quando os dados de fato mudarem (comparação de valor)
  useEffect(() => {
    if (typeof onDataChange !== "function") return;
    
    const payload = buildPayload(totais, pcts);
    const isValid = checkValid(totais, pcts);
    
    onDataChange(payload, isValid);
    // onDataChange adicionado às dependências conforme regras do React
    // O pai DEVE usar useCallback para evitar re-renders infinitos
  }, [totais, pcts, onDataChange]);

  const handleTotalChange = useCallback((catId, rawValue) => {
    const v = rawValue === "" ? "" : Math.max(0, parseFloat(rawValue) || 0);
    setTotais((prev) => ({ ...prev, [catId]: v }));
  }, []);

  const handlePctChange = useCallback((catId, idx, rawValue) => {
    const v = rawValue === "" ? "" : Math.min(100, Math.max(0, parseFloat(rawValue) || 0));
    setPcts((prev) => {
      const updated = [...prev[catId]];
      updated[idx] = v;
      return { ...prev, [catId]: updated };
    });
  }, []);

  return (
    <section className="config-section">
      <h3 className="section-subtitle">Distribuição de Vendas por Rodada</h3>
      
      <div className="sdc-cards-grid">
        {CATEGORIES.map((cat) => {
          const arr = pcts[cat.id] || [];
          const sum = getSum(arr);
          const total = parseFloat(totais[cat.id]) || 0;
          const isValid = Math.abs(sum - 100) < 0.01;
          const isOver = sum > 100;
          const barBg = isValid ? "#1D9E75" : isOver ? "#E24B4A" : "var(--color-primary-blue)";

          return (
            <div key={cat.id} className="sdc-card">
              <div className="sdc-card-header">
                <span className="sdc-cat-name">{cat.name}</span>
                <div className="sdc-total-wrap">
                  <label className="sdc-total-label">Total R$</label>
                  <div className="input-group sdc-inline-input">
                    <input
                      type="number"
                      name={`totalVendas_${cat.id}`}
                      min={0}
                      step={100}
                      value={totais[cat.id]}
                      placeholder="Ex: 3000"
                      onChange={(e) => handleTotalChange(cat.id, e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="sdc-rounds">
                {Array.from({ length: numRounds }, (_, i) => {
                  const pct = parseFloat(arr[i]) || 0;
                  const valor = (total * pct) / 100;

                  return (
                    <div key={i} className="sdc-round-row">
                      <span className="sdc-round-label">Rodada {i + 1}</span>
                      
                      <div className="input-group sdc-pct-input">
                        <input
                          type="number"
                          name={`${cat.id}_r${i}`}
                          min={0}
                          max={100}
                          step={1}
                          value={arr[i]}
                          placeholder="0"
                          onChange={(e) => handlePctChange(cat.id, i, e.target.value)}
                        />
                        <span className="sdc-pct-symbol">%</span>
                      </div>

                      <span className={`sdc-live-value${pct > 0 && total > 0 ? " sdc-live-value--active" : ""}`}>
                        {pct > 0 && total > 0 ? formatBRL(valor) : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="sdc-progress-wrap">
                <div className="sdc-track">
                  <div 
                    className="sdc-fill" 
                    style={{ width: `${Math.min(sum, 100)}%`, background: barBg }} 
                  />
                </div>
                <span
                  className="sdc-sum-label"
                  style={{ color: isValid ? "#0F6E56" : isOver ? "#A32D2D" : "#888" }}
                >
                  {isValid ? "100% ✓" : `${sum.toFixed(0)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}