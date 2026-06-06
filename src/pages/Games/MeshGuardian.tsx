import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Shield, Server, Activity, Terminal as TerminalIcon, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- GAME DATA & TYPES ---

type Packet = {
  id: string;
  source: string;
  target: string;
  path?: string;
  headers?: Record<string, string>;
  destinationHost?: string;
  isMalicious: boolean;
  color: string;
};

type Policy = {
  id: string;
  location: 'ingress' | 'mesh' | 'egress';
  conditionField: string;
  conditionOperator: string;
  conditionValue: string;
  action: 'allow' | 'deny' | 'route-backend' | 'route-web';
};

const LEVELS = [
  {
    id: 1,
    title: "Level 1: The Gateway",
    description: "External traffic is hitting our Ingress Gateway. We need to route API requests to the Backend Service and drop unauthorized Admin access.",
    objective: "Route path '/api' to Backend. Deny path '/admin'.",
    availableLocations: ['ingress'],
    availableFields: ['path'],
    availableOperators: ['=='],
    availableValues: ['/api', '/admin'],
    availableActions: ['route-backend', 'deny'],
    packets: [
      { id: 'p1', source: 'external', target: 'ingress', path: '/api', isMalicious: false, color: '#00f0ff' },
      { id: 'p2', source: 'external', target: 'ingress', path: '/admin', isMalicious: true, color: '#ff003c' },
      { id: 'p3', source: 'external', target: 'ingress', path: '/api', isMalicious: false, color: '#00f0ff' },
    ]
  },
  {
    id: 2,
    title: "Level 2: The Bouncer",
    description: "Malicious actors are trying to exploit a vulnerability using a specific header. Block them at the edge before they enter the mesh.",
    objective: "Deny traffic where header 'X-Malicious' is 'true'. Allow all other traffic to Backend.",
    availableLocations: ['ingress'],
    availableFields: ['header:X-Malicious', 'path'],
    availableOperators: ['=='],
    availableValues: ['true', '/api'],
    availableActions: ['deny', 'route-backend'],
    packets: [
      { id: 'p1', source: 'external', target: 'ingress', headers: {'X-Malicious': 'true'}, isMalicious: true, color: '#ff003c' },
      { id: 'p2', source: 'external', target: 'ingress', path: '/api', isMalicious: false, color: '#00f0ff' },
      { id: 'p3', source: 'external', target: 'ingress', headers: {'X-Malicious': 'true'}, isMalicious: true, color: '#ff003c' },
    ]
  },
  {
    id: 3,
    title: "Level 3: Zero Trust Mesh",
    description: "Assume the network is compromised. Implement a Zero Trust policy inside the mesh.",
    objective: "In the Mesh, Allow source 'Service-A' to talk to Backend. Deny source 'Service-C'.",
    availableLocations: ['mesh'],
    availableFields: ['source'],
    availableOperators: ['=='],
    availableValues: ['Service-A', 'Service-C'],
    availableActions: ['allow', 'deny'],
    packets: [
      { id: 'p1', source: 'Service-A', target: 'mesh', isMalicious: false, color: '#00f0ff' },
      { id: 'p2', source: 'Service-C', target: 'mesh', isMalicious: true, color: '#ff003c' },
      { id: 'p3', source: 'Service-A', target: 'mesh', isMalicious: false, color: '#00f0ff' },
    ]
  },
  {
    id: 4,
    title: "Level 4: Egress Control",
    description: "A compromised pod is trying to exfiltrate data. We must restrict outbound traffic.",
    objective: "At Egress, Allow destination 'api.github.com'. Deny 'evil.com'.",
    availableLocations: ['egress'],
    availableFields: ['destination'],
    availableOperators: ['=='],
    availableValues: ['api.github.com', 'evil.com'],
    availableActions: ['allow', 'deny'],
    packets: [
      { id: 'p1', source: 'backend', target: 'egress', destinationHost: 'api.github.com', isMalicious: false, color: '#00f0ff' },
      { id: 'p2', source: 'backend', target: 'egress', destinationHost: 'evil.com', isMalicious: true, color: '#ff003c' },
      { id: 'p3', source: 'backend', target: 'egress', destinationHost: 'api.github.com', isMalicious: false, color: '#00f0ff' },
    ]
  }
];

export default function MeshGuardian() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [gameState, setGameState] = useState<'build' | 'simulating' | 'success' | 'failed'>('build');
  const [activePackets, setActivePackets] = useState<{packet: Packet, status: 'moving' | 'allowed' | 'denied', progress: number, delay: number}[]>([]);
  const [translatedConfig, setTranslatedConfig] = useState<string>('');

  const currentLevel = LEVELS[levelIndex];

  // Form states
  const [formLocation, setFormLocation] = useState(currentLevel.availableLocations[0]);
  const [formField, setFormField] = useState(currentLevel.availableFields[0]);
  const [formOperator, setFormOperator] = useState(currentLevel.availableOperators[0]);
  const [formValue, setFormValue] = useState(currentLevel.availableValues[0]);
  const [formAction, setFormAction] = useState(currentLevel.availableActions[0]);

  // Update form defaults when level changes
  useEffect(() => {
    setFormLocation(currentLevel.availableLocations[0]);
    setFormField(currentLevel.availableFields[0]);
    setFormOperator(currentLevel.availableOperators[0]);
    setFormValue(currentLevel.availableValues[0]);
    setFormAction(currentLevel.availableActions[0]);
    setPolicies([]);
    setGameState('build');
    setActivePackets([]);
    setTranslatedConfig('');
  }, [levelIndex, currentLevel]);

  // Generate xDS config visually
  useEffect(() => {
    if (policies.length === 0) {
      setTranslatedConfig('// No policies applied yet.\n// Awaiting Control Plane sync...');
      return;
    }

    let config = '{\n  "version_info": "1",\n  "resources": [\n';
    policies.forEach((p, idx) => {
      config += `    {\n`;
      config += `      "@type": "type.googleapis.com/envoy.config.route.v3.RouteConfiguration",\n`;
      config += `      "name": "${p.location}_route_${idx}",\n`;
      config += `      "match": {\n`;
      
      if (p.conditionField === 'path') {
        config += `        "prefix": "${p.conditionValue}"\n`;
      } else if (p.conditionField.startsWith('header:')) {
        const headerName = p.conditionField.split(':')[1];
        config += `        "headers": [{ "name": "${headerName}", "exact_match": "${p.conditionValue}" }]\n`;
      } else {
         config += `        "${p.conditionField}": "${p.conditionValue}"\n`;
      }

      config += `      },\n`;
      config += `      "route": {\n`;
      config += `        "cluster": "${p.action === 'deny' ? 'blackhole' : p.action}"\n`;
      config += `      }\n`;
      config += `    }${idx < policies.length - 1 ? ',' : ''}\n`;
    });
    config += `  ]\n}`;
    setTranslatedConfig(config);
  }, [policies]);

  const addPolicy = () => {
    const newPolicy: Policy = {
      id: Math.random().toString(36).substr(2, 9),
      location: formLocation as any,
      conditionField: formField,
      conditionOperator: formOperator,
      conditionValue: formValue,
      action: formAction as any
    };
    setPolicies([...policies, newPolicy]);
  };

  const removePolicy = (id: string) => {
    setPolicies(policies.filter(p => p.id !== id));
  };

  const evaluatePacket = (packet: Packet, pols: Policy[]) => {
    // Default action is drop if no match, or maybe pass? Let's say default pass if no rule, 
    // actually default deny is safer in zero trust, but for game let's just evaluate strictly.

    for (const p of pols) {
      let matched = false;
      if (p.conditionField === 'path' && packet.path === p.conditionValue) matched = true;
      if (p.conditionField.startsWith('header:') && packet.headers && packet.headers[p.conditionField.split(':')[1]] === p.conditionValue) matched = true;
      if (p.conditionField === 'source' && packet.source === p.conditionValue) matched = true;
      if (p.conditionField === 'destination' && packet.destinationHost === p.conditionValue) matched = true;

      if (matched) {
        if (p.action === 'deny') return 'denied';
        if (p.action === 'allow' || p.action.startsWith('route')) return 'allowed';
      }
    }
    
    // If it's malicious and wasn't denied, it slipped through!
    return 'allowed'; 
  };

  const runSimulation = () => {
    setGameState('simulating');
    
    // Initialize packets
    const initialPackets = currentLevel.packets.map((p, i) => ({
      packet: p,
      status: 'moving' as const,
      progress: 0,
      delay: i * 800 // stagger them
    }));
    
    setActivePackets(initialPackets);

    let passedAll = true;
    let completedCount = 0;

    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      
      setActivePackets(prev => {
        const next = [...prev];
        let allDone = true;

        next.forEach(p => {
          if (p.status !== 'moving') return;
          allDone = false;
          
          const elapsed = now - (startTime + p.delay);
          if (elapsed < 0) return; // wait for delay
          
          p.progress = Math.min(100, (elapsed / 2000) * 100); // 2 seconds to cross
          
          if (p.progress >= 50 && p.progress < 55) {
             // Evaluate at the halfway point (the gateway/proxy)
             const result = evaluatePacket(p.packet, policies);
             if (result === 'denied') {
                p.status = 'denied';
                if (!p.packet.isMalicious) passedAll = false; // Denied a good packet
                completedCount++;
             }
          }

          if (p.progress >= 100) {
            p.status = 'allowed';
            if (p.packet.isMalicious) passedAll = false; // Allowed a bad packet
            completedCount++;
          }
        });

        if (allDone || completedCount === currentLevel.packets.length) {
          clearInterval(interval);
          setTimeout(() => {
            setGameState(passedAll ? 'success' : 'failed');
          }, 500);
        }

        return next;
      });
    }, 50);
  };

  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex(levelIndex + 1);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back to Hub
          </Link>
          <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield color="var(--accent-neon)" size={36} />
            Mesh Guardian
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem', maxWidth: '800px' }}>
            {currentLevel.title} — {currentLevel.description}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Objective</div>
          <div style={{ fontSize: '1.1rem', color: 'var(--accent-warm)', fontWeight: 600 }}>{currentLevel.objective}</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1 }}>
        
        {/* LEFT PANEL: NETWORK VISUALIZATION */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--accent-purple)" />
            Live Network Traffic
          </h3>
          
          <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem' }}>
            
            {/* Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 2 }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>Internet</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', zIndex: 2 }}>
              <div style={{ padding: '1rem', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-neon)', borderRadius: '8px', textAlign: 'center', minWidth: '120px' }}>
                <Server size={24} style={{ margin: '0 auto 0.5rem' }} color="var(--accent-neon)" />
                Gateway
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 2 }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>Backend</div>
            </div>

            {/* Connection Lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
              <line x1="15%" y1="50%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50%" y1="50%" x2="85%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            {/* Packets */}
            <AnimatePresence>
              {activePackets.map((p, i) => {
                if (p.status === 'denied' && p.progress >= 50) return null; // disappear when denied at middle
                return (
                  <motion.div
                    key={i}
                    initial={{ left: '15%', opacity: 0 }}
                    animate={{ 
                      left: `${15 + (p.progress * 0.7)}%`,
                      opacity: p.progress > 0 && p.progress < 100 ? 1 : 0
                    }}
                    transition={{ type: 'tween', ease: 'linear', duration: 0.05 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(50% - 10px)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: p.packet.color,
                      boxShadow: `0 0 15px ${p.packet.color}`,
                      zIndex: 3
                    }}
                  />
                );
              })}
            </AnimatePresence>
            
          </div>

          {/* SIMULATION OVERLAY */}
          <AnimatePresence>
            {gameState === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,20,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)' }}>
                <CheckCircle size={64} color="#00ff88" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '2.5rem', color: '#00ff88', marginBottom: '1rem' }}>Mesh Secured</h2>
                <p style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>All policies enforced correctly.</p>
                {levelIndex < LEVELS.length - 1 ? (
                  <button onClick={nextLevel} style={{ padding: '1rem 2rem', background: '#00ff88', color: '#000', border: 'none', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Next Level</button>
                ) : (
                  <Link to="/" style={{ padding: '1rem 2rem', background: '#00ff88', color: '#000', border: 'none', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none' }}>Return to Hub</Link>
                )}
              </motion.div>
            )}
            {gameState === 'failed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: 'rgba(20,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)' }}>
                <XCircle size={64} color="#ff003c" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '2.5rem', color: '#ff003c', marginBottom: '1rem' }}>Breach Detected</h2>
                <p style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>Malicious traffic slipped through, or good traffic was blocked.</p>
                <button onClick={() => setGameState('build')} style={{ padding: '1rem 2rem', background: '#ff003c', color: '#fff', border: 'none', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Adjust Policies & Retry</button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT PANEL: CONTROL PLANE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--accent-warm)" />
              Policy Builder
            </h3>
            
            {/* Policy Form */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>IF</span>
              <select value={formLocation} onChange={e => setFormLocation(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                {currentLevel.availableLocations.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
              
              <select value={formField} onChange={e => setFormField(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                {currentLevel.availableFields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              
              <select value={formOperator} onChange={e => setFormOperator(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                {currentLevel.availableOperators.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              
              <select value={formValue} onChange={e => setFormValue(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                {currentLevel.availableValues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>THEN</span>
              
              <select value={formAction} onChange={e => setFormAction(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                {currentLevel.availableActions.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
              </select>
              
              <button onClick={addPolicy} style={{ marginLeft: 'auto', background: 'var(--accent-neon)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Add
              </button>
            </div>

            {/* Active Policies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              {policies.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '1rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>No policies active. Traffic will flow unrestricted.</div>
              ) : (
                policies.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,240,255,0.1)', borderLeft: '4px solid var(--accent-neon)', padding: '1rem', borderRadius: '4px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>[{i+1}]</span> <b>{p.location.toUpperCase()}</b>: IF <i>{p.conditionField} {p.conditionOperator} {p.conditionValue}</i> THEN <b>{p.action.toUpperCase()}</b>
                    </div>
                    <button onClick={() => removePolicy(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                  </div>
                ))
              )}
            </div>

            {/* Control Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button 
                onClick={runSimulation}
                disabled={gameState === 'simulating'}
                style={{ flex: 1, padding: '1rem', background: gameState === 'simulating' ? 'rgba(255,255,255,0.1)' : 'var(--accent-neon)', color: gameState === 'simulating' ? 'var(--text-secondary)' : '#000', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: gameState === 'simulating' ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <Play size={20} />
                {gameState === 'simulating' ? 'Simulating...' : 'Apply & Test Traffic'}
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TerminalIcon size={20} color="var(--accent-neon)" />
              Translated Proxy Config (xDS)
            </h3>
            <pre style={{ margin: 0, padding: '1rem', background: 'rgba(0,0,0,0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#00f0ff', fontSize: '0.85rem', overflowY: 'auto', maxHeight: '200px', fontFamily: 'monospace' }}>
              {translatedConfig}
            </pre>
          </div>
          
        </div>

      </div>
    </div>
  );
}
