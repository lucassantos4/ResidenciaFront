import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Mapeamento exato de cores para não ter erro de índice
const COLORS_OUTER = {
  'Perecíveis': '#005691', // Azul Cencosud
  'Mercearia': '#E8A81A',  // Amarelo
  'Eletro': '#1D9E75',     // Verde
  'Hipel': '#E24B4A'       // Vermelho
};

const COLORS_INNER = {
  'Alimentos': '#66b3ff',      // Azul Claro
  'Não-Alimentos': '#ffba99'   // Laranja/Pêssego Claro
};

const GraficoVendasCategoria = ({ data }) => {
  if (!data || (data.qtdVendidaPereciveis === 0 && data.qtdVendidaMercearia === 0 && data.qtdVendidaEletro === 0 && data.qtdVendidaHipel === 0)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#888', border: '1px solid #eee', borderRadius: '8px' }}>
        Nenhuma venda registrada nesta rodada.
      </div>
    );
  }

  const dataOuter = [
    { name: 'Perecíveis', value: data.qtdVendidaPereciveis || 0 },
    { name: 'Mercearia', value: data.qtdVendidaMercearia || 0 },
    { name: 'Eletro', value: data.qtdVendidaEletro || 0 },
    { name: 'Hipel', value: data.qtdVendidaHipel || 0 },
  ].filter(item => item.value > 0);

  const qtdAlimentos = (data.qtdVendidaPereciveis || 0) + (data.qtdVendidaMercearia || 0);
  const qtdNaoAlimentos = (data.qtdVendidaEletro || 0) + (data.qtdVendidaHipel || 0);

  const dataInner = [
    { name: 'Alimentos', value: qtdAlimentos },
    { name: 'Não-Alimentos', value: qtdNaoAlimentos },
  ].filter(item => item.value > 0);

  const formatTooltip = (value) => `${value.toLocaleString('pt-BR')} unid.`;

  return (
    <div style={{ width: '100%', height: 350, backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          
          <Tooltip formatter={formatTooltip} />
          
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />

          {/* NÍVEL INTERNO (Alimentos / Não-Alimentos) */}
          <Pie
            data={dataInner}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={65}
            stroke="none" // Remove borda cinza
            legendType="none" // Esconde da legenda para não poluir
            // Removido o label para não sobrepor o texto!
          >
            {dataInner.map((entry, index) => (
              // O style={{ fill: ... }} força a cor e vence qualquer CSS externo!
              <Cell key={`cell-inner-${index}`} fill={COLORS_INNER[entry.name]} style={{ fill: COLORS_INNER[entry.name] }} />
            ))}
          </Pie>

          {/* NÍVEL EXTERNO (Categorias Específicas) */}
          <Pie
            data={dataOuter}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={75} 
            outerRadius={105}
            stroke="#fff" // Adiciona uma linhazinha branca entre as fatias para ficar elegante
            label={({ name, value }) => `${name} (${value})`} 
            style={{ fontSize: '12px', fill: '#555' }}
          >
            {dataOuter.map((entry, index) => (
              // Forçando a cor aqui também
              <Cell key={`cell-outer-${index}`} fill={COLORS_OUTER[entry.name]} style={{ fill: COLORS_OUTER[entry.name] }} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoVendasCategoria;