
import { Link } from 'react-router-dom';
import { Terminal, Briefcase, Car, Plane, Gamepad2, ChefHat, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroCard = () => (
  <motion.div 
    className="glass-card col-span-4" 
    style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
      Hi, I'm <span style={{ color: 'var(--accent-neon)' }}>Anuraj.</span>
    </h1>
    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px' }}>
      Software Engineer. Tech enthusiast. Confident, patient, and street-smart problem solver. 
      Welcome to my digital multiverse where engineering meets passion.
    </p>
  </motion.div>
);

export const ProfessionalCard = () => (
  <motion.div 
    className="glass-card col-span-2 row-span-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8), rgba(0,240,255,0.05))' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
      <Terminal size={32} color="var(--accent-neon)" />
      <a href="https://anuraj.me/portfolio" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
        View Portfolio <Briefcase size={16} />
      </a>
    </div>
    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Engineering &<br/>Development</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
      Building scalable systems, crafting robust architectures, and optimizing performance. I turn complex problems into elegant solutions.
    </p>
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.8rem' }}>Distributed Systems</span>
      <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.8rem' }}>Control Planes</span>
      <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.8rem' }}>C++ / Go / React</span>
    </div>
  </motion.div>
);

export const FinanceCard = () => (
  <motion.div 
    className="glass-card col-span-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <TrendingUp size={28} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Finance & Business</h3>
    <p style={{ color: 'var(--text-secondary)' }}>Market analysis, investments, and understanding the mechanics of business scaling.</p>
  </motion.div>
);

export const MachinesCard = () => (
  <motion.div 
    className="glass-card col-span-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <Car size={28} color="var(--text-primary)" />
      <Plane size={28} color="var(--text-primary)" />
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Automotive & Aviation</h3>
    <p style={{ color: 'var(--text-secondary)' }}>Fascinated by high-performance machines, aerodynamics, and the engineering behind them.</p>
  </motion.div>
);

export const GamesCard = () => (
  <motion.div 
    className="glass-card col-span-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    style={{ position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'var(--accent-neon)', filter: 'blur(80px)', opacity: 0.2 }} />
    <Gamepad2 size={28} color="var(--accent-neon)" style={{ marginBottom: '1rem' }} />
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Interactive Sandbox</h3>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sports, competitive gaming, and mini-games built from scratch.</p>
    <Link to="/games/memory" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0,240,255,0.1)', color: 'var(--accent-neon)', borderRadius: '8px', fontWeight: 600 }}>
      Play Memory Game
    </Link>
  </motion.div>
);

export const CookingCard = () => (
  <motion.div 
    className="glass-card col-span-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
    style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8), rgba(255,92,0,0.05))' }}
  >
    <ChefHat size={28} color="var(--accent-warm)" style={{ marginBottom: '1rem' }} />
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Culinary Arts</h3>
    <p style={{ color: 'var(--text-secondary)' }}>Experimenting with flavors, perfecting techniques, and cooking as a form of meditation. Recipes coming soon.</p>
  </motion.div>
);
