import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Briefcase, Car, Plane, Gamepad2, ChefHat, TrendingUp, Brain } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

const TiltCard = ({ children, className, style, delay = 0 }: any) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card ${className}`}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div style={{ transform: "translateZ(30px)", display: 'flex', flexDirection: 'column', height: '100%', justifyContent: style?.justifyContent || 'flex-start' }}>
        {children}
      </div>
    </motion.div>
  );
};

export const HeroCard = () => (
  <TiltCard
    className="col-span-4"
    style={{ minHeight: '300px', justifyContent: 'center' }}
  >
    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
      Hi, I'm <span style={{ color: 'var(--accent-neon)' }}>Anuraj.</span>
    </h1>
    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', minHeight: '60px' }}>
      <TypeAnimation
        sequence={[
          'Software Engineer.', 1000,
          'Software Engineer. Tech enthusiast.', 1000,
          'Software Engineer. Tech enthusiast. Problem solver.', 1000,
          'Software Engineer. Tech enthusiast. Confident, patient, and problem solver.\nWelcome to my digital multiverse where engineering meets passion.', 5000,
        ]}
        wrapper="p"
        speed={50}
        repeat={Infinity}
        cursor={true}
        style={{ whiteSpace: 'pre-line', display: 'block' }}
      />
    </div>
  </TiltCard>
);

export const ProfessionalCard = () => (
  <TiltCard
    className="col-span-2 row-span-2"
    delay={0.1}
    style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8), rgba(0,240,255,0.05))' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
      <Terminal size={32} color="var(--accent-neon)" />
      <a href="https://anuraj.me/portfolio" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
        View Portfolio <Briefcase size={16} />
      </a>
    </div>
    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Engineering &<br />Development</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
      Building scalable systems, crafting robust architectures, and optimizing performance. I turn complex problems into elegant solutions.
    </p>
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 'auto' }}>
      <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.8rem' }}>Distributed Systems</span>
      <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.8rem' }}>Control Planes</span>
      <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.8rem' }}>C++ / Go / React</span>
    </div>
  </TiltCard>
);

export const FinanceCard = () => (
  <TiltCard
    className="col-span-2"
    delay={0.2}
  >
    <TrendingUp size={28} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Finance & Business</h3>
    <p style={{ color: 'var(--text-secondary)' }}>Market analysis, investments, and understanding the mechanics of business scaling.</p>
  </TiltCard>
);

export const MachinesCard = () => (
  <TiltCard
    className="col-span-2"
    delay={0.3}
  >
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <Car size={28} color="var(--text-primary)" />
      <Plane size={28} color="var(--text-primary)" />
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Automotive & Aviation</h3>
    <p style={{ color: 'var(--text-secondary)' }}>Fascinated by high-performance machines, aerodynamics, and the engineering behind them.</p>
  </TiltCard>
);

export const GamesCard = () => (
  <TiltCard
    className="col-span-2"
    delay={0.4}
  >
    <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'var(--accent-neon)', filter: 'blur(80px)', opacity: 0.2, transform: "translateZ(-10px)" }} />
    <Gamepad2 size={28} color="var(--accent-neon)" style={{ marginBottom: '1rem' }} />
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Interactive Sandbox</h3>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sports, competitive gaming, and mini-games built from scratch.</p>
    <div style={{ marginTop: 'auto' }}>
      <Link to="/games/memory" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0,240,255,0.1)', color: 'var(--accent-neon)', borderRadius: '8px', fontWeight: 600 }}>
        Play Memory Game
      </Link>
    </div>
  </TiltCard>
);

export const CookingCard = () => (
  <TiltCard
    className="col-span-2"
    delay={0.5}
    style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8), rgba(255,92,0,0.05))' }}
  >
    <ChefHat size={28} color="var(--accent-warm)" style={{ marginBottom: '1rem' }} />
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Culinary Arts</h3>
    <p style={{ color: 'var(--text-secondary)' }}>Experimenting with flavors, perfecting techniques, and cooking as a form of meditation. Recipes coming soon.</p>
  </TiltCard>
);

export const BrainCard = () => (
  <TiltCard
    className="col-span-2 row-span-2"
    delay={0.6}
    style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.8), rgba(176,0,255,0.05))' }}
  >
    <div style={{ position: 'absolute', top: '0', right: '0', width: '200px', height: '200px', background: 'var(--accent-purple)', filter: 'blur(100px)', opacity: 0.1, transform: "translateZ(-10px)" }} />
    <Brain size={32} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>The Brain</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
      My digital garden. A growing collection of raw thoughts, engineering lessons, and interactive notes.
    </p>
    <div style={{ marginTop: 'auto' }}>
      <Link to="/brain" style={{ display: 'inline-block', padding: '0.8rem 1.5rem', background: 'rgba(176,0,255,0.1)', color: 'var(--accent-purple)', borderRadius: '100px', fontWeight: 600, fontSize: '0.9rem' }}>
        Enter The Brain
      </Link>
    </div>
  </TiltCard>
);
