import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Paleta de cores para diferenciar as empresas (Azul Cencosud, Amarelo, Verde, Vermelho, etc.)
const COLORS = ['#005691', '#E8A81A', '#1D9E75', '#E24B4A', '#8884d8', '#ff7300', '#00C49F', '#FFBB28'];

const GraficoDemandaEmpresas = ({ historicoDados }) => {
  // 1. Verificação de Segurança: Se não houver dados, mostra estado de espera
  if (!historicoDados || historicoDados.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '350px', 
        color: '#888', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        border: '1px dashed #ccc',
        marginBottom: '20px' 
      }}>
        Aguardando histórico de rodadas para gerar evolução...
      </div>
    );
  }

  // 2. Lógica Dinâmica: Descobrir os nomes das empresas presentes nos dados
  // Pegamos as chaves do primeiro objeto do histórico e filtramos a chave "rodada"
  const nomesDasEmpresas = Object.keys(historicoDados[0]).filter(key => key !== 'rodada');

  // Formatadores para o gráfico
  const formatTooltip = (value) => `${value}%`;
  const formatYAxis = (tick) => `${tick}%`;

  return (
    <div style={{ 
      width: '100%', 
      height: 400, 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
      marginBottom: '25px' 
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#005691', fontSize: '16px', fontWeight: 'bold' }}>
        Evolução Comparativa: % Part. Demanda de Vendas
      </h3>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={historicoDados}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          {/* Grade de fundo suave */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
          
          {/* Eixo X: Mostra as Rodadas (Rodada 1, Rodada 2...) */}
          <XAxis 
            dataKey="rodada" 
            tick={{ fill: '#555', fontSize: 12, fontWeight: 'bold' }} 
            tickLine={false} 
            axisLine={{ stroke: '#ccc' }} 
          />
          
          {/* Eixo Y: Escala de 0% a 100% */}
          <YAxis 
            domain={[0, 100]}
            tickFormatter={formatYAxis} 
            tick={{ fill: '#888', fontSize: 11 }} 
            tickLine={false} 
            axisLine={false} 
          />
          
          {/* Tooltip (Balão de informação ao passar o rato) */}
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          />
          
          {/* Legenda com os nomes das empresas */}
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px' }} />
          
          {/* GERADOR DE LINHAS: Cria uma linha para cada empresa encontrada nos dados */}
          {nomesDasEmpresas.map((nome, index) => (
            <Line
              key={nome}
              type="monotone" // Curva suave idêntica à imagem de referência
              dataKey={nome}
              name={nome}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoDemandaEmpresas;