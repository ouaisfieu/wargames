import { useState, useEffect, useCallback } from 'react';

// Configuration
const CONFIG = {
  levels: [
    { name: 'Observateur', threshold: 0, color: '#4a4a5a' },
    { name: 'Sentinelle', threshold: 100, color: '#00ccff' },
    { name: 'Analyste', threshold: 500, color: '#00ff88' },
    { name: 'Architecte', threshold: 2000, color: '#ffaa00' },
    { name: 'Oracle', threshold: 10000, color: '#ff3366' }
  ],
  secrets: {
    'USBA-001': { reward: 50, hint: 'Le premier fragment se cache dans le vide...' },
    'USBA-002': { reward: 75, hint: 'Konami savait. ↑↑↓↓←→←→BA' },
    'USBA-003': { reward: 100, hint: 'Double-cliquez sur le code binaire.' },
  }
};

const adjectives = ['Shadow', 'Silent', 'Ghost', 'Cipher', 'Vector', 'Phantom', 'Echo', 'Nova', 'Pulse', 'Nexus'];
const nouns = ['Walker', 'Hunter', 'Watcher', 'Seeker', 'Runner', 'Finder', 'Reader', 'Keeper', 'Breaker', 'Weaver'];

export default function ProtocoleUSBA() {
  const [fragments, setFragments] = useState(0);
  const [codename, setCodename] = useState('');
  const [secretsFound, setSecretsFound] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [missionsCompleted, setMissionsCompleted] = useState([]);
  
  // Generate codename on mount
  useEffect(() => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    setCodename(`${adj}${noun}${num.toString().padStart(2, '0')}`);
    
    // Welcome bonus
    setTimeout(() => addFragments(10, 'Bonus de bienvenue'), 1000);
  }, []);
  
  // Konami code listener
  useEffect(() => {
    const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    const handleKeyDown = (e) => {
      if (e.code === pattern[konamiProgress]) {
        const newProgress = konamiProgress + 1;
        setKonamiProgress(newProgress);
        
        if (newProgress === pattern.length) {
          unlockSecret('USBA-002');
          setKonamiProgress(0);
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 5000);
        }
      } else {
        setKonamiProgress(0);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress]);
  
  const getLevel = useCallback(() => {
    for (let i = CONFIG.levels.length - 1; i >= 0; i--) {
      if (fragments >= CONFIG.levels[i].threshold) return i;
    }
    return 0;
  }, [fragments]);
  
  const getLevelInfo = useCallback(() => {
    const level = getLevel();
    const current = CONFIG.levels[level];
    const next = CONFIG.levels[level + 1];
    const progress = next 
      ? ((fragments - current.threshold) / (next.threshold - current.threshold)) * 100 
      : 100;
    return { current, next, progress, level };
  }, [fragments, getLevel]);
  
  const addFragments = (amount, reason) => {
    setFragments(prev => prev + amount);
    showNotification(`+${amount} ◈ ${reason}`, 'success');
  };
  
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  const unlockSecret = (secretId) => {
    if (secretsFound.includes(secretId)) {
      showNotification('Secret déjà découvert', 'info');
      return;
    }
    
    const secret = CONFIG.secrets[secretId];
    if (secret) {
      setSecretsFound(prev => [...prev, secretId]);
      addFragments(secret.reward, `Secret ${secretId}`);
      showNotification(`🔓 Secret découvert : ${secretId}`, 'secret');
    }
  };
  
  const checkMission = (missionId) => {
    if (!missionsCompleted.includes(missionId)) {
      setMissionsCompleted(prev => [...prev, missionId]);
      return true;
    }
    return false;
  };
  
  const levelInfo = getLevelInfo();
  
  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#cacad5',
      fontFamily: "'Crimson Pro', Georgia, serif",
      position: 'relative',
      overflow: 'hidden'
    },
    scanlines: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.015) 2px, rgba(0, 255, 136, 0.015) 4px)',
      pointerEvents: 'none',
      zIndex: 9999
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '1rem 2rem',
      background: 'linear-gradient(to bottom, #0a0a0f 0%, transparent 100%)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '1.2rem',
      fontWeight: 700,
      color: '#00ff88',
      textShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer'
    },
    nav: {
      display: 'flex',
      gap: '2rem'
    },
    navLink: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#8a8a9a',
      cursor: 'pointer',
      transition: 'color 0.3s',
      background: 'none',
      border: 'none'
    },
    statusBar: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#4a4a5a'
    },
    fragmentDisplay: {
      color: '#00ff88',
      fontWeight: 500
    },
    hero: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '8rem 2rem 4rem',
      position: 'relative'
    },
    heroBg: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 20% 80%, rgba(0, 255, 136, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0, 204, 255, 0.15) 0%, transparent 50%)',
      animation: glitchActive ? 'none' : undefined
    },
    pretitle: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '0.3em',
      color: '#00ff88',
      marginBottom: '1rem'
    },
    title: {
      fontSize: 'clamp(3rem, 10vw, 6rem)',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 0.9,
      marginBottom: '2rem',
      background: glitchActive 
        ? 'linear-gradient(135deg, #ff3366, #00ff88, #00ccff, #ff3366)' 
        : 'linear-gradient(135deg, #eaeaf0 0%, #00ff88 50%, #00ccff 100%)',
      backgroundSize: glitchActive ? '400% 400%' : '100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: glitchActive ? 'rainbow 0.5s linear infinite' : undefined
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#8a8a9a',
      maxWidth: '600px',
      marginBottom: '3rem',
      lineHeight: 1.6
    },
    code: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.9em',
      background: '#1a1a25',
      padding: '0.15em 0.4em',
      borderRadius: '3px',
      color: '#00ff88'
    },
    btn: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.85rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '1rem 2rem',
      border: '1px solid #2a2a3a',
      background: 'transparent',
      color: '#cacad5',
      cursor: 'pointer',
      transition: 'all 0.3s',
      margin: '0.5rem'
    },
    btnPrimary: {
      background: '#00ff88',
      borderColor: '#00ff88',
      color: '#0a0a0f'
    },
    section: {
      padding: '4rem 2rem'
    },
    card: {
      background: '#12121a',
      border: '1px solid #1a1a25',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'all 0.3s',
      cursor: 'pointer'
    },
    dataGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '2rem'
    },
    dataCell: {
      background: '#12121a',
      border: '1px solid #1a1a25',
      padding: '1rem',
      textAlign: 'center'
    },
    dataCellValue: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '2rem',
      fontWeight: 700,
      color: '#00ff88',
      lineHeight: 1,
      marginBottom: '0.5rem'
    },
    dataCellLabel: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#4a4a5a'
    },
    progressContainer: {
      height: '4px',
      background: '#1a1a25',
      borderRadius: '2px',
      overflow: 'hidden',
      maxWidth: '400px',
      margin: '1rem auto'
    },
    progressBar: {
      height: '100%',
      background: 'linear-gradient(90deg, #00ff88, #00ccff)',
      transition: 'width 0.5s ease'
    },
    notification: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      background: '#12121a',
      border: '1px solid #00ff88',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease'
    },
    terminal: {
      background: '#12121a',
      border: '1px solid #1a1a25',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.85rem',
      overflow: 'hidden',
      maxWidth: '600px',
      margin: '2rem auto'
    },
    terminalHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#1a1a25',
      borderBottom: '1px solid #2a2a3a'
    },
    terminalDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%'
    },
    terminalBody: {
      padding: '1rem',
      maxHeight: '300px',
      overflowY: 'auto'
    },
    terminalLine: {
      lineHeight: 1.6,
      color: '#8a8a9a'
    },
    hiddenSecret: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      fontSize: '0.5rem',
      color: '#0a0a0f',
      cursor: 'pointer',
      transition: 'color 0.3s'
    },
    binaryCode: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.6rem',
      color: '#1a1a25',
      textAlign: 'center',
      marginTop: '2rem',
      cursor: 'pointer',
      transition: 'color 0.3s',
      userSelect: 'none'
    }
  };
  
  const renderHomePage = () => (
    <>
      <section style={styles.hero}>
        <div style={styles.heroBg}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <p style={styles.pretitle}>// TRANSMISSION INTERCEPTÉE</p>
          <h1 style={styles.title}>PROTOCOLE USBA</h1>
          <p style={styles.subtitle}>
            La faille est ouverte. Le répertoire <span style={styles.code}>/usba/</span> n'était pas vide. 
            Chaque action compte. Chaque Fragment rapproche de la vérité.
          </p>
          <div>
            <button 
              style={{...styles.btn, ...styles.btnPrimary}}
              onClick={() => { setCurrentPage('missions'); addFragments(5, 'Exploration'); }}
              onMouseOver={e => e.target.style.background = '#eaeaf0'}
              onMouseOut={e => e.target.style.background = '#00ff88'}
            >
              Commencer les Missions
            </button>
            <button 
              style={styles.btn}
              onClick={() => setCurrentPage('about')}
              onMouseOver={e => { e.target.style.borderColor = '#00ff88'; e.target.style.color = '#00ff88'; }}
              onMouseOut={e => { e.target.style.borderColor = '#2a2a3a'; e.target.style.color = '#cacad5'; }}
            >
              Comprendre le Protocole
            </button>
          </div>
          <p style={{...styles.pretitle, marginTop: '3rem', fontSize: '0.9rem', color: '#4a4a5a'}}>
            {'>'} Bienvenue, Agent {codename}
            <span style={{display: 'inline-block', width: '10px', height: '1.2em', background: '#00ff88', marginLeft: '4px', animation: 'blink 1s step-end infinite'}}></span>
          </p>
        </div>
        
        {/* Secret caché */}
        <div 
          style={styles.hiddenSecret}
          onClick={() => unlockSecret('USBA-001')}
          onMouseOver={e => e.target.style.color = '#00ff88'}
          onMouseOut={e => e.target.style.color = '#0a0a0f'}
          title="..."
        >
          ◈ USBA-001 ◈
        </div>
      </section>
      
      {/* Stats */}
      <section style={{...styles.section, background: '#12121a'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div style={styles.dataGrid}>
            <div style={styles.dataCell}>
              <div style={styles.dataCellValue}>{fragments}</div>
              <div style={styles.dataCellLabel}>Fragments ◈</div>
            </div>
            <div style={styles.dataCell}>
              <div style={{...styles.dataCellValue, fontSize: '1.2rem', color: levelInfo.current.color}}>{levelInfo.current.name}</div>
              <div style={styles.dataCellLabel}>Niveau</div>
            </div>
            <div style={styles.dataCell}>
              <div style={styles.dataCellValue}>{missionsCompleted.length}</div>
              <div style={styles.dataCellLabel}>Missions</div>
            </div>
            <div style={styles.dataCell}>
              <div style={styles.dataCellValue}>{secretsFound.length}/3</div>
              <div style={styles.dataCellLabel}>Secrets</div>
            </div>
          </div>
          
          <div style={styles.progressContainer}>
            <div style={{...styles.progressBar, width: `${levelInfo.progress}%`}}></div>
          </div>
          <p style={{...styles.dataCellLabel, textAlign: 'center'}}>
            {levelInfo.next ? `${levelInfo.next.threshold - fragments} ◈ avant ${levelInfo.next.name}` : 'Niveau maximum atteint'}
          </p>
        </div>
      </section>
      
      {/* Terminal */}
      <section style={styles.section}>
        <div style={styles.terminal}>
          <div style={styles.terminalHeader}>
            <span style={{...styles.terminalDot, background: '#ff3366'}}></span>
            <span style={{...styles.terminalDot, background: '#ffaa00'}}></span>
            <span style={{...styles.terminalDot, background: '#00ff88'}}></span>
            <span style={{fontSize: '0.75rem', color: '#4a4a5a', marginLeft: '0.5rem'}}>usba_terminal v0.1.0</span>
          </div>
          <div style={styles.terminalBody}>
            <div style={styles.terminalLine}><span style={{color: '#00ff88'}}>❯</span> init protocole_usba</div>
            <div style={styles.terminalLine}>Chargement des modules...</div>
            <div style={{...styles.terminalLine, color: '#00ff88'}}>✓ Module FRAGMENTS activé</div>
            <div style={{...styles.terminalLine, color: '#00ff88'}}>✓ Module MISSIONS activé</div>
            <div style={{...styles.terminalLine, color: '#00ff88'}}>✓ Agent authentifié : {codename}</div>
            <div style={styles.terminalLine}></div>
            <div style={styles.terminalLine}><span style={{color: '#00ff88'}}>❯</span> status</div>
            <div style={styles.terminalLine}>Fragments : {fragments} ◈</div>
            <div style={styles.terminalLine}>Niveau : {levelInfo.current.name}</div>
            <div style={styles.terminalLine}>Secrets : {secretsFound.length}/3</div>
            <div style={styles.terminalLine}></div>
            <div style={styles.terminalLine}><span style={{color: '#00ff88'}}>❯</span> hint</div>
            <div style={{...styles.terminalLine, color: '#ffaa00'}}>
              {secretsFound.length < 3 
                ? CONFIG.secrets[Object.keys(CONFIG.secrets).find(k => !secretsFound.includes(k))]?.hint 
                : 'Tous les secrets ont été découverts!'}
            </div>
          </div>
        </div>
        
        {/* Binary code secret */}
        <div 
          style={styles.binaryCode}
          onDoubleClick={() => unlockSecret('USBA-003')}
          onMouseOver={e => e.target.style.color = '#4a4a5a'}
          onMouseOut={e => e.target.style.color = '#1a1a25'}
        >
          01010101 01010011 01000010 01000001
        </div>
      </section>
    </>
  );
  
  const renderMissionsPage = () => {
    const missions = [
      { id: 'M001', title: 'Première Connexion', desc: 'Activez votre profil', reward: 10, done: missionsCompleted.includes('M001') },
      { id: 'M002', title: 'Explorateur', desc: 'Visitez toutes les pages', reward: 25, done: missionsCompleted.includes('M002') },
      { id: 'M003', title: 'Chercheur de Secrets', desc: 'Trouvez un secret', reward: 50, done: secretsFound.length > 0 },
      { id: 'M004', title: 'Konami Master', desc: '↑↑↓↓←→←→BA', reward: 75, done: secretsFound.includes('USBA-002') },
      { id: 'M005', title: 'Collectionneur', desc: 'Trouvez tous les secrets', reward: 200, done: secretsFound.length >= 3 },
    ];
    
    return (
      <section style={{...styles.section, paddingTop: '8rem'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <p style={styles.pretitle}>// CENTRE DE COMMANDEMENT</p>
          <h2 style={{fontSize: '2.5rem', marginBottom: '2rem', color: '#eaeaf0'}}>Missions</h2>
          
          {missions.map(mission => (
            <div 
              key={mission.id}
              style={{
                ...styles.card,
                borderLeft: `3px solid ${mission.done ? '#00ff88' : '#ff3366'}`,
                opacity: mission.done ? 0.7 : 1
              }}
              onClick={() => {
                if (!mission.done && checkMission(mission.id)) {
                  addFragments(mission.reward, mission.title);
                }
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <span style={{...styles.dataCellLabel, color: mission.done ? '#00ff88' : '#ff3366'}}>
                    {mission.done ? '✓ COMPLÉTÉ' : '○ EN COURS'}
                  </span>
                  <h3 style={{color: '#eaeaf0', margin: '0.5rem 0'}}>{mission.title}</h3>
                  <p style={{color: '#8a8a9a', margin: 0}}>{mission.desc}</p>
                </div>
                <div style={{...styles.fragmentDisplay, fontSize: '1.2rem'}}>+{mission.reward} ◈</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  const renderAboutPage = () => (
    <section style={{...styles.section, paddingTop: '8rem'}}>
      <div style={{maxWidth: '700px', margin: '0 auto', lineHeight: 1.8}}>
        <p style={styles.pretitle}>// MANIFESTE</p>
        <h2 style={{fontSize: '2.5rem', marginBottom: '2rem', color: '#eaeaf0'}}>Le Protocole</h2>
        
        <p style={{color: '#8a8a9a', marginBottom: '1.5rem'}}>
          Il y avait un répertoire. <span style={styles.code}>/usba/</span>. Officiellement vide. 
          Mais certains avaient remarqué des traces — des logs bizarres, des références dans du code source.
        </p>
        
        <p style={{color: '#8a8a9a', marginBottom: '1.5rem'}}>
          Ce répertoire contenait l'ébauche d'un système conçu pour mesurer ce qui n'a jamais été mesuré : 
          <strong style={{color: '#00ff88'}}> la valeur de l'engagement citoyen</strong>.
        </p>
        
        <p style={{color: '#8a8a9a', marginBottom: '1.5rem'}}>
          Le Protocole USBA est un <strong style={{color: '#00ccff'}}>ARG</strong> — un jeu en réalité alternée — 
          mais c'est aussi plus que ça. C'est une expérience sociale. Un prototype de ce que pourrait être 
          une économie de la participation.
        </p>
        
        <blockquote style={{
          borderLeft: '3px solid #00ff88',
          paddingLeft: '1.5rem',
          margin: '2rem 0',
          fontStyle: 'italic',
          color: '#eaeaf0'
        }}>
          "Le jeu est la forme la plus élevée de la recherche."
          <span style={{display: 'block', fontSize: '0.9rem', color: '#4a4a5a', marginTop: '0.5rem'}}>— Albert Einstein</span>
        </blockquote>
        
        <h3 style={{color: '#00ff88', marginTop: '3rem'}}>Les règles sont simples :</h3>
        <ul style={{color: '#8a8a9a', paddingLeft: '1.5rem'}}>
          <li>Chaque action génère des <strong style={{color: '#00ff88'}}>Fragments (◈)</strong></li>
          <li>Les Fragments prouvent votre engagement</li>
          <li>Plus vous participez, plus vous progressez</li>
          <li>Des secrets sont cachés partout</li>
          <li>Le code est ouvert. Les règles sont transparentes.</li>
        </ul>
      </div>
    </section>
  );
  
  return (
    <div style={styles.container}>
      {/* Scanlines effect */}
      <div style={styles.scanlines}></div>
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => setCurrentPage('home')}>
          <span style={{fontSize: '1.5em', animation: 'pulse 2s ease-in-out infinite'}}>◈</span>
          <span>PROTOCOLE USBA</span>
        </div>
        
        <nav style={styles.nav}>
          {['home', 'missions', 'about'].map(page => (
            <button
              key={page}
              style={{
                ...styles.navLink,
                color: currentPage === page ? '#00ff88' : '#8a8a9a'
              }}
              onClick={() => { setCurrentPage(page); addFragments(1, 'Navigation'); }}
            >
              {page === 'home' ? 'Accueil' : page === 'missions' ? 'Missions' : 'Protocole'}
            </button>
          ))}
        </nav>
        
        <div style={styles.statusBar}>
          <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', animation: 'blink 1s ease-in-out infinite'}}></span>
          <span>EN LIGNE</span>
          <span style={styles.fragmentDisplay}>◈ {fragments}</span>
        </div>
      </header>
      
      {/* Content */}
      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'missions' && renderMissionsPage()}
      {currentPage === 'about' && renderAboutPage()}
      
      {/* Notifications */}
      {notifications.map((notif, i) => (
        <div 
          key={notif.id}
          style={{
            ...styles.notification,
            bottom: `${20 + i * 60}px`,
            borderColor: notif.type === 'secret' ? '#aa88ff' : '#00ff88'
          }}
        >
          <span>{notif.type === 'secret' ? '🔓' : '◈'}</span>
          <span>{notif.message}</span>
        </div>
      ))}
      
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(120%); }
          to { transform: translateX(0); }
        }
        
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #12121a; }
        ::-webkit-scrollbar-thumb { background: rgba(0, 255, 136, 0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #00ff88; }
      `}</style>
    </div>
  );
}
