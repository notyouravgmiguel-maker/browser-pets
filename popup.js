/**
 * Popup Script for Browser Pet Extension
 */

document.addEventListener('DOMContentLoaded', () => {
  const toggleEnabled = document.getElementById('toggle-enabled');
  const petChoices = document.querySelectorAll('.pet-choice');
  const behaviorRadios = document.querySelectorAll('input[name="behavior"]');
  const avatarImg = document.getElementById('pet-avatar');
  const feedBtn = document.getElementById('feed-btn');
  const happinessVal = document.getElementById('happiness-val');
  const happinessBar = document.getElementById('happiness-bar');

  let currentSettings = {
    enabled: true,
    petType: 'cat',
    behavior: 'wander',
    happiness: 100
  };

  // Helper to sync state to active tabs
  function broadcastSettings(settings) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            settings: settings
          }, () => {
            // Ignore if content script is not yet injected
            if (chrome.runtime.lastError) {}
          });
        }
      });
    }
  }

  // Save settings to chrome.storage
  function saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set(currentSettings);
    }
    broadcastSettings(currentSettings);
  }

  // Update UI presentation
  function updateUI() {
    toggleEnabled.checked = currentSettings.enabled;

    petChoices.forEach((btn) => {
      if (btn.getAttribute('data-pet') === currentSettings.petType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    behaviorRadios.forEach((radio) => {
      radio.checked = radio.value === currentSettings.behavior;
    });

    avatarImg.src = `assets/${currentSettings.petType}.png`;
    happinessVal.innerText = `${currentSettings.happiness}%`;
    happinessBar.style.width = `${currentSettings.happiness}%`;
  }

  // Load stored settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['enabled', 'petType', 'behavior', 'happiness'], (res) => {
      if (res.enabled !== undefined) currentSettings.enabled = res.enabled;
      if (res.petType) currentSettings.petType = res.petType;
      if (res.behavior) currentSettings.behavior = res.behavior;
      if (res.happiness !== undefined) currentSettings.happiness = res.happiness;
      updateUI();
    });
  } else {
    updateUI();
  }

  // Event: Toggle enabled/disabled
  toggleEnabled.addEventListener('change', () => {
    currentSettings.enabled = toggleEnabled.checked;
    saveSettings();
  });

  // Event: Select pet species
  petChoices.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentSettings.petType = btn.getAttribute('data-pet');
      updateUI();
      saveSettings();
    });
  });

  // Event: Select behavior mode
  behaviorRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        currentSettings.behavior = radio.value;
        saveSettings();
      }
    });
  });

  // Event: Feed pet
  feedBtn.addEventListener('click', () => {
    currentSettings.happiness = Math.min(100, currentSettings.happiness + 20);
    updateUI();
    saveSettings();

    // Trigger celebration emote in active tab
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'petFeed'
          }, () => {
            if (chrome.runtime.lastError) {}
          });
        }
      });
    }
  });
});
