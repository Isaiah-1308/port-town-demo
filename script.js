const state = {
  day: 1,
  stamina: 10,
  money: 0,
  current: 'arrival',
  quest: '',
  awaitingChoice: false
};

const scenes = {
  town: { title: '港口小镇·主街', cls: 'scene-town' },
  dock: { title: '3号码头工房', cls: 'scene-dock' },
  warehouse: { title: '仓库区', cls: 'scene-warehouse' }
};

const story = {
  arrival: {
    scene: 'town',
    lines: [
      '你拎着一只被海风吹得发硬的旧布包，踩进了港口小镇的主街。',
      '空气里混着咸湿的海味、鱼腥味和木箱受潮后的味道。',
      '昨晚介绍你来做活的人说，码头最近正缺人手。',
      '今天，是你第一天正式来报到。'
    ],
    next: 'meetForeman'
  },

  meetForeman: {
    scene: 'dock',
    lines: [
      '码头边，一个身材粗壮的中年男人正低头看着夹板上的登记单。',
      '他听见脚步声，抬眼扫了你一下。',
      '“新来的？”他把木炭笔往耳后一别，“我叫黑尔，大家都叫我工头。”',
      '“闲话少说，今天先跟着做一趟轻活。做得利索，就有下一顿饭吃。”'
    ],
    choices: [
      { label: '接下第一份工作', next: 'checkPier3', effect: { quest: 'firstJob' } }
    ]
  },

  checkPier3: {
    scene: 'dock',
    lines: [
      '工头把货单塞到你手里。',
      '“去3号码头，把那批要入库的货清点一遍，再送到仓库区。”',
      '海浪一下一下拍着木桩。你蹲下身，照着货单核对箱号和件数。',
      '这份活不算难，但每一个箱子都沉得要命。'
    ],
    choices: [
      { label: '稳稳当当地搬运（体力 -2）', next: 'deliverWarehouse', effect: { stamina: -2, quest: 'deliver' } },
      { label: '赶时间，快速搬运（体力 -3）', next: 'deliverWarehouseFast', effect: { stamina: -3, quest: 'deliver' } }
    ]
  },

  deliverWarehouse: {
    scene: 'warehouse',
    lines: [
      '你把最后一个箱子推到仓库门口时，后背已经被汗浸透了。',
      '仓库管理员接过货单，对着登记簿一项一项核对。',
      '“数目对得上，先放这边。”他说着，在货单角上盖了个章。'
    ],
    next: 'getPaid'
  },

  deliverWarehouseFast: {
    scene: 'warehouse',
    lines: [
      '你几乎是咬着牙把货全搬到了仓库门口，手臂酸得发抖。',
      '仓库管理员皱着眉看了你一眼，还是接过货单开始登记。',
      '“动作倒是快，别把货磕坏了就行。”他说。'
    ],
    next: 'getPaid'
  },

  getPaid: {
    scene: 'dock',
    lines: [
      '回到码头后，工头黑尔把几枚硬币丢到你掌心里。',
      '“干得还行，至少不像一阵风就能吹倒。”',
      '这是你来到港口小镇后，真正赚到的第一笔钱。'
    ],
    effect: { money: 8 },
    next: 'restMoment'
  },

  restMoment: {
    scene: 'town',
    lines: [
      '忙完这一趟，天色已经有些偏黄。',
      '你站在主街口，能看见市场那边还有人在吆喝，酒馆门口也聚了几个人。',
      '短短半天，这座小镇已经不像清晨时那样陌生了。'
    ],
    choices: [
      { label: '在市场口站一会儿', next: 'bigEvent' },
      { label: '去酒馆门口歇口气', next: 'bigEvent' }
    ]
  },

  bigEvent: {
    scene: 'warehouse',
    lines: [
      '你还没来得及多喘两口气，仓库区那边突然传来一阵吵嚷。',
      '有人在喊：“不对，少了一个箱子！”',
      '工头和仓库管理员的脸色一下都变了。',
      '单据没错，路线没错，搬运的人数也没错，可那只箱子就是不见了。',
      '更糟的是——你正好参与了这批货的搬运。'
    ],
    next: 'hook'
  },

  hook: {
    scene: 'dock',
    lines: [
      '工头黑尔沉着脸走到你面前，声音压得很低。',
      '“明天一早，跟我去旧栈桥。”',
      '“这事，恐怕没表面上这么简单。”',
      '第一章试玩结束。'
    ],
    choices: [
      { label: '重新开始试玩', next: 'arrival', reset: true }
    ]
  }
};

const dayEl = document.getElementById('day');
const staminaEl = document.getElementById('stamina');
const moneyEl = document.getElementById('money');
const sceneTitleEl = document.getElementById('scene-title');
const sceneArtEl = document.getElementById('scene-art');
const storyTextEl = document.getElementById('story-text');
const choicesEl = document.getElementById('choices');
const continueBtn = document.getElementById('continue-btn');

function applyEffect(effect = {}) {
  if (typeof effect.stamina === 'number') state.stamina = Math.max(0, state.stamina + effect.stamina);
  if (typeof effect.money === 'number') state.money = Math.max(0, state.money + effect.money);
  if (typeof effect.day === 'number') state.day = Math.max(1, state.day + effect.day);
  if (typeof effect.quest === 'string') state.quest = effect.quest;
}

function renderStatus() {
  dayEl.textContent = state.day;
  staminaEl.textContent = state.stamina;
  moneyEl.textContent = state.money;
}

function renderScene(sceneKey) {
  const scene = scenes[sceneKey];
  sceneTitleEl.textContent = scene.title;
  sceneArtEl.className = `scene-art ${scene.cls}`;
}

function goTo(nextKey) {
  state.current = nextKey;
  state.awaitingChoice = false;
  renderCurrent();
}

function renderChoices(scene) {
  choicesEl.innerHTML = '';
  if (!scene.choices) return;

  state.awaitingChoice = true;
  scene.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = choice.label;
    btn.addEventListener('click', () => {
      if (choice.reset) {
        state.day = 1;
        state.stamina = 10;
        state.money = 0;
        state.quest = '';
      }
      applyEffect(choice.effect);
      goTo(choice.next);
    });
    choicesEl.appendChild(btn);
  });
}

function renderCurrent() {
  const current = story[state.current];
  if (current.effect && !current._applied) {
    applyEffect(current.effect);
    current._applied = true;
  }

  renderStatus();
  renderScene(current.scene);
  storyTextEl.innerHTML = current.lines.map(line => `<p>${line}</p>`).join('');
  renderChoices(current);

  continueBtn.style.display = current.choices ? 'none' : 'inline-block';
}

continueBtn.addEventListener('click', () => {
  const current = story[state.current];
  if (current.next) {
    goTo(current.next);
  }
});

renderCurrent();
