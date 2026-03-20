import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Se houver hash (ex: #sobre) tenta rolar para o elemento alvo
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      // caso o elemento não exista, fallback para topo
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    // Sem hash: rola ao topo quando o pathname muda
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;