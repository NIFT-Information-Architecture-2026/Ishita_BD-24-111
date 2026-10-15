/* ==========================================================================
   BARBACK — Tactile Bartender Workstation Engine (Phase 6 Revision)
   Jazz Bar × Graphic Novel × Vintage Cocktail Culture × Art Deco
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // RECIPES & INGREDIENTS DATABASE
  // =========================================================================
  const recipesDb = [
    {
      id: 'cosmopolitan',
      ticketId: 'ORDER #001 // TICKET',
      name: 'COSMOPOLITAN',
      technique: 'Shake & Strain',
      glassware: 'Nick & Nora Glass',
      glassIcon: '🍸',
      ice: 'Cubed in Shaker',
      color: '#FF2A85',
      flavorDesc: 'Vibrant blush, citrus-forward, balanced sweetness with an aromatic orange twist.',
      mentorTip: 'Real-world speed pourers vent smoothly at ~15 ml per count (half-second). Keep your bottle tilted firmly at 45° to avoid air bubbles and ensure laminar flow.',
      ingredients: [
        { id: 'vodka', name: 'Vodka', volume: 30.0, color: '#00F0FF', poured: 0, status: 'pending' },
        { id: 'triple_sec', name: 'Triple Sec', volume: 15.0, color: '#F59E0B', poured: 0, status: 'pending' },
        { id: 'cranberry', name: 'Cranberry Juice', volume: 30.0, color: '#FF2A85', poured: 0, status: 'pending' },
        { id: 'lime_juice', name: 'Fresh Lime Juice', volume: 15.0, color: '#10B981', poured: 0, status: 'pending' }
      ]
    },
    {
      id: 'negroni',
      ticketId: 'ORDER #002 // TICKET',
      name: 'NEGRONI',
      technique: 'Stir over Ice',
      glassware: 'Rocks Glass',
      glassIcon: '🥃',
      ice: 'Single Large Rock',
      color: '#E6B366',
      flavorDesc: 'Bitter, spirit-forward Italian masterpiece with equal 1:1:1 harmony.',
      mentorTip: 'A classic 1:1:1 equal-parts build. Stir smoothly with the bar spoon to achieve optimal chilling without introducing excess dilution or ice chips.',
      ingredients: [
        { id: 'gin', name: 'London Dry Gin', volume: 30.0, color: '#38BDF8', poured: 0, status: 'pending' },
        { id: 'campari', name: 'Campari', volume: 30.0, color: '#EF4444', poured: 0, status: 'pending' },
        { id: 'vermouth', name: 'Sweet Vermouth', volume: 30.0, color: '#D97706', poured: 0, status: 'pending' }
      ]
    }
  ];

  const inventoryDb = {
    spirits: [
      { id: 'vodka', name: 'Vodka', color: '#00F0FF', category: 'spirits', defaultVol: 30.0 },
      { id: 'gin', name: 'London Dry Gin', color: '#38BDF8', category: 'spirits', defaultVol: 30.0 },
      { id: 'triple_sec', name: 'Triple Sec', color: '#F59E0B', category: 'spirits', defaultVol: 15.0 },
      { id: 'campari', name: 'Campari', color: '#EF4444', category: 'spirits', defaultVol: 30.0 },
      { id: 'vermouth', name: 'Sweet Vermouth', color: '#D97706', category: 'spirits', defaultVol: 30.0 },
      { id: 'whiskey', name: 'Bourbon Whiskey', color: '#B45309', category: 'spirits', defaultVol: 45.0 },
      { id: 'rum', name: 'White Rum', color: '#E2E8F0', category: 'spirits', defaultVol: 45.0 }
    ],
    mixers: [
      { id: 'cranberry', name: 'Cranberry Juice', color: '#FF2A85', category: 'mixers', defaultVol: 30.0 },
      { id: 'lime_juice', name: 'Lime Juice', color: '#10B981', category: 'mixers', defaultVol: 15.0 },
      { id: 'simple_syrup', name: 'Simple Syrup', color: '#FDE047', category: 'mixers', defaultVol: 15.0 },
      { id: 'bitters', name: 'Angostura', color: '#78350F', category: 'mixers', defaultVol: 5.0 },
      { id: 'tonic', name: 'Tonic Water', color: '#38BDF8', category: 'mixers', defaultVol: 60.0 }
    ],
    tools: [
      { id: 'jigger', name: 'Jigger 30/45ml', icon: '⏳' },
      { id: 'spoon', name: 'Bar Spoon', icon: '🥄' },
      { id: 'shaker', name: 'Boston Shaker', icon: '🧊' },
      { id: 'strainer', name: 'Hawthorne Strainer', icon: '✨' },
      { id: 'glassware', name: 'Cocktail Glass', icon: '🍸' }
    ]
  };

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    currentScreen: 'lounge',
    mode: 'game', // 'game' | 'practice'
    score: 450,
    streak: 1,
    currentRecipeIndex: 0,
    currentRecipe: null,
    currentStepIndex: 0,
    activeIngredient: null,
    currentPouredMl: 0.0,
    isPouring: false,
    pourTimer: null,
    techniqueDone: false,
    railCategory: 'spirits'
  };

  // =========================================================================
  // DOM REFERENCES
  // =========================================================================
  const dom = {
    screenLounge: document.getElementById('screen-lounge'),
    screenBar: document.getElementById('screen-bar'),
    modalLibrary: document.getElementById('modal-library'),
    modalInfo: document.getElementById('modal-info'),
    bullseyeModal: document.getElementById('bullseye-modal'),
    drinkCompleteModal: document.getElementById('drink-complete-modal'),

    // Station Header
    valScore: document.getElementById('val-score'),
    valStreak: document.getElementById('val-streak'),
    btnExitBar: document.getElementById('btn-exit-bar'),
    btnSwitchRecipe: document.getElementById('btn-switch-recipe'),
    btnResetStation: document.getElementById('btn-reset-station'),

    // Ticket Column
    ticketId: document.getElementById('ticket-id'),
    ticketStatus: document.getElementById('ticket-status'),
    orderRecipeName: document.getElementById('order-recipe-name'),
    orderTechnique: document.getElementById('order-technique'),
    orderGlassware: document.getElementById('order-glassware'),
    orderIce: document.getElementById('order-ice'),
    ticketIngredientsList: document.getElementById('ticket-ingredients-list'),
    ticketStepDesc: document.getElementById('ticket-step-desc'),
    btnTicketAction: document.getElementById('btn-ticket-action'),

    // Workstation Center
    calibrationBanner: document.getElementById('calibration-banner'),
    interactiveBottle: document.getElementById('interactive-bottle'),
    bottleFillLiquid: document.getElementById('bottle-fill-liquid'),
    bottleSpiritName: document.getElementById('bottle-spirit-name'),
    liquidStreamWrap: document.getElementById('liquid-stream-wrap'),
    streamLine: document.getElementById('stream-line'),
    streamSplash: document.getElementById('stream-splash'),
    jiggerFluidFill: document.getElementById('jigger-fluid-fill'),
    markTargetLine: document.getElementById('mark-target-line'),
    markTargetLabel: document.getElementById('mark-target-label'),
    servedGlassView: document.getElementById('served-glass-view'),
    servedCocktailGraphic: document.getElementById('served-cocktail-graphic'),
    servedGlassTitle: document.getElementById('served-glass-title'),
    livePourToast: document.getElementById('live-pour-toast'),

    // Telemetry Column
    valTargetMl: document.getElementById('val-target-ml'),
    valPouredMl: document.getElementById('val-poured-ml'),
    valToleranceDelta: document.getElementById('val-tolerance-delta'),
    btnHugePour: document.getElementById('btn-huge-pour'),
    pourMainText: document.getElementById('pour-main-text'),
    btnActStir: document.getElementById('btn-act-stir'),
    btnActShake: document.getElementById('btn-act-shake'),
    proTipsContent: document.getElementById('pro-tips-content'),

    // Rails
    speedRailContainer: document.getElementById('speed-rail-container'),
    toolsTrayContainer: document.getElementById('tools-tray-container'),

    // Bullseye Modal Elements
    bullseyeTitleBadge: document.getElementById('bullseye-title-badge'),
    bmTargetVal: document.getElementById('bm-target-val'),
    bmPouredVal: document.getElementById('bm-poured-val'),
    bmDeltaVal: document.getElementById('bm-delta-val'),
    bmRatingVal: document.getElementById('bm-rating-val'),
    bmSpecNote: document.getElementById('bm-spec-note'),
    bmMentorQuote: document.getElementById('bm-mentor-quote'),
    btnNextIngredient: document.getElementById('btn-next-ingredient'),
    btnInspectServe: document.getElementById('btn-inspect-serve'),

    // Complete Modal Elements
    completeTitleBadge: document.getElementById('complete-title-badge'),
    completeDrinkIcon: document.getElementById('complete-drink-icon'),
    completeDrinkName: document.getElementById('complete-drink-name'),
    completeDrinkSub: document.getElementById('complete-drink-sub'),
    completeAccuracyVal: document.getElementById('complete-accuracy-val'),
    completeTechniqueVal: document.getElementById('complete-technique-val'),
    completeBonusVal: document.getElementById('complete-bonus-val'),
    completeScoreVal: document.getElementById('complete-score-val'),
    completeMentorNote: document.getElementById('complete-mentor-note'),
    btnCompleteNextTicket: document.getElementById('btn-complete-next-ticket'),
    btnCompleteLounge: document.getElementById('btn-complete-lounge'),

    // Info Modal
    infoTitle: document.getElementById('info-modal-title'),
    infoSubtitle: document.getElementById('info-modal-subtitle'),
    infoDesc: document.getElementById('info-modal-desc')
  };

  // =========================================================================
  // NAVIGATION ROUTER
  // =========================================================================
  function switchScreen(screenName) {
    state.currentScreen = screenName;
    if (screenName === 'lounge') {
      dom.screenLounge.classList.add('active');
      dom.screenBar.classList.remove('active');
    } else if (screenName === 'bar') {
      dom.screenLounge.classList.remove('active');
      dom.screenBar.classList.add('active');
      initStationSession();
    }
  }

  function openModal(modalEl) {
    if (modalEl) modalEl.classList.add('active');
  }

  function closeModal(modalEl) {
    if (modalEl) modalEl.classList.remove('active');
  }

  function showInfoModal(title, subtitle, desc) {
    dom.infoTitle.textContent = title;
    dom.infoSubtitle.textContent = subtitle;
    dom.infoDesc.textContent = desc;
    openModal(dom.modalInfo);
  }

  // =========================================================================
  // JAZZ LOUNGE HOTSPOTS
  // =========================================================================
  document.getElementById('hotspot-the-bar').addEventListener('click', () => {
    state.mode = 'game';
    switchScreen('bar');
  });

  document.getElementById('hotspot-practice').addEventListener('click', () => {
    state.mode = 'practice';
    switchScreen('bar');
  });

  document.getElementById('hotspot-multiplayer').addEventListener('click', () => {
    showInfoModal(
      'MULTIPLAYER LOUNGE',
      'COMPETITIVE SPEED-POUR CHALLENGES',
      'Compete head-to-head with other bartenders on timing, precision, and recipe retention. Available in next update.'
    );
  });

  document.getElementById('hotspot-library').addEventListener('click', () => {
    openModal(dom.modalLibrary);
  });

  document.getElementById('btn-cellar').addEventListener('click', () => {
    showInfoModal('THE CELLAR', 'CAREER RECORDS & UNLOCKS', 'Track your career masteries, completed tickets, and precision telemetry.');
  });

  document.getElementById('btn-settings').addEventListener('click', () => {
    showInfoModal('SETTINGS', 'LOUNGE AUDIO & VISUALS', 'Configure ambient jazz music, bottle sound effects, and display calibration.');
  });

  document.getElementById('btn-school').addEventListener('click', () => {
    showInfoModal('BARTENDING SCHOOL', 'CRAFT SCIENCE & TECHNIQUE', 'Learn laminar pour physics, jigger meniscus reading, and dilution dynamics.');
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    showInfoModal('HELP & CONTROLS', 'HOW TO PLAY', 'Select a spirit from the Speed Rail, press and hold the POUR button to tilt the bottle, and release precisely at the graduation line!');
  });

  document.getElementById('btn-close-library').addEventListener('click', () => closeModal(dom.modalLibrary));
  document.getElementById('btn-close-info').addEventListener('click', () => closeModal(dom.modalInfo));
  
  document.getElementById('btn-try-practice').addEventListener('click', () => {
    closeModal(dom.modalLibrary);
    state.mode = 'practice';
    state.currentRecipeIndex = 1; // Negroni
    switchScreen('bar');
  });

  dom.btnExitBar.addEventListener('click', () => switchScreen('lounge'));

  // =========================================================================
  // WORKSTATION & RECIPE ENGINE
  // =========================================================================
  function initStationSession() {
    loadRecipe(state.currentRecipeIndex);
    renderSpeedRail();
    renderToolsTray();
    updateStationTelemetry();
  }

  function loadRecipe(index) {
    state.currentRecipeIndex = index % recipesDb.length;
    // Deep clone recipe so status resets
    const template = recipesDb[state.currentRecipeIndex];
    state.currentRecipe = {
      ...template,
      ingredients: template.ingredients.map(ing => ({ ...ing, poured: 0, status: 'pending' }))
    };

    state.currentStepIndex = 0;
    state.techniqueDone = false;
    state.currentPouredMl = 0.0;
    dom.servedGlassView.style.display = 'none';
    dom.interactiveBottle.style.display = 'flex';

    // Populate Ticket UI
    dom.ticketId.textContent = state.currentRecipe.ticketId;
    dom.ticketStatus.textContent = state.mode === 'practice' ? 'PRACTICE SANDBOX' : 'READY FOR SERVICE';
    dom.orderRecipeName.textContent = state.currentRecipe.name;
    dom.orderTechnique.textContent = state.currentRecipe.technique;
    dom.orderGlassware.textContent = state.currentRecipe.glassware;
    dom.orderIce.textContent = state.currentRecipe.ice;
    dom.proTipsContent.textContent = state.currentRecipe.mentorTip;

    stageActiveIngredient(0);
    renderTicketIngredients();
  }

  function stageActiveIngredient(stepIndex) {
    state.currentStepIndex = stepIndex;
    const ingredients = state.currentRecipe.ingredients;

    if (stepIndex < ingredients.length) {
      state.activeIngredient = ingredients[stepIndex];
      state.currentPouredMl = 0.0;

      // Update Bottle Visuals
      dom.bottleSpiritName.textContent = state.activeIngredient.name.toUpperCase();
      dom.bottleFillLiquid.style.backgroundColor = state.activeIngredient.color;
      dom.streamLine.style.background = `linear-gradient(180deg, #FFF, ${state.activeIngredient.color})`;
      dom.streamSplash.style.backgroundColor = state.activeIngredient.color;

      // Update Jigger Visuals
      dom.jiggerFluidFill.style.height = '0%';
      dom.jiggerFluidFill.style.backgroundColor = state.activeIngredient.color;

      // Target calibration
      const targetVol = state.activeIngredient.volume;
      dom.valTargetMl.textContent = targetVol.toFixed(1);
      dom.valPouredMl.textContent = '0.0';
      dom.valPouredMl.className = 'card-number poured-num';
      dom.valToleranceDelta.textContent = '+/- 0.0 ML';
      dom.markTargetLabel.textContent = `${targetVol.toFixed(0)} ML TARGET`;

      // Set target line position dynamically (e.g. 15ml = 25px, 30ml = 52px, 45ml = 70px)
      const targetPosPx = Math.round((targetVol / 45) * 65);
      dom.markTargetLine.style.bottom = `${targetPosPx}px`;

      // Update prompt
      dom.ticketStepDesc.textContent = `Measure ${targetVol.toFixed(1)} ml ${state.activeIngredient.name} with Jigger.`;
      dom.calibrationBanner.className = 'calibration-banner';
      dom.calibrationBanner.textContent = `CALIBRATION VISIBLE // PRESS & HOLD "HOLD TO POUR" TO DISPENSE ${state.activeIngredient.name.toUpperCase()}`;

      dom.btnTicketAction.textContent = 'POUR ACTIVE';
      setStationStepPill(2); // Jigger Run
    } else {
      // All ingredients poured! Ready for technique / serve
      state.activeIngredient = null;
      dom.valTargetMl.textContent = '--';
      dom.valPouredMl.textContent = '--';
      dom.valToleranceDelta.textContent = 'READY TO PREPARE';
      dom.ticketStepDesc.textContent = `All ingredients measured! Execute ${state.currentRecipe.technique} using bar tools.`;
      dom.calibrationBanner.textContent = `PREPARATION PHASE // CLICK "${state.currentRecipe.technique.toUpperCase()}" TO COMBINE & CHILL`;
      dom.btnTicketAction.textContent = 'SERVE COCKTAIL';
      setStationStepPill(4); // Serve
    }

    renderTicketIngredients();
    renderSpeedRail();
  }

  function renderTicketIngredients() {
    dom.ticketIngredientsList.innerHTML = '';
    state.currentRecipe.ingredients.forEach((ing, idx) => {
      const row = document.createElement('div');
      row.className = 'ticket-ing-item';
      if (idx === state.currentStepIndex) row.classList.add('active');
      if (ing.status === 'completed') row.classList.add('completed');

      const check = ing.status === 'completed' ? '✓ ' : '';
      row.innerHTML = `
        <span class="ing-name">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${ing.color}"></span>
          ${check}${ing.name}
        </span>
        <span class="ing-vol">${ing.volume.toFixed(0)} ml</span>
      `;
      dom.ticketIngredientsList.appendChild(row);
    });
  }

  function setStationStepPill(stepNum) {
    document.querySelectorAll('.step-pill').forEach((pill, idx) => {
      if (idx + 1 === stepNum) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Switch Recipe Button
  dom.btnSwitchRecipe.addEventListener('click', () => {
    loadRecipe(state.currentRecipeIndex + 1);
  });

  // Reset Station Button
  dom.btnResetStation.addEventListener('click', () => {
    loadRecipe(state.currentRecipeIndex);
  });

  // Ticket Action Button
  dom.btnTicketAction.addEventListener('click', () => {
    if (state.currentStepIndex >= state.currentRecipe.ingredients.length) {
      triggerDrinkComplete();
    }
  });

  // =========================================================================
  // SPEED RAIL & TOOLS TRAY RENDERING
  // =========================================================================
  function renderSpeedRail() {
    const list = inventoryDb[state.railCategory] || inventoryDb.spirits;
    dom.speedRailContainer.innerHTML = '';

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'speed-bottle-card';
      if (state.activeIngredient && state.activeIngredient.id === item.id) {
        card.classList.add('active');
      }

      card.innerHTML = `
        <div class="card-liquid-pill" style="background:${item.color}; box-shadow: 0 0 8px ${item.color}"></div>
        <div class="card-bottle-name">${item.name}</div>
        <div class="card-target-tag">${item.defaultVol}ml</div>
      `;

      card.addEventListener('click', () => {
        // If clicking an ingredient that's part of the recipe, jump to it or stage it
        const matchIndex = state.currentRecipe.ingredients.findIndex(ing => ing.id === item.id);
        if (matchIndex !== -1) {
          stageActiveIngredient(matchIndex);
        } else {
          // Free sandbox pour for practice
          state.activeIngredient = {
            id: item.id,
            name: item.name,
            volume: item.defaultVol,
            color: item.color,
            poured: 0,
            status: 'pending'
          };
          stageActiveIngredient(state.currentStepIndex);
        }
      });

      dom.speedRailContainer.appendChild(card);
    });
  }

  // Speed Rail Subtabs
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.railCategory = e.target.dataset.railCategory;
      renderSpeedRail();
    });
  });

  function renderToolsTray() {
    dom.toolsTrayContainer.innerHTML = '';
    inventoryDb.tools.forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tray-tool-card';
      card.innerHTML = `
        <div class="tray-tool-icon">${tool.icon}</div>
        <div class="tray-tool-name">${tool.name}</div>
      `;

      card.addEventListener('click', () => {
        if (tool.id === 'spoon') {
          executeTechnique('stir');
        } else if (tool.id === 'shaker') {
          executeTechnique('shake');
        } else if (tool.id === 'glassware') {
          if (state.currentStepIndex >= state.currentRecipe.ingredients.length) {
            triggerDrinkComplete();
          }
        }
      });

      dom.toolsTrayContainer.appendChild(card);
    });
  }

  // Technique Buttons
  dom.btnActStir.addEventListener('click', () => executeTechnique('stir'));
  dom.btnActShake.addEventListener('click', () => executeTechnique('shake'));

  function executeTechnique(type) {
    state.techniqueDone = true;
    const banner = dom.calibrationBanner;
    if (type === 'stir') {
      banner.textContent = 'STIRRING COCKTAIL... CHILLING AND INTEGRATING SPIRITS (3s)';
      dom.btnActStir.textContent = 'STIRRING...';
      dom.btnActStir.disabled = true;
      setTimeout(() => {
        banner.textContent = 'STIR COMPLETE ✓ // READY TO STRAIN AND SERVE';
        dom.btnActStir.textContent = 'STIR COMPLETE ✓';
        dom.btnActStir.disabled = false;
      }, 2000);
    } else {
      banner.textContent = 'SHAKING COCKTAIL... AERATING AND DILUTING WITH ICE (3s)';
      dom.btnActShake.textContent = 'SHAKING...';
      dom.btnActShake.disabled = true;
      setTimeout(() => {
        banner.textContent = 'SHAKE COMPLETE ✓ // READY TO STRAIN INTO CHILLED GLASS';
        dom.btnActShake.textContent = 'SHAKE COMPLETE ✓';
        dom.btnActShake.disabled = false;
      }, 2000);
    }
  }

  // =========================================================================
  // POURING PHYSICS & ANIMATION ENGINE
  // =========================================================================
  function startPouring() {
    if (state.isPouring || !state.activeIngredient) return;
    state.isPouring = true;

    // Visual activations
    dom.interactiveBottle.classList.add('pouring');
    dom.liquidStreamWrap.classList.add('active');
    dom.btnHugePour.classList.add('active');
    dom.pourMainText.textContent = 'DISPENSING... RELEASE TO STOP';
    dom.livePourToast.style.display = 'block';

    const targetVol = state.activeIngredient.volume;
    const flowRateMlPerTick = 0.35; // ~14 ml per second (25ms interval)

    state.pourTimer = setInterval(() => {
      state.currentPouredMl += flowRateMlPerTick;
      const poured = state.currentPouredMl;
      dom.valPouredMl.textContent = poured.toFixed(1);

      // Liquid fill percentage in jigger cone
      const fillPct = Math.min(100, (poured / 45.0) * 100);
      dom.jiggerFluidFill.style.height = `${fillPct}%`;

      // Tolerance Delta
      const delta = poured - targetVol;
      const sign = delta > 0 ? '+' : '';
      dom.valToleranceDelta.textContent = `${sign}${delta.toFixed(1)} ML`;

      // Live Calibration feedback
      if (Math.abs(delta) <= 2.0) {
        dom.valPouredMl.className = 'card-number poured-num matched';
        dom.calibrationBanner.className = 'calibration-banner';
        dom.calibrationBanner.textContent = `NEAR ${targetVol.toFixed(0)} ML! RELEASE PRECISELY AT THE GRADUATION LINE!`;
        dom.livePourToast.textContent = 'NEAR TARGET // RELEASE NOW!';
      } else if (poured > targetVol + 2.0) {
        dom.valPouredMl.className = 'card-number poured-num over';
        dom.calibrationBanner.className = 'calibration-banner warning';
        dom.calibrationBanner.textContent = `OVER TARGET! RELEASE THE BUTTON NOW!`;
        dom.livePourToast.textContent = 'OVERFLOW WARNING!';
      } else {
        dom.valPouredMl.className = 'card-number poured-num';
        dom.calibrationBanner.className = 'calibration-banner';
        dom.calibrationBanner.textContent = `CALIBRATION VISIBLE // DISPENSING ${state.activeIngredient.name.toUpperCase()}...`;
        dom.livePourToast.textContent = `DISPENSING... ${poured.toFixed(1)} ML`;
      }
    }, 25);
  }

  function stopPouring() {
    if (!state.isPouring) return;
    state.isPouring = false;
    clearInterval(state.pourTimer);
    state.pourTimer = null;

    // Reset Visuals
    dom.interactiveBottle.classList.remove('pouring');
    dom.liquidStreamWrap.classList.remove('active');
    dom.btnHugePour.classList.remove('active');
    dom.pourMainText.textContent = 'PRESS & HOLD TO POUR';
    dom.livePourToast.style.display = 'none';

    // Record measurement in ingredient
    if (state.activeIngredient) {
      state.activeIngredient.poured = state.currentPouredMl;
      state.activeIngredient.status = 'completed';
      renderTicketIngredients();

      // Trigger Evaluation Modal
      showBullseyeEvaluation();
    }
  }

  // Mouse & Touch Listeners for the Big Pour Button
  dom.btnHugePour.addEventListener('mousedown', startPouring);
  window.addEventListener('mouseup', stopPouring);
  dom.btnHugePour.addEventListener('touchstart', (e) => { e.preventDefault(); startPouring(); });
  window.addEventListener('touchend', stopPouring);

  // =========================================================================
  // BULLSEYE PRECISION EVALUATION MODAL (10s-12s Screenshot)
  // =========================================================================
  function showBullseyeEvaluation() {
    setStationStepPill(3); // Evaluation
    const target = state.activeIngredient.volume;
    const poured = state.activeIngredient.poured;
    const delta = poured - target;
    const absDelta = Math.abs(delta);
    const precisionPct = Math.max(0, 100 - Math.round((absDelta / target) * 100));

    // Populate Modal values
    dom.bmTargetVal.textContent = `${target.toFixed(1)} ML`;
    dom.bmPouredVal.textContent = `${poured.toFixed(1)} ML`;
    dom.bmDeltaVal.textContent = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} ML`;
    dom.bmRatingVal.textContent = `${precisionPct}%`;

    // Title & Stars Rating
    if (precisionPct >= 95) {
      dom.bullseyeTitleBadge.textContent = 'BULLSEYE ★★★';
      dom.bullseyeTitleBadge.style.color = 'var(--color-accent-cyan)';
      dom.bmSpecNote.textContent = '"Exact specification! The cocktail spirit balance is pristine."';
      state.score += 150;
      state.streak += 1;
    } else if (precisionPct >= 80) {
      dom.bullseyeTitleBadge.textContent = 'GREAT POUR ★★☆';
      dom.bullseyeTitleBadge.style.color = 'var(--color-action-gold)';
      dom.bmSpecNote.textContent = '"Solid execution. Within acceptable craft bartending tolerance."';
      state.score += 100;
    } else {
      const label = delta > 0 ? 'OVER-POURED ★☆☆' : 'UNDER-POURED ★☆☆';
      dom.bullseyeTitleBadge.textContent = label;
      dom.bullseyeTitleBadge.style.color = 'var(--color-accent-magenta)';
      dom.bmSpecNote.textContent = '"Watch your meniscus. Small measurement errors alter the spirit balance."';
      state.streak = 0;
    }

    dom.bmMentorQuote.innerHTML = `
      <strong>BARTENDER NOTE // CRAFT BARTENDING:</strong><br>
      ${state.currentRecipe.mentorTip}
    `;

    updateStationTelemetry();
    dom.bullseyeModal.style.display = 'flex';
  }

  // Next Ingredient Button inside Bullseye Modal
  dom.btnNextIngredient.addEventListener('click', () => {
    dom.bullseyeModal.style.display = 'none';
    stageActiveIngredient(state.currentStepIndex + 1);
  });

  // Done / Inspect Button
  dom.btnInspectServe.addEventListener('click', () => {
    dom.bullseyeModal.style.display = 'none';
    if (state.currentStepIndex + 1 < state.currentRecipe.ingredients.length) {
      stageActiveIngredient(state.currentStepIndex + 1);
    } else {
      triggerDrinkComplete();
    }
  });

  // =========================================================================
  // DRINK COMPLETE SERVE CEREMONY
  // =========================================================================
  function triggerDrinkComplete() {
    // Reveal served glass visual on workstation
    dom.interactiveBottle.style.display = 'none';
    dom.servedGlassView.style.display = 'flex';
    dom.servedCocktailGraphic.textContent = state.currentRecipe.glassIcon;
    dom.servedGlassTitle.textContent = state.currentRecipe.glassware;

    // Calculate overall drink accuracy
    let totalPct = 0;
    state.currentRecipe.ingredients.forEach(ing => {
      const delta = Math.abs(ing.poured - ing.volume);
      totalPct += Math.max(0, 100 - Math.round((delta / ing.volume) * 100));
    });
    const avgAccuracy = Math.round(totalPct / state.currentRecipe.ingredients.length);

    // Populate Celebration Modal
    dom.completeTitleBadge.textContent = avgAccuracy >= 90 ? 'PERFECT SERVE! ★★★★★' : 'SERVICE COMPLETE! ★★★★☆';
    dom.completeDrinkIcon.textContent = state.currentRecipe.glassIcon;
    dom.completeDrinkName.textContent = state.currentRecipe.name;
    dom.completeDrinkSub.textContent = state.currentRecipe.flavorDesc;
    dom.completeAccuracyVal.textContent = `${avgAccuracy}%`;
    dom.completeTechniqueVal.textContent = `${state.currentRecipe.technique} ✓`;
    dom.completeBonusVal.textContent = '+200 PTS';

    state.score += 200;
    dom.completeScoreVal.textContent = `${state.score} PTS`;
    updateStationTelemetry();

    dom.completeMentorNote.textContent = `"Outstanding rhythm behind the bar. The ratios are textbook and Julian loved the serve."`;

    setTimeout(() => {
      dom.drinkCompleteModal.style.display = 'flex';
    }, 400);
  }

  // Next Ticket Button
  dom.btnCompleteNextTicket.addEventListener('click', () => {
    dom.drinkCompleteModal.style.display = 'none';
    loadRecipe(state.currentRecipeIndex + 1);
  });

  // Exit To Lounge Button
  dom.btnCompleteLounge.addEventListener('click', () => {
    dom.drinkCompleteModal.style.display = 'none';
    switchScreen('lounge');
  });

  function updateStationTelemetry() {
    dom.valScore.textContent = state.score;
    dom.valStreak.textContent = state.streak;
  }

});
