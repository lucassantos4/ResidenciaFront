import React, { useState } from 'react';
import logoCencosud from '../../assets/images/cencosud.svg'; 
import { Link } from 'react-router-dom';

import './lobby.css'; 
import ConfiguracaoSala from '../ConfigureRoom/ConfigureRoom';

const CencosudPinPage = () => {
  const [pin, setPin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("PIN inserido:", pin);
  
  };

  return (
    <div className="page-wrapper">
      <header className="header">
        <nav className="header__nav">
          <div className="header__logo">
            <Link to="/"><img src={logoCencosud} alt="Cencosud Logo" className="header__logo-img" /></Link>
          </div>
          <ul className="header__menu">
            {['Aprender','Criar'].map((item) => (
              <li key={item} className="header__menu-item">
                <button className="header__menu-btn" type="button">{item}</button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="main">
        <section className="login">
          <div className="login__brand">
            <h2 className="login__title">Cencosud Learning</h2>
          </div>
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__input-group">
              <label htmlFor="game-pin" className="login__label visually-hidden">
                PIN do Jogo
              </label>
              <input 
                className="login__input" 
                type="tel" 
                id="game-pin" 
                name="game-pin" 
                placeholder="PIN de acesso" 
                maxLength="6"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <div className="login__action-group">
              <Link to={'/configuracaodesala'}>
                <button className="idroom-submit" type="submit">
                  Inserir
                </button>
              </Link>
            </div>
          </form>
        </section>
      </main>

      <footer className="footer">
        <p className="footer__text">
          Crie seu próprio ambiente de <strong className="footer__brand">aprendizado</strong>.
        </p>
        {/*<div className="footer__links">
          <a className="footer__link" href="#">Termos</a> | 
          <a className="footer__link" href="#">Privacidade</a> | 
          <a className="footer__link" href="#">Aviso sobre cookies</a>
        </div>*/}
      </footer>
    </div>
  );
};

export default CencosudPinPage;