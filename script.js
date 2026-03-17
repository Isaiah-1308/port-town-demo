(function () {
  var state = {
    day: 1,
    stamina: 12,
    staminaMax: 12,
    money: 0,
    quest: 'arrival'
  };

  var scenes = {
    town: { title: 'Harbor Town - Main Street', cls: 'scene-town' },
    dock: { title: 'Pier Area - Foreman Office', cls: 'scene-dock' },
    warehouse: { title: 'Warehouse District', cls: 'scene-warehouse' },
    rest: { title: 'Evening Break', cls: 'scene-rest' }
  };

  var nodes = {
    arrival: {
      scene: 'town',
      text: [
        'You arrive at Harbor Town with a salt-wet bag and tired boots.',
        'The town board points toward the docks. First day, first report-in.'
      ],
      next: 'meetForeman'
    },
    meetForeman: {
      scene: 'dock',
      text: [
        'Foreman Hale looks up from a clipboard. "New hand? Good. Work starts now."',
        '"Go to Pier 3, check every cargo item, then deliver it to the warehouse."'
      ],
      choices: [
        { label: 'Take the first job', next: 'checkPier3', effect: { quest: 'firstJob' } },
        { label: 'Ask for details', next: 'foremanDetails' }
      ]
    },
    foremanDetails: {
      scene: 'dock',
      text: [
        '"Three canvas rolls, two nail crates, four fragile boxes," he says. "Count twice."'
      ],
      choices: [{ label: 'Head to Pier 3', next: 'checkPier3', effect: { quest: 'firstJob' } }]
    },
    checkPier3: {
      scene: 'dock',
      text: [
        'At Pier 3, waves drum against the pylons while you count each item aloud.',
        'The manifest matches. You mark it and start carrying cargo inland.'
      ],
      choices: [
        { label: 'Carry carefully (Stamina -2)', next: 'deliverWarehouse', effect: { stamina: -2, quest: 'deliver' } },
        { label: 'Carry quickly (Stamina -3)', next: 'deliverWarehouseFast', effect: { stamina: -3, quest: 'deliver' } }
      ]
    },
    deliverWarehouse: {
      scene: 'warehouse',
      text: [
        'You deliver in two steady runs. The warehouse clerk stamps each line.',
        'Nothing broken. Nothing missing. Routine, but solid.'
      ],
      next: 'getPaid'
    },
    deliverWarehouseFast: {
      scene: 'warehouse',
      text: [
        'You haul everything before sunset. Your shoulders ache, but the list is complete.',
        'The clerk grunts, almost impressed.'
      ],
      next: 'getPaid'
    },
    getPaid: {
      scene: 'warehouse',
      text: [
        'Foreman Hale drops your first coins into your hand.',
        'Your first pay in Harbor Town feels heavier than the metal itself.'
      ],
      choices: [{ label: 'Pocket the pay and take a short rest', next: 'restScene', effect: { money: 18, quest: 'rest' } }]
    },
    restScene: {
      scene: 'rest',
      text: [
        'Evening settles. You can see signs for the market and the tavern.',
        'The sky is bright, the water is clear; yet the sun is low, and in the long shadows something unseen feels close.'
      ],
      choices: [
        { label: 'Walk near the market', next: 'marketRoam' },
        { label: 'Stand by the tavern door', next: 'tavernRoam' },
        { label: 'Return to warehouse to confirm paperwork', next: 'missingBox' }
      ]
    },
    marketRoam: {
      scene: 'town',
      text: [
        'You drift through market lanes: fish scales glint silver, and voices overlap like gull cries.',
        'No interactions yet, but you map the alleys in your mind.'
      ],
      choices: [{ label: 'Back to break point', next: 'restScene', effect: { stamina: -1 } }]
    },
    tavernRoam: {
      scene: 'rest',
      text: [
        'Warm light leaks from the tavern door. Someone inside laughs, then coughs into silence.',
        'You do not enter. Not tonight.'
      ],
      choices: [{ label: 'Back to break point', next: 'restScene' }]
    },
    missingBox: {
      scene: 'warehouse',
      text: [
        'Back at the warehouse, arguments rise over a missing cargo box: tag H-17.',
        'Foreman Hale turns to you. "Tomorrow, old pier. We follow the trail there."',
        'The night wind turns cold. The real story starts now.'
      ],
      choices: [{ label: 'End Demo: go to the old pier tomorrow', next: 'demoEnd', effect: { quest: 'hook' } }]
    },
    demoEnd: {
      scene: 'rest',
      text: ['[Demo End]', 'Tomorrow: the old pier.'],
      choices: [{ label: 'Restart demo', next: 'arrival', reset: true }]
    }
  };

  var dayEl = document.getElementById('day');
  var staminaEl = document.getElementById('stamina');
  var moneyEl = document.getElementById('money');
  var sceneImageEl = document.getElementById('scene-image');
  var sceneTitleEl = document.getElementById('scene-title');
  var textEl = document.getElementById('text-content');
  var choiceListEl = document.getElementById('choice-list');
  var continueBtn = document.getElementById('continue-btn');

  var currentNode = 'arrival';
  var currentLine = 0;

  function updateStatus() {
    dayEl.textContent = String(state.day);
    staminaEl.textContent = state.stamina + '/' + state.staminaMax;
    moneyEl.textContent = String(state.money);
  }

  function applyEffect(effect) {
    if (!effect) return;
    if (typeof effect.stamina === 'number') {
      state.stamina = Math.max(0, Math.min(state.staminaMax, state.stamina + effect.stamina));
    }
    if (typeof effect.money === 'number') {
      state.money = Math.max(0, state.money + effect.money);
    }
    if (typeof effect.day === 'number') {
      state.day = Math.max(1, state.day + effect.day);
    }
    if (typeof effect.quest === 'string') {
      state.quest = effect.quest;
    }
  }

  function resetState() {
    state.day = 1;
    state.stamina = 12;
    state.money = 0;
    state.quest = 'arrival';
  }

  function renderChoices(choices) {
    choiceListEl.innerHTML = '';
    for (var i = 0; i < choices.length; i += 1) {
      (function (choice) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.textContent = choice.label;
        btn.addEventListener('click', function () {
          if (choice.reset) {
            resetState();
          }
          applyEffect(choice.effect);
          goTo(choice.next);
        });
        choiceListEl.appendChild(btn);
      })(choices[i]);
    }
  }

  function render() {
    var node = nodes[currentNode];
    var scene = scenes[node.scene];

    sceneTitleEl.textContent = scene.title;
    sceneImageEl.className = 'scene-image ' + scene.cls;
    textEl.textContent = node.text[currentLine];

    if (currentLine < node.text.length - 1) {
      continueBtn.style.display = 'block';
      choiceListEl.innerHTML = '';
    } else if (node.choices) {
      continueBtn.style.display = 'none';
      renderChoices(node.choices);
    } else {
      continueBtn.style.display = 'block';
      choiceListEl.innerHTML = '';
    }

    updateStatus();
  }

  function goTo(next) {
    currentNode = next;
    currentLine = 0;
    render();
  }

  continueBtn.addEventListener('click', function () {
    var node = nodes[currentNode];

    if (currentLine < node.text.length - 1) {
      currentLine += 1;
      render();
      return;
    }

    if (node.next) {
      applyEffect(node.effect);
      goTo(node.next);
    }
  });

  render();
})();
