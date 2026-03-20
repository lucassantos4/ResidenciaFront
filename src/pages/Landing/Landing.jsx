import "../../index.css";
import './landing.css';
import logoCencosud from '../../assets/images/cencosud.svg';
import supermarket from '../../assets/images/supermarket.jpg';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const handleAnchor = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-wrapper">
      
      <header>
        <nav className="container">
          <div className="logo-placeholder">
            <img 
                src={logoCencosud} 
                alt="Cencosud Logo" 
                className="header__logo-img" 
            />
          </div>
          <ul className="nav-links">
            <li>
              <a href="#sobre" onClick={(e) => handleAnchor(e, 'sobre')}>SOBRE</a>
            </li>
            <li>
              <a href="#caracteristicas" onClick={(e) => handleAnchor(e, 'caracteristicas')}>CARACTERÍSTICAS</a>
            </li>
            <li>
              <Link to="/lobby" className="btn-primary">
                COMEÇAR AGORA
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <h1>
              Transforme o <br />
              <span>aprendizado</span> <br />
              em experiência
            </h1>
            <p>
              Explore a nova plataforma de gamificação.
              Aprenda, interaja e evolua suas habilidades de forma dinâmica.
            </p>
            <div className="hero-btns">
              <Link to="/lobby" className="btn-main">
                Começar Agora
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <img src={supermarket} alt='supermarketimg' />
          </div>
        </div>
      </section>

      {/* Seção Sobre */}
      <section id="sobre" className="about">
        <div className="container">
          <h2>O que é a plataforma?</h2>
          <p>
            A <strong>Cencosud Learning</strong> é um ecossistema digital desenvolvido
            para transformar o treinamento corporativo tradicional em uma jornada imersiva.
          </p>
          <div className="about-details">
            <p>
              Utilizando mecânicas de jogos, conectamos objetivos estratégicos ao desenvolvimento
              prático, garantindo retenção de conhecimento.
            </p>
          </div>
        </div>
      </section>

      {/* Seção Características */}
      <section  id="caracteristicas" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Características do Game</h2>
            <p>Uma simulação imersiva focada na gestão e tomada de decisão estratégica.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon">✓</div>
              <h3>Simulação</h3>
              <p>Simulação de cenários com feedback.</p>
            </div>
            <div className="feature-card">
              <div className="icon">✓</div>
              <h3>Mobile Friendly</h3>
              <p>Interface intuitiva acessível de qualquer dispositivo.</p>
            </div>
            <div className="feature-card">
              <div className="icon">✓</div>
              <h3>Gamificação</h3>
              <p>Experiência gamificada de resolução de conflitos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Capacidades */}
      <section className="capabilities">
        <div className="container">
          <h2>O que o usuário pode fazer?</h2>
          <div className="cap-list">
            <div className="cap-item">Autonomia para explorar ambientes virtuais.</div>
            <div className="cap-item">Simulações de atendimento, gestão de estoque e resolução de conflitos.</div>
            <div className="cap-item">Interação com rankings.</div>
          </div>
        </div>
      </section>

      {/* Footer conforme o estilo CSS (dark-tuna) */}
      <footer>
        <div className="container">
          <p>© 2026 Cencosud Learning. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;