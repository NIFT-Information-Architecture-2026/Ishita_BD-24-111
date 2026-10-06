/* ==========================================================================
   BARBACK — Application Engine & Interaction Controller (Phase 6)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    currentScreen: 'lounge',
    mode: 'game', // 'game' | 'practice'
    score: 0,
    streak: 0,
    currentOrder: {
      id: 'negroni',
      name: 'NEGRONI',
      spec: 'STIRRED · ROCKS',
      requiredSpirits: ['Gin', 'Campari', 'Sweet Vermouth'],
      targetVolumePerSpirit: 30, // 30ml each = 90ml total
      glass: 'Rocks Glass',
      technique: 'Stirred'
    },
    currentDrink: {
      glass: 'Rocks Glass',
      addedIngredients: {},
      isStirred: false,
      isGarnished: true
    },
    selectedSpirit: 'Gin',
    currentPourVolume: 0,
    patience: 100,
    patienceTimer: null,
    isPouring: false,
    pourInterval: null
  };

  // Ingredient Database
  const ingredientsDb = {
    spirits: [
      { id: 'gin', name: 'Gin', icon: '🍾', category: 'spirits' },
      { id: 'campari', name: 'Campari', icon: '🍷', category: 'spirits' },
      { id: 'vermouth', name: 'Sweet Vermouth', icon: '🍸', category: 'spirits' },
      { id: 'whiskey', name: 'Bourbon Whiskey', icon: '🥃', category: 'spirits' },
      { id: 'rum', name: 'White Rum', icon: '🍹', category: 'spirits' }
    ],
    mixers: [
      { id: 'bitters', name: 'Angostura Bitters', icon: '💧', category: 'mixers' },
      { id: 'tonic', name: 'Tonic Water', icon: '🥤', category: 'mixers' },
      { id: 'soda', name: 'Club Soda', icon: '🫧', category: 'mixers' }
    ],
    ice: [
      { id: 'large_cube', name: 'Single Large Cube', icon: '🧊', category: 'ice' },
      { id: 'crushed_ice', name: 'Crushed Ice', icon: '❄️', category: 'ice' }
    ]
  };

  // =========================================================================
  // DOM ELEMENTS
  // =========================================================================
  const screens = {
    lounge: document.getElementById('screen-lounge'),
    bar: document.getElementById('screen-bar')
  };

  const modals = {
    library: document.getElementById('modal-library'),
    info: document.getElementById('modal-info')
  };

  const el = {
    valScore: document.getElementById('val-score'),
    valStreak: document.getElementById('val-streak'),
    valPourVolume: document.getElementById('val-pour-volume'),
    patienceBar: document.getElementById('patience-bar'),
    mentorText: document.getElementById('mentor-text'),
    backbarGrid: document.getElementById('backbar-grid'),
    btnPourHold: document.getElementById('btn-pour-hold'),
    btnStirExecute: document.getElementById('btn-stir-execute'),
    btnServeDrink: document.getElementById('btn-serve-drink'),
    currentGlassName: document.getElementById('current-glass-name'),
    infoTitle: document.getElementById('info-modal-title'),
    infoSubtitle: document.getElementById('info-modal-subtitle'),
    infoDesc: document.getElementById('info-modal-desc')
  };

  // =========================================================================
  // NAVIGATION CONTROLLER
  // =========================================================================
  function switchScreen(screenName) {
    state.currentScreen = screenName;
    Object.keys(screens).forEach(key => {
      if (key === screenName) {
        screens[key].classList.add('active');
      } else {
        screens[key].classList.remove('active');
      }
    });

    if (screenName === 'bar') {
      startBarSession();
    } else {
      stopPatienceTimer();
    }
  }

  function openModal(modalName) {
    if (modals[modalName]) {
      modals[modalName].classList.add('active');
    }
  }

  function closeModal(modalName) {
    if (modals[modalName]) {
      modals[modalName].classList.remove('active');
    }
  }

  function showInfoModal(title, subtitle, desc) {
    el.infoTitle.textContent = title;
    el.infoSubtitle.textContent = subtitle;
    el.infoDesc.textContent = desc;
    openModal('info');
  }

  // =========================================================================
  // LOUNGE HOTSPOT EVENT LISTENERS
  // =========================================================================
  document.getElementById('hotspot-the-bar').addEventListener('click', () => {
    state.mode = 'game';
    switchScreen('bar');
  });

  document.getElementById('hotspot-practice').addEventListener('click', () => {
    state.mode = 'practice';
    switchScreen('bar');
    updateMentorDialog("PRACTICE MODE ACTIVE: Experiment freely with recipes. Timers and scores are disabled.");
  });

  document.getElementById('hotspot-multiplayer').addEventListener('click', () => {
    showInfoModal(
      'MULTIPLAYER LOUNGE',
      'COMPETITIVE BARTENDING SHIFTS',
      'Challenge friends in real-time speed pour & accuracy head-to-head shifts. (Coming in Next Release)'
    );
  });

  document.getElementById('hotspot-library').addEventListener('click', () => {
    openModal('library');
  });

  document.getElementById('btn-cellar').addEventListener('click', () => {
    showInfoModal(
      'THE CELLAR',
      'USER PROFILE & RECORDS',
      'View your unlocked cocktail recipes, technique retention badges, and career high score telemetry.'
    );
  });

  document.getElementById('btn-school').addEventListener('click', () => {
    showInfoModal(
      'BARTENDING SCHOOL',
      'CRAFT TUTORIALS & SCIENCE',
      'Learn dilution ratios, ice surface area mechanics, and strain tool selection through guided modules.'
    );
  });

  document.getElementById('btn-settings').addEventListener('click', () => {
    showInfoModal('SETTINGS', 'AUDIO & INTERFACE', 'Adjust ambient jazz lounge music, sound effects, and visual lighting.');
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    showInfoModal('HELP & CONTROLS', 'BEHIND THE BAR', 'Select spirits from the back bar, hold to pour in jigger, stir, and serve to customer!');
  });

  // Modal Closers
  document.getElementById('btn-close-library').addEventListener('click', () => closeModal('library'));
  document.getElementById('btn-close-info').addEventListener('click', () => closeModal('info'));
  
  document.getElementById('btn-try-practice').addEventListener('click', () => {
    closeModal('library');
    state.mode = 'practice';
    switchScreen('bar');
  });

  document.getElementById('btn-exit-bar').addEventListener('click', () => switchScreen('lounge'));
  document.getElementById('btn-pause').addEventListener('click', () => {
    showInfoModal('PAUSED', 'BAR SHIFT PAUSED', 'Take a breath. Tap CLOSE to resume your cocktail shift.');
  });

  // =========================================================================
  // GAMEPLAY ENGINE & SIMULATION
  // =========================================================================
  function startBarSession() {
    state.currentDrink = {
      glass: 'Rocks Glass',
      addedIngredients: {},
      isStirred: false,
      isGarnished: true
    };
    state.currentPourVolume = 0;
    state.patience = 100;
    updateTelemetry();
    renderBackbar('spirits');
    startPatienceTimer();

    updateMentorDialog("Select a spirit from the back bar, then hold the pour button to measure 30ml into the jigger.");
  }

  function startPatienceTimer() {
    stopPatienceTimer();
    if (state.mode === 'practice') {
      el.patienceBar.style.width = '100%';
      return;
    }

    state.patienceTimer = setInterval(() => {
      state.patience -= 1.5;
      if (state.patience < 0) state.patience = 0;
      el.patienceBar.style.width = `${state.patience}%`;

      if (state.patience < 30) {
        el.patienceBar.style.backgroundColor = 'var(--color-accent-magenta)';
        document.getElementById('customer-mood').textContent = "Mood: Impatient!";
        document.getElementById('customer-mood').style.color = 'var(--color-accent-magenta)';
      } else {
        el.patienceBar.style.backgroundColor = 'var(--color-accent-emerald)';
        document.getElementById('customer-mood').textContent = "Mood: Eager & Patient";
        document.getElementById('customer-mood').style.color = 'var(--color-accent-emerald)';
      }
    }, 1000);
  }

  function stopPatienceTimer() {
    if (state.patienceTimer) {
      clearInterval(state.patienceTimer);
      state.patienceTimer = null;
    }
  }

  function renderBackbar(category) {
    const items = ingredientsDb[category] || [];
    el.backbarGrid.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ingredient-item-card';
      if (state.selectedSpirit === item.name) {
        card.style.borderColor = 'var(--color-action-gold)';
        card.style.background = 'rgba(230, 179, 102, 0.15)';
      }

      card.innerHTML = `
        <div class="ingredient-icon">${item.icon}</div>
        <div class="ingredient-name">${item.name}</div>
      `;

      card.addEventListener('click', () => {
        state.selectedSpirit = item.name;
        renderBackbar(category);
        updateMentorDialog(`Selected <span>${item.name}</span>. Hold the pour button to measure volume.`);
      });

      el.backbarGrid.appendChild(card);
    });
  }

  // Tab switching for backbar
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.dataset.category;
      renderBackbar(category);
    });
  });

  // Jigger Pour Mechanics (Hold to Pour)
  function startPouring() {
    if (state.isPouring) return;
    state.isPouring = true;
    
    state.pourInterval = setInterval(() => {
      state.currentPourVolume += 5;
      el.valPourVolume.textContent = state.currentPourVolume;
      
      // Store in current drink
      const spirit = state.selectedSpirit || 'Gin';
      state.currentDrink.addedIngredients[spirit] = state.currentPourVolume;

      if (state.currentPourVolume > 35) {
        updateMentorDialog("Easy. Watch your measure — you're getting a little heavy on that pour.");
      }
    }, 200);
  }

  function stopPouring() {
    if (!state.isPouring) return;
    state.isPouring = false;
    clearInterval(state.pourInterval);
    state.pourInterval = null;

    updateMentorDialog(`Poured <span>${state.currentPourVolume}ml of ${state.selectedSpirit}</span>. Select another spirit or stir.`);
    state.currentPourVolume = 0;
  }

  el.btnPourHold.addEventListener('mousedown', startPouring);
  el.btnPourHold.addEventListener('mouseup', stopPouring);
  el.btnPourHold.addEventListener('mouseleave', stopPouring);
  
  // Touch support for mobile/tablets
  el.btnPourHold.addEventListener('touchstart', (e) => { e.preventDefault(); startPouring(); });
  el.btnPourHold.addEventListener('touchend', (e) => { e.preventDefault(); stopPouring(); });

  // Stirring execution
  el.btnStirExecute.addEventListener('click', () => {
    state.currentDrink.isStirred = true;
    el.btnStirExecute.textContent = "STIRRING...";
    el.btnStirExecute.disabled = true;

    updateMentorDialog("Giving it a proper stir... Chilling without introducing excess dilution.");

    setTimeout(() => {
      el.btnStirExecute.textContent = "STIR COMPLETE ✓";
      el.btnStirExecute.disabled = false;
      updateMentorDialog("Stir complete. Ready to serve!");
    }, 1500);
  });

  // Serve Cocktail Presentation Ceremony
  el.btnServeDrink.addEventListener('click', () => {
    evaluateCocktail();
  });

  function evaluateCocktail() {
    const drink = state.currentDrink;
    const req = state.currentOrder.requiredSpirits;
    
    let isCorrectRecipe = true;
    let volumeAccuracy = true;

    req.forEach(spirit => {
      const poured = drink.addedIngredients[spirit] || 0;
      if (poured < 20 || poured > 45) {
        isCorrectRecipe = false;
      }
      if (Math.abs(poured - 30) > 10) {
        volumeAccuracy = false;
      }
    });

    if (!drink.isStirred) {
      isCorrectRecipe = false;
    }

    if (isCorrectRecipe) {
      state.score += 500;
      state.streak += 1;
      updateTelemetry();

      updateMentorDialog("<span>Good work! That's a clean serve.</span> Perfect 1:1:1 balance and technique.");
      
      setTimeout(() => {
        alert("🌟 PERFECT NEGRONI SERVED!\n\nPresentation: 5 Stars\nAccuracy: 100%\nTechnique: Stirred Perfectly over Ice\n\n+500 Points Added to Telemetry!");
        startBarSession();
      }, 300);

    } else {
      state.streak = 0;
      updateTelemetry();

      updateMentorDialog("Close! Remember: A classic Negroni needs equal parts Gin, Campari, and Sweet Vermouth, stirred properly.");
      alert("⚠️ SERVE COMPLETE WITH FEEDBACK\n\nMentor Note: Check your ingredient ratios and ensure you stir the drink before serving.\n\nKeep practicing!");
    }
  }

  function updateTelemetry() {
    el.valScore.textContent = state.score;
    el.valStreak.textContent = state.streak;
  }

  function updateMentorDialog(htmlText) {
    el.mentorText.innerHTML = `<span>Bartender Mentor:</span> "${htmlText}"`;
  }

});
