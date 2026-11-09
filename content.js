/**
 * Browser Pet Companion Content Script
 * Handles pet spawning, walking, dragging, clicking, and behavior modes.
 */

(function () {
  // Prevent duplicate injection
  if (document.getElementById('extension-browser-pet-container')) {
    return;
  }

  // Pet configuration and state
  const state = {
    enabled: true,
    petType: 'cat', // 'cat', 'dog', 'dino'
    behavior: 'wander', // 'wander', 'follow', 'sleep'
    speed: 30,
    happiness: 100,
    currentX: 50,
    currentY: window.innerHeight - 80,
    targetX: 50,
    targetY: window.innerHeight - 80,
    direction: 1, // 1 = right, -1 = left
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initialPetX: 0,
    initialPetY: 0,
    hasMovedDuringDrag: false,
    walkIntervalId: null,
    mousePos: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  };

  // Create pet container element
  const container = document.createElement('div');
  container.id = 'extension-browser-pet-container';
  container.className = 'pet-walking';

  // Create pet image
  const petImg = document.createElement('img');
  petImg.id = 'extension-browser-pet';
  petImg.alt = 'Browser Pet';

  // Embedded fallback icons (data URIs or SVG) so pet always renders even on arbitrary origins / headless test
  const fallbackSprites = {
    cat: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="42" rx="18" ry="14" fill="%23FFA94D"/><ellipse cx="32" cy="44" rx="12" ry="9" fill="%23FFE8CC"/><circle cx="32" cy="24" r="14" fill="%23FFA94D"/><polygon points="20,18 24,6 30,16" fill="%23FFA94D"/><polygon points="22,16 25,8 29,15" fill="%23FFC9C9"/><polygon points="44,18 40,6 34,16" fill="%23FFA94D"/><polygon points="42,16 39,8 35,15" fill="%23FFC9C9"/><ellipse cx="26" cy="22" rx="2.5" ry="3.5" fill="%232B2D42"/><ellipse cx="38" cy="22" rx="2.5" ry="3.5" fill="%232B2D42"/><circle cx="27" cy="21" r="1" fill="%23FFFFFF"/><circle cx="39" cy="21" r="1" fill="%23FFFFFF"/><polygon points="30,26 34,26 32,28" fill="%23FF8787"/><path d="M 29 29 Q 32 32 35 29" fill="none" stroke="%232B2D42" stroke-width="1.5" stroke-linecap="round"/><circle cx="21" cy="26" r="2.5" fill="%23FFA8A8" opacity="0.6"/><circle cx="43" cy="26" r="2.5" fill="%23FFA8A8" opacity="0.6"/><ellipse cx="20" cy="54" rx="5" ry="4" fill="%23FFA94D"/><ellipse cx="44" cy="54" rx="5" ry="4" fill="%23FFA94D"/><path d="M 48 44 Q 58 40 56 30" fill="none" stroke="%23FFA94D" stroke-width="5" stroke-linecap="round"/></svg>`,
    dog: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><ellipse cx="32" cy="42" rx="18" ry="14" fill="%23C68642"/><ellipse cx="32" cy="44" rx="12" ry="9" fill="%23F5DEB3"/><circle cx="32" cy="24" r="14" fill="%23C68642"/><ellipse cx="18" cy="24" rx="5" ry="10" fill="%238B4513"/><ellipse cx="46" cy="24" rx="5" ry="10" fill="%238B4513"/><ellipse cx="32" cy="28" rx="7" ry="5.5" fill="%23F5DEB3"/><ellipse cx="32" cy="25" rx="3" ry="2" fill="%232B2D42"/><circle cx="26" cy="21" r="2.5" fill="%232B2D42"/><circle cx="38" cy="21" r="2.5" fill="%232B2D42"/><ellipse cx="20" cy="54" rx="5" ry="4" fill="%23C68642"/><ellipse cx="44" cy="54" rx="5" ry="4" fill="%23C68642"/><path d="M 48 42 Q 58 35 60 25" fill="none" stroke="%238B4513" stroke-width="5" stroke-linecap="round"/></svg>`,
    dino: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><path d="M 20 44 Q 8 46 4 34 Q 10 38 18 40" fill="%2351CF66"/><ellipse cx="32" cy="42" rx="16" ry="14" fill="%2351CF66"/><ellipse cx="34" cy="45" rx="11" ry="9" fill="%23D3F9D8"/><polygon points="16,36 12,32 17,31" fill="%23FFA94D"/><polygon points="22,28 19,22 25,24" fill="%23FFA94D"/><polygon points="30,16 29,9 35,14" fill="%23FFA94D"/><circle cx="36" cy="22" r="14" fill="%2351CF66"/><ellipse cx="44" cy="24" rx="7" ry="6" fill="%2351CF66"/><circle cx="48" cy="22" r="1" fill="%232F9E44"/><circle cx="35" cy="18" r="2" fill="%232B2D42"/><ellipse cx="24" cy="54" rx="5" ry="4" fill="%2337B24D"/><ellipse cx="38" cy="54" rx="5" ry="4" fill="%2337B24D"/></svg>`
  };

  // Helper to get asset URL
  function getAssetUrl(petType) {
    const filename = `${petType}.png`;
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      try {
        const url = chrome.runtime.getURL(`assets/${filename}`);
        if (url && !url.startsWith('undefined')) {
          return url;
        }
      } catch (e) {
        // Fallback below
      }
    }
    return fallbackSprites[petType] || fallbackSprites.cat;
  }

  petImg.src = getAssetUrl(state.petType);
  container.appendChild(petImg);
  document.body.appendChild(container);

  // Position pet initially
  function updatePosition(x, y) {
    state.currentX = x;
    state.currentY = y;
    container.style.left = `${state.currentX}px`;
    container.style.top = `${state.currentY}px`;
    container.style.bottom = 'auto'; // allow dragging anywhere
  }

  updatePosition(50, Math.max(10, window.innerHeight - 85));

  // Update sprite based on direction & behavior
  function updateVisuals() {
    petImg.src = getAssetUrl(state.petType);
    petImg.style.transform = state.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';

    container.classList.remove('pet-walking', 'pet-sleeping');
    if (state.behavior === 'sleep') {
      container.classList.add('pet-sleeping');
    } else {
      container.classList.add('pet-walking');
    }
  }

  // Show floating heart or reaction emote
  function showReaction(text, clientX, clientY) {
    const isHeart = text === '❤️' || text === '💖' || text === '🐾';
    const el = document.createElement('div');
    el.className = isHeart ? 'pet-heart' : 'pet-bubble';
    el.innerText = text;

    const x = clientX !== undefined ? clientX : state.currentX + 20;
    const y = clientY !== undefined ? clientY - 30 : state.currentY - 20;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);

    setTimeout(() => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, isHeart ? 1200 : 1600);
  }

  // Load saved settings
  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['enabled', 'petType', 'behavior'], (result) => {
        if (result.enabled !== undefined) state.enabled = result.enabled;
        if (result.petType) state.petType = result.petType;
        if (result.behavior) state.behavior = result.behavior;

        container.style.display = state.enabled ? 'block' : 'none';
        updateVisuals();
      });
    }
  }

  loadSettings();

  // Listen to message updates from popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'updateSettings') {
        if (message.settings.enabled !== undefined) {
          state.enabled = message.settings.enabled;
          container.style.display = state.enabled ? 'block' : 'none';
        }
        if (message.settings.petType) {
          state.petType = message.settings.petType;
        }
        if (message.settings.behavior) {
          state.behavior = message.settings.behavior;
        }
        updateVisuals();
        sendResponse({ status: 'ok' });
      } else if (message.action === 'petFeed') {
        showReaction('🍰 Yummy!', state.currentX + 15, state.currentY);
        state.happiness = Math.min(100, state.happiness + 20);
        sendResponse({ status: 'fed', happiness: state.happiness });
      }
    });
  }

  // Pet movement step calculation (wander logic)
  function stepWander() {
    const screenWidth = window.innerWidth - 75;
    const screenHeight = window.innerHeight - 80;

    // Random turn
    if (Math.random() < 0.15) {
      state.direction *= -1;
    }

    // Occasional small pause
    if (Math.random() < 0.1) {
      return;
    }

    let nextX = state.currentX + state.direction * state.speed;

    // Boundary check horizontal
    if (nextX >= screenWidth) {
      nextX = screenWidth;
      state.direction = -1;
    } else if (nextX <= 10) {
      nextX = 10;
      state.direction = 1;
    }

    // Keep pet anchored near the bottom if not dragged high up
    let nextY = state.currentY;
    if (nextY > screenHeight) {
      nextY = screenHeight;
    }

    updatePosition(nextX, nextY);
    petImg.style.transform = state.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
  }

  // Step follow mouse logic
  function stepFollowMouse() {
    const dx = state.mousePos.x - (state.currentX + 32);
    const dy = state.mousePos.y - (state.currentY + 32);
    const dist = Math.hypot(dx, dy);

    // Stop if close enough
    if (dist < 40) {
      return;
    }

    // Move toward mouse
    const step = Math.min(state.speed, dist * 0.1);
    const nextX = state.currentX + (dx / dist) * step;
    const nextY = state.currentY + (dy / dist) * step;

    state.direction = dx >= 0 ? 1 : -1;
    updatePosition(nextX, nextY);
    petImg.style.transform = state.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
  }

  // Main game / animation tick
  function tick() {
    if (!state.enabled || state.isDragging) return;

    if (state.behavior === 'wander') {
      stepWander();
    } else if (state.behavior === 'follow') {
      stepFollowMouse();
    } else if (state.behavior === 'sleep') {
      // Pet rests in place, small zzz chance
      if (Math.random() < 0.08) {
        showReaction('💤', state.currentX + 20, state.currentY);
      }
    }
  }

  state.walkIntervalId = setInterval(tick, 1000);

  // Track mouse coordinates for follow mode
  window.addEventListener('mousemove', (e) => {
    state.mousePos.x = e.clientX;
    state.mousePos.y = e.clientY;
  });

  // Drag and Drop functionality
  container.addEventListener('pointerdown', (e) => {
    // Only primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    state.isDragging = true;
    state.hasMovedDuringDrag = false;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    state.initialPetX = state.currentX;
    state.initialPetY = state.currentY;

    container.classList.add('dragging');
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!state.isDragging) return;

    const dx = e.clientX - state.dragStartX;
    const dy = e.clientY - state.dragStartY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      state.hasMovedDuringDrag = true;
    }

    let nextX = state.initialPetX + dx;
    let nextY = state.initialPetY + dy;

    // Boundaries
    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    nextX = Math.max(0, Math.min(nextX, maxX));
    nextY = Math.max(0, Math.min(nextY, maxY));

    updatePosition(nextX, nextY);
  });

  function stopDrag(e) {
    if (!state.isDragging) return;
    state.isDragging = false;
    container.classList.remove('dragging');
    try {
      container.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }

  container.addEventListener('pointerup', stopDrag);
  container.addEventListener('pointercancel', stopDrag);

  // Click interaction (petting)
  container.addEventListener('click', (e) => {
    // If was dragging significantly, do not trigger click
    if (state.hasMovedDuringDrag) {
      return;
    }

    const hearts = ['❤️', '💖', '🐾', '⭐', '✨'];
    const chosen = hearts[Math.floor(Math.random() * hearts.length)];
    showReaction(chosen, e.clientX || state.currentX + 32, e.clientY || state.currentY);

    state.happiness = Math.min(100, state.happiness + 5);

    // Bounce slightly
    petImg.style.transform = `${state.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)'} scale(1.25)`;
    setTimeout(() => {
      petImg.style.transform = state.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
    }, 200);
  });

  // Handle window resizing gracefully
  window.addEventListener('resize', () => {
    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    const boundedX = Math.max(0, Math.min(state.currentX, maxX));
    const boundedY = Math.max(0, Math.min(state.currentY, maxY));
    updatePosition(boundedX, boundedY);
  });

  // Expose state for automated testing if running in node/playwright test env
  if (typeof window !== 'undefined') {
    window.__browserPetState = state;
    window.__browserPetTick = tick;
    window.__browserPetStepWander = stepWander;
    window.__browserPetStepFollow = stepFollowMouse;
  }
})();
