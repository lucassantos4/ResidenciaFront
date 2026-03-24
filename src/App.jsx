
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";

// Importe suas páginas (verifique se os nomes dos arquivos estão corretos)
import Home from './pages/Landing/Landing';
import Lobby from './pages/Lobby/Lobby';
import CreateRoom from './pages/ConfigureRoom/ConfigureRoom';
import ConfiguracaoSala from './pages/ConfigureRoom/ConfigureRoom';
import WaitingRoom from './pages/WaitingRoom/WaitingRoom';

function App() {
  return (
    <BrowserRouter>
      {/* O ScrollToTop monitora a URL e "puxa" a tela para cima suavemente */}
      <ScrollToTop /> 
      
      <Routes>
        {/* Rota da Landing Page (Raiz) */}
        <Route path="/" element={<Home />} />
        
        {/* Rota da tela de PIN (Lobby) */}
        <Route path="/lobby" element={<Lobby />} />
        {/* Rota para configuração de sala */}
        <Route path="/configuracaodesala" element={<ConfiguracaoSala />} />
        {/* Rota para sala de espera */}
        <Route path="/waitingroom/:code" element={<WaitingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;