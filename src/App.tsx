
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import MemoryGame from './pages/Games/MemoryGame';
import BrainIndex from './pages/Brain/BrainIndex';
import BrainPostLayout from './pages/Brain/BrainPostLayout';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
        AJ<span style={{ color: 'var(--accent-neon)' }}>.</span>
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
        {!isHome && <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>}
        <Link to="/brain" style={{ color: 'var(--text-secondary)' }}>The Brain</Link>
        <a href="https://anuraj.me/portfolio" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Portfolio ↗</a>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games/memory" element={<MemoryGame />} />
          <Route path="/brain" element={<BrainIndex />} />
          <Route path="/brain/:slug" element={<BrainPostLayout />} />
        </Routes>
      </main>
      <footer style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4rem' }}>
        <p>© {new Date().getFullYear()} Anuraj Jaiswal. The Multiverse.</p>
      </footer>
    </>
  );
};

export default App;
