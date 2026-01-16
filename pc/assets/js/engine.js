/**
 * ═══════════════════════════════════════════════════════════════
 * PROTOCOLE USBA — Game Engine
 * Version: 0.1.0-alpha
 * Codename: FRAGMENT_ZERO
 * ═══════════════════════════════════════════════════════════════
 * 
 * Ce moteur gère :
 * - L'économie des Fragments (◈)
 * - Le système de niveaux et progression
 * - Les missions et récompenses
 * - Les secrets et easter eggs
 * - La persistance des données (localStorage)
 * - La synchronisation temps réel (optionnel)
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════
  
  const CONFIG = {
    version: '0.1.0-alpha',
    codename: 'FRAGMENT_ZERO',
    storageKey: 'usba_protocol_data',
    apiEndpoint: null, // Pour une future API de synchronisation
    debug: true,
    
    // Économie
    economy: {
      fragmentSymbol: '◈',
      levels: [
        { name: 'Observateur', threshold: 0, color: '#4a4a5a' },
        { name: 'Sentinelle', threshold: 100, color: '#00ccff' },
        { name: 'Analyste', threshold: 500, color: '#00ff88' },
        { name: 'Architecte', threshold: 2000, color: '#ffaa00' },
        { name: 'Oracle', threshold: 10000, color: '#ff3366' }
      ],
      rewards: {
        pageView: 1,
        secretFound: 25,
        missionComplete: 50,
        puzzleSolved: 100,
        contentCreated: 75,
        dailyLogin: 10,
        referral: 100
      }
    },
    
    // Secrets cachés dans le site
    secrets: {
      'USBA-001': { reward: 50, hint: 'Le premier fragment se cache dans le vide...' },
      'USBA-002': { reward: 75, hint: 'Konami savait.' },
      'USBA-003': { reward: 100, hint: 'Les archives parlent à ceux qui écoutent.' },
      'USBA-004': { reward: 150, hint: 'Le temps est une spirale.' },
      'USBA-005': { reward: 200, hint: '42.' }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  const defaultState = {
    agent: {
      id: null,
      codename: null,
      createdAt: null,
      lastSeen: null
    },
    fragments: 0,
    level: 0,
    missions: {
      completed: [],
      active: [],
      available: []
    },
    secrets: {
      found: [],
      hints: []
    },
    achievements: [],
    stats: {
      pagesVisited: [],
      totalPageViews: 0,
      sessionsCount: 0,
      timeSpent: 0,
      clickCount: 0
    },
    history: [],
    settings: {
      sound: true,
      notifications: true,
      theme: 'dark'
    }
  };

  let state = { ...defaultState };

  // ═══════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════
  
  const Storage = {
    save() {
      try {
        const data = JSON.stringify(state);
        localStorage.setItem(CONFIG.storageKey, data);
        if (CONFIG.debug) console.log('[USBA] State saved');
        return true;
      } catch (e) {
        console.error('[USBA] Failed to save state:', e);
        return false;
      }
    },

    load() {
      try {
        const data = localStorage.getItem(CONFIG.storageKey);
        if (data) {
          state = { ...defaultState, ...JSON.parse(data) };
          if (CONFIG.debug) console.log('[USBA] State loaded:', state);
          return true;
        }
        return false;
      } catch (e) {
        console.error('[USBA] Failed to load state:', e);
        return false;
      }
    },

    clear() {
      localStorage.removeItem(CONFIG.storageKey);
      state = { ...defaultState };
      if (CONFIG.debug) console.log('[USBA] State cleared');
    },

    export() {
      return btoa(JSON.stringify(state));
    },

    import(encoded) {
      try {
        state = JSON.parse(atob(encoded));
        Storage.save();
        return true;
      } catch (e) {
        console.error('[USBA] Failed to import state:', e);
        return false;
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // AGENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  const Agent = {
    init() {
      if (!state.agent.id) {
        state.agent.id = this.generateId();
        state.agent.codename = this.generateCodename();
        state.agent.createdAt = new Date().toISOString();
        Storage.save();
        this.logEvent('AGENT_CREATED', { codename: state.agent.codename });
      }
      state.agent.lastSeen = new Date().toISOString();
      state.stats.sessionsCount++;
      Storage.save();
    },

    generateId() {
      return 'USBA-' + Date.now().toString(36).toUpperCase() + '-' + 
             Math.random().toString(36).substr(2, 6).toUpperCase();
    },

    generateCodename() {
      const adjectives = ['Shadow', 'Silent', 'Ghost', 'Cipher', 'Vector', 'Phantom', 'Echo', 'Nova', 'Pulse', 'Nexus'];
      const nouns = ['Walker', 'Hunter', 'Watcher', 'Seeker', 'Runner', 'Finder', 'Reader', 'Keeper', 'Breaker', 'Weaver'];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(Math.random() * 99) + 1;
      return `${adj}${noun}${num.toString().padStart(2, '0')}`;
    },

    getInfo() {
      return {
        ...state.agent,
        level: this.getLevel(),
        fragments: state.fragments,
        rank: this.getRank()
      };
    },

    getLevel() {
      const levels = CONFIG.economy.levels;
      for (let i = levels.length - 1; i >= 0; i--) {
        if (state.fragments >= levels[i].threshold) {
          return i;
        }
      }
      return 0;
    },

    getLevelInfo() {
      const level = this.getLevel();
      const current = CONFIG.economy.levels[level];
      const next = CONFIG.economy.levels[level + 1];
      return {
        current,
        next,
        progress: next ? (state.fragments - current.threshold) / (next.threshold - current.threshold) : 1
      };
    },

    getRank() {
      return CONFIG.economy.levels[this.getLevel()].name;
    },

    logEvent(type, data = {}) {
      const event = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      state.history.push(event);
      if (state.history.length > 1000) {
        state.history = state.history.slice(-500);
      }
      if (CONFIG.debug) console.log('[USBA] Event:', type, data);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // FRAGMENT ECONOMY
  // ═══════════════════════════════════════════════════════════════
  
  const Fragments = {
    get() {
      return state.fragments;
    },

    add(amount, reason = 'unknown') {
      const oldLevel = Agent.getLevel();
      state.fragments += amount;
      const newLevel = Agent.getLevel();
      
      Agent.logEvent('FRAGMENTS_EARNED', { amount, reason, total: state.fragments });
      
      if (newLevel > oldLevel) {
        this.onLevelUp(oldLevel, newLevel);
      }
      
      Storage.save();
      this.updateUI();
      this.showNotification(`+${amount} ${CONFIG.economy.fragmentSymbol}`, 'success');
      
      return state.fragments;
    },

    spend(amount, reason = 'unknown') {
      if (state.fragments >= amount) {
        state.fragments -= amount;
        Agent.logEvent('FRAGMENTS_SPENT', { amount, reason, total: state.fragments });
        Storage.save();
        this.updateUI();
        return true;
      }
      this.showNotification('Fragments insuffisants', 'error');
      return false;
    },

    onLevelUp(oldLevel, newLevel) {
      const levelInfo = CONFIG.economy.levels[newLevel];
      Agent.logEvent('LEVEL_UP', { oldLevel, newLevel, name: levelInfo.name });
      this.showNotification(`Niveau atteint : ${levelInfo.name}!`, 'levelup');
      
      // Bonus de niveau
      const bonus = (newLevel - oldLevel) * 50;
      setTimeout(() => {
        this.add(bonus, 'level_up_bonus');
      }, 1000);
    },

    updateUI() {
      // Mise à jour de tous les affichages de fragments
      document.querySelectorAll('[data-fragments]').forEach(el => {
        el.textContent = state.fragments;
      });
      
      document.querySelectorAll('[data-level]').forEach(el => {
        el.textContent = Agent.getRank();
      });
      
      document.querySelectorAll('[data-level-progress]').forEach(el => {
        const info = Agent.getLevelInfo();
        el.style.width = (info.progress * 100) + '%';
      });

      document.querySelectorAll('[data-codename]').forEach(el => {
        el.textContent = state.agent.codename;
      });
    },

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `usba-notification usba-notification--${type}`;
      notification.innerHTML = `
        <span class="usba-notification__icon">${this.getNotificationIcon(type)}</span>
        <span class="usba-notification__message">${message}</span>
      `;
      
      document.body.appendChild(notification);
      
      requestAnimationFrame(() => {
        notification.classList.add('usba-notification--visible');
      });
      
      setTimeout(() => {
        notification.classList.remove('usba-notification--visible');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },

    getNotificationIcon(type) {
      const icons = {
        success: '◈',
        error: '⚠',
        levelup: '★',
        secret: '🔓',
        info: 'ℹ'
      };
      return icons[type] || icons.info;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // MISSIONS
  // ═══════════════════════════════════════════════════════════════
  
  const Missions = {
    list: [
      {
        id: 'M001',
        title: 'Première Connexion',
        description: 'Activez votre profil d\'Agent',
        reward: 10,
        type: 'onboarding',
        condition: () => state.stats.sessionsCount >= 1
      },
      {
        id: 'M002',
        title: 'Explorateur',
        description: 'Visitez 5 pages différentes',
        reward: 25,
        type: 'exploration',
        condition: () => state.stats.pagesVisited.length >= 5
      },
      {
        id: 'M003',
        title: 'Archiviste',
        description: 'Accédez à la section Archives',
        reward: 30,
        type: 'exploration',
        condition: () => state.stats.pagesVisited.includes('/archives')
      },
      {
        id: 'M004',
        title: 'Chercheur de Secrets',
        description: 'Trouvez votre premier Fragment caché',
        reward: 50,
        type: 'discovery',
        condition: () => state.secrets.found.length >= 1
      },
      {
        id: 'M005',
        title: 'Sentinelle Active',
        description: 'Atteignez le niveau Sentinelle',
        reward: 100,
        type: 'progression',
        condition: () => Agent.getLevel() >= 1
      },
      {
        id: 'M006',
        title: 'Collectionneur',
        description: 'Trouvez 3 Fragments cachés',
        reward: 150,
        type: 'discovery',
        condition: () => state.secrets.found.length >= 3
      },
      {
        id: 'M007',
        title: 'Le Code Konami',
        description: '↑↑↓↓←→←→BA',
        reward: 100,
        type: 'easter_egg',
        hidden: true,
        condition: () => state.achievements.includes('konami')
      },
      {
        id: 'M008',
        title: 'Analyste Confirmé',
        description: 'Atteignez le niveau Analyste',
        reward: 200,
        type: 'progression',
        condition: () => Agent.getLevel() >= 2
      },
      {
        id: 'M009',
        title: 'Régulier',
        description: 'Connectez-vous 7 jours consécutifs',
        reward: 250,
        type: 'engagement',
        condition: () => this.checkConsecutiveDays(7)
      },
      {
        id: 'M010',
        title: 'Maître des Archives',
        description: 'Trouvez tous les Fragments cachés',
        reward: 500,
        type: 'discovery',
        condition: () => state.secrets.found.length >= Object.keys(CONFIG.secrets).length
      }
    ],

    checkConsecutiveDays(days) {
      // Simplifié pour la démo
      return state.stats.sessionsCount >= days;
    },

    check() {
      this.list.forEach(mission => {
        if (!state.missions.completed.includes(mission.id)) {
          if (mission.condition()) {
            this.complete(mission);
          }
        }
      });
    },

    complete(mission) {
      state.missions.completed.push(mission.id);
      Fragments.add(mission.reward, `mission_${mission.id}`);
      Agent.logEvent('MISSION_COMPLETE', { id: mission.id, title: mission.title });
      Fragments.showNotification(`Mission accomplie : ${mission.title}`, 'success');
      Storage.save();
      this.updateUI();
    },

    getAvailable() {
      return this.list.filter(m => 
        !m.hidden && !state.missions.completed.includes(m.id)
      );
    },

    getCompleted() {
      return this.list.filter(m => 
        state.missions.completed.includes(m.id)
      );
    },

    updateUI() {
      const container = document.querySelector('[data-missions]');
      if (!container) return;

      const available = this.getAvailable();
      const completed = this.getCompleted();

      container.innerHTML = `
        <div class="mission-board">
          ${available.map(m => `
            <div class="mission" data-mission-id="${m.id}">
              <div class="mission__status mission__status--active">○</div>
              <div class="mission__content">
                <div class="mission__title">${m.title}</div>
                <div class="mission__description">${m.description}</div>
              </div>
              <div class="mission__reward">+${m.reward} ◈</div>
            </div>
          `).join('')}
          ${completed.slice(-3).map(m => `
            <div class="mission mission--complete">
              <div class="mission__status mission__status--complete">✓</div>
              <div class="mission__content">
                <div class="mission__title">${m.title}</div>
                <div class="mission__description">${m.description}</div>
              </div>
              <div class="mission__reward">+${m.reward} ◈</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECRETS & EASTER EGGS
  // ═══════════════════════════════════════════════════════════════
  
  const Secrets = {
    init() {
      this.setupKonamiCode();
      this.setupHiddenElements();
      this.setupConsoleSecrets();
    },

    setupKonamiCode() {
      const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                       'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                       'KeyB', 'KeyA'];
      let current = 0;

      document.addEventListener('keydown', (e) => {
        if (e.code === pattern[current]) {
          current++;
          if (current === pattern.length) {
            this.unlockSecret('konami');
            document.body.classList.add('konami-active');
            setTimeout(() => document.body.classList.remove('konami-active'), 10000);
            current = 0;
          }
        } else {
          current = 0;
        }
      });
    },

    setupHiddenElements() {
      document.querySelectorAll('[data-secret]').forEach(el => {
        const secretId = el.dataset.secret;
        el.addEventListener('click', () => {
          this.unlockSecret(secretId);
        });
      });

      // Double-click secrets
      document.querySelectorAll('[data-secret-dblclick]').forEach(el => {
        const secretId = el.dataset.secretDblclick;
        el.addEventListener('dblclick', () => {
          this.unlockSecret(secretId);
        });
      });

      // Hover secrets (reveal after 3 seconds)
      document.querySelectorAll('[data-secret-hover]').forEach(el => {
        const secretId = el.dataset.secretHover;
        let timeout;
        el.addEventListener('mouseenter', () => {
          timeout = setTimeout(() => this.unlockSecret(secretId), 3000);
        });
        el.addEventListener('mouseleave', () => clearTimeout(timeout));
      });
    },

    setupConsoleSecrets() {
      // Message secret dans la console
      console.log('%c◈ PROTOCOLE USBA ◈', 'color: #00ff88; font-size: 20px; font-weight: bold;');
      console.log('%cBienvenue, Agent. Tapez USBA.hint() pour un indice.', 'color: #888;');
      
      // Exposer une fonction secrète
      window.USBA = {
        hint: () => {
          const secrets = Object.entries(CONFIG.secrets).filter(
            ([id]) => !state.secrets.found.includes(id)
          );
          if (secrets.length > 0) {
            const [id, data] = secrets[Math.floor(Math.random() * secrets.length)];
            console.log(`%c[HINT] ${data.hint}`, 'color: #ffaa00;');
            return data.hint;
          }
          return 'Tous les secrets ont été découverts!';
        },
        unlock: (code) => {
          if (CONFIG.secrets[code] && !state.secrets.found.includes(code)) {
            Secrets.unlockSecret(code);
            return true;
          }
          return false;
        },
        status: () => {
          return Agent.getInfo();
        },
        export: () => Storage.export(),
        import: (data) => Storage.import(data)
      };
    },

    unlockSecret(id) {
      if (state.secrets.found.includes(id)) {
        if (CONFIG.debug) console.log('[USBA] Secret already found:', id);
        return false;
      }

      // Konami est un achievement spécial
      if (id === 'konami') {
        if (!state.achievements.includes('konami')) {
          state.achievements.push('konami');
          Fragments.add(100, 'konami_code');
          Fragments.showNotification('Easter Egg déverrouillé : Konami Code!', 'secret');
          Agent.logEvent('ACHIEVEMENT_UNLOCKED', { id: 'konami' });
        }
        return true;
      }

      // Secrets normaux
      const secret = CONFIG.secrets[id];
      if (secret) {
        state.secrets.found.push(id);
        Fragments.add(secret.reward, `secret_${id}`);
        Fragments.showNotification(`Secret découvert : ${id}`, 'secret');
        Agent.logEvent('SECRET_FOUND', { id, reward: secret.reward });
        Storage.save();
        Missions.check();
        return true;
      }

      return false;
    },

    getHint() {
      const unfound = Object.entries(CONFIG.secrets).filter(
        ([id]) => !state.secrets.found.includes(id)
      );
      if (unfound.length > 0) {
        const [id, data] = unfound[Math.floor(Math.random() * unfound.length)];
        if (!state.secrets.hints.includes(id)) {
          state.secrets.hints.push(id);
          Storage.save();
        }
        return { id, hint: data.hint };
      }
      return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // TRACKING & ANALYTICS
  // ═══════════════════════════════════════════════════════════════
  
  const Tracking = {
    init() {
      this.trackPageView();
      this.trackClicks();
      this.trackTime();
    },

    trackPageView() {
      const path = window.location.pathname;
      if (!state.stats.pagesVisited.includes(path)) {
        state.stats.pagesVisited.push(path);
        Fragments.add(CONFIG.economy.rewards.pageView, 'page_view');
      }
      state.stats.totalPageViews++;
      Storage.save();
      Missions.check();
    },

    trackClicks() {
      document.addEventListener('click', () => {
        state.stats.clickCount++;
        // Récompense secrète tous les 100 clics
        if (state.stats.clickCount % 100 === 0) {
          Fragments.add(5, 'click_bonus');
        }
      });
    },

    trackTime() {
      const startTime = Date.now();
      
      const updateTime = () => {
        state.stats.timeSpent += 1;
        
        // Récompense toutes les 5 minutes
        if (state.stats.timeSpent % 300 === 0) {
          Fragments.add(5, 'time_bonus');
        }
      };

      setInterval(updateTime, 1000);

      window.addEventListener('beforeunload', () => {
        Storage.save();
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // UI COMPONENTS
  // ═══════════════════════════════════════════════════════════════
  
  const UI = {
    init() {
      this.injectStyles();
      this.createStatusBar();
      this.bindEvents();
    },

    injectStyles() {
      const styles = `
        .usba-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          background: #12121a;
          border: 1px solid #00ff88;
          color: #eaeaf0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          transform: translateX(120%);
          transition: transform 0.3s ease;
          z-index: 10000;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
        }
        
        .usba-notification--visible {
          transform: translateX(0);
        }
        
        .usba-notification--success {
          border-color: #00ff88;
        }
        
        .usba-notification--error {
          border-color: #ff3366;
        }
        
        .usba-notification--levelup {
          border-color: #ffaa00;
          background: linear-gradient(135deg, #12121a 0%, #2a2a3a 100%);
        }
        
        .usba-notification--secret {
          border-color: #aa88ff;
        }
        
        .usba-notification__icon {
          font-size: 1.2em;
        }
        
        .usba-status-bar-floating {
          position: fixed;
          bottom: 20px;
          left: 20px;
          padding: 8px 16px;
          background: rgba(18, 18, 26, 0.95);
          border: 1px solid #2a2a3a;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #8a8a9a;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 9000;
          backdrop-filter: blur(10px);
        }
        
        .usba-status-bar-floating__fragments {
          color: #00ff88;
          font-weight: 500;
        }
        
        .usba-status-bar-floating__level {
          color: #00ccff;
        }
      `;

      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    },

    createStatusBar() {
      const bar = document.createElement('div');
      bar.className = 'usba-status-bar-floating';
      bar.innerHTML = `
        <span class="usba-status-bar-floating__codename" data-codename></span>
        <span class="usba-status-bar-floating__fragments">◈ <span data-fragments>0</span></span>
        <span class="usba-status-bar-floating__level" data-level></span>
      `;
      document.body.appendChild(bar);
    },

    bindEvents() {
      // Réinitialiser avec Ctrl+Shift+R
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
          if (confirm('Réinitialiser toutes les données du Protocole USBA ?')) {
            Storage.clear();
            location.reload();
          }
        }
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // REAL-TIME SYNC (OPTIONAL)
  // ═══════════════════════════════════════════════════════════════
  
  const Sync = {
    socket: null,

    init(endpoint) {
      if (!endpoint) return;
      
      try {
        this.socket = new WebSocket(endpoint);
        
        this.socket.onopen = () => {
          console.log('[USBA] Connected to sync server');
          this.send('join', { agentId: state.agent.id });
        };

        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.socket.onclose = () => {
          console.log('[USBA] Disconnected from sync server');
          setTimeout(() => this.init(endpoint), 5000);
        };
      } catch (e) {
        console.error('[USBA] Failed to connect:', e);
      }
    },

    send(type, data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type, data }));
      }
    },

    handleMessage(msg) {
      switch (msg.type) {
        case 'broadcast':
          Fragments.showNotification(msg.data.message, 'info');
          break;
        case 'leaderboard':
          this.updateLeaderboard(msg.data);
          break;
        case 'event':
          Agent.logEvent('SERVER_EVENT', msg.data);
          break;
      }
    },

    updateLeaderboard(data) {
      const container = document.querySelector('[data-leaderboard]');
      if (container) {
        container.innerHTML = data.map((entry, i) => `
          <div class="leaderboard-entry ${entry.id === state.agent.id ? 'leaderboard-entry--self' : ''}">
            <span class="leaderboard-entry__rank">#${i + 1}</span>
            <span class="leaderboard-entry__name">${entry.codename}</span>
            <span class="leaderboard-entry__fragments">◈ ${entry.fragments}</span>
          </div>
        `).join('');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  
  function init() {
    console.log(`%c
    ╔═══════════════════════════════════════════════════════╗
    ║                  PROTOCOLE USBA                       ║
    ║              Version ${CONFIG.version}                     ║
    ║              Codename: ${CONFIG.codename}               ║
    ╚═══════════════════════════════════════════════════════╝
    `, 'color: #00ff88;');

    Storage.load();
    Agent.init();
    UI.init();
    Secrets.init();
    Tracking.init();
    Fragments.updateUI();
    Missions.check();
    Missions.updateUI();

    // Daily login bonus
    const today = new Date().toDateString();
    const lastLogin = state.agent.lastSeen ? new Date(state.agent.lastSeen).toDateString() : null;
    if (lastLogin !== today) {
      setTimeout(() => {
        Fragments.add(CONFIG.economy.rewards.dailyLogin, 'daily_login');
      }, 1000);
    }

    // Optional: Connect to sync server
    if (CONFIG.apiEndpoint) {
      Sync.init(CONFIG.apiEndpoint);
    }

    // Expose public API
    window.ProtocoleUSBA = {
      Fragments,
      Missions,
      Secrets,
      Agent,
      Storage,
      Sync,
      CONFIG
    };

    if (CONFIG.debug) {
      console.log('[USBA] Initialized. State:', state);
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
