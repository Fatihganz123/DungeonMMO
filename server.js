const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { goldEvents, itemEvents, emptyEvents } = require('./events');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const players = {};
const chatHistory = [];
const CHAT_COOLDOWN_MS = 5000;

const ITEMS_DB = {
  "Health Potion": { type: "heal", value: 40, desc: "Restores 40 HP" },
  "Super Potion": { type: "heal", value: 80, desc: "Restores 80 HP" },
  "Rusty Coin": { type: "sell", value: 25, desc: "Can be sold for 25 Gold" }
};

// Daftar NPC Musuh dengan Level, Sprite, HP, dan Hadiah
const NPCS_DB = [
  { name: "Lugdum", sprite: "🧌", baseHp: 65, baseAtk: 8, expReward: 35, goldReward: 22 },
  { name: "Nash", sprite: "👹", baseHp: 80, baseAtk: 10, expReward: 45, goldReward: 30 },
  { name: "Wild Slime", sprite: "🟢", baseHp: 45, baseAtk: 5, expReward: 22, goldReward: 14 },
  { name: "Skeleton Knight", sprite: "💀", baseHp: 75, baseAtk: 9, expReward: 40, goldReward: 25 },
  { name: "Shadow Assassin", sprite: "🥷", baseHp: 70, baseAtk: 12, expReward: 50, goldReward: 35 }
];

function getRandomText(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function calculateCooldownSeconds(text) {
  const rawSeconds = Math.ceil(text.length / 20);
  return Math.max(3, Math.min(12, rawSeconds));
}

// --- SOCKET.IO (LIVE CHAT) ---
io.on('connection', (socket) => {
  socket.lastChatAt = 0;
  io.emit('online-count', io.engine.clientsCount);
  socket.emit('chat-history', chatHistory);

  socket.on('send-chat', (data) => {
    if (!data || !data.username || !data.message) return;

    const now = Date.now();
    const timePassed = now - socket.lastChatAt;
    if (timePassed < CHAT_COOLDOWN_MS) {
      const remainingSec = Math.ceil((CHAT_COOLDOWN_MS - timePassed) / 1000);
      socket.emit('chat-error', `Please wait ${remainingSec}s before sending another message.`);
      return;
    }

    const cleanMsg = data.message.trim().slice(0, 200);
    if (!cleanMsg) return;

    socket.lastChatAt = now;
    const playerLevel = players[data.username] ? players[data.username].level : 1;
    const chatData = {
      username: data.username,
      level: playerLevel,
      message: cleanMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chatHistory.push(chatData);
    if (chatHistory.length > 30) chatHistory.shift();
    io.emit('new-chat', chatData);
  });

  socket.on('disconnect', () => {
    io.emit('online-count', io.engine.clientsCount);
  });
});

// --- API ENDPOINTS ---
app.post('/api/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username cannot be empty' });

  if (!players[username]) {
    players[username] = {
      username,
      level: 1,
      exp: 0,
      maxExp: 100,
      gold: 50,
      hp: 100,
      maxHp: 100,
      energy: 10,
      maxEnergy: 10,
      inventory: {
        "Health Potion": 4
      },
      encounter: null, // Menyimpan data NPC yang baru ditemui
      battle: null,    // Menyimpan status pertarungan yang sedang berlangsung
      nextStepAllowedAt: 0
    };
  }
  res.json(players[username]);
});

// 1. TAKE A STEP
app.post('/api/step', (req, res) => {
  const { username } = req.body;
  const player = players[username];
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const now = Date.now();
  if (now < player.nextStepAllowedAt) {
    const remainingMs = player.nextStepAllowedAt - now;
    const remainingSec = (remainingMs / 1000).toFixed(1);
    return res.status(429).json({ 
      error: `Please wait ${remainingSec}s before taking another step!`,
      remainingMs
    });
  }

  // Pulihkan 1 Energy setiap kali melangkah
  player.energy = Math.min(player.maxEnergy, player.energy + 1);
  player.encounter = null;
  player.battle = null;

  const chance = Math.random();
  let message = '';
  const rewards = { gold: 0, exp: 0, item: null };

  if (chance < 0.25) {
    // 25% Dapat Gold
    const foundGold = Math.floor(Math.random() * 15) + 5;
    player.gold += foundGold;
    rewards.gold = foundGold;
    message = getRandomText(goldEvents).replace('{gold}', foundGold);
  } else if (chance < 0.70) {
    // 45% Bertemu NPC Musuh (Memunculkan Kartu Encounter seperti Gambar 2)
    const template = NPCS_DB[Math.floor(Math.random() * NPCS_DB.length)];
    const npcLevel = Math.max(1, player.level + Math.floor(Math.random() * 3) - 1);
    const maxHp = template.baseHp + (npcLevel - 1) * 15;

    player.encounter = {
      name: template.name,
      sprite: template.sprite,
      level: npcLevel,
      hp: maxHp,
      maxHp: maxHp,
      atk: template.baseAtk + (npcLevel - 1) * 2,
      expReward: template.expReward + (npcLevel - 1) * 10,
      goldReward: template.goldReward + (npcLevel - 1) * 8
    };
    message = `A wild ${player.encounter.name} blocks your path!`;
  } else if (chance < 0.85) {
    // 15% Dapat Item
    const availableItems = Object.keys(ITEMS_DB);
    const foundItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    player.inventory[foundItem] = (player.inventory[foundItem] || 0) + 1;
    rewards.item = foundItem;
    message = getRandomText(itemEvents).replace('{item}', foundItem);
  } else {
    // 15% Kejadian Absurd / Kosong
    message = getRandomText(emptyEvents);
  }

  const cooldownSeconds = player.encounter ? 3 : calculateCooldownSeconds(message);
  player.nextStepAllowedAt = now + (cooldownSeconds * 1000);

  res.json({ player, message, cooldownSeconds, rewards, encounter: player.encounter });
});

// 2. MULAI PERTARUNGAN (SAAT TOMBOL BIRU "ATTACK" DI KARTU ENCOUNTER DIKLIK)
app.post('/api/battle/start', (req, res) => {
  const { username } = req.body;
  const player = players[username];
  if (!player || !player.encounter) {
    return res.status(400).json({ error: 'No NPC to attack!' });
  }

  player.battle = { ...player.encounter };
  player.encounter = null;
  res.json({ player, battle: player.battle });
});

// 3. KABUR DARI ENCOUNTER
app.post('/api/battle/flee', (req, res) => {
  const { username } = req.body;
  const player = players[username];
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const npcName = player.encounter ? player.encounter.name : 'the enemy';
  player.encounter = null;
  player.battle = null;
  res.json({ player, message: `You slipped into the shadows and safely escaped from ${npcName}.` });
});

// 4. AKSI PERTARUNGAN: ATTACK / SPECIAL ATK / USE ITEM
app.post('/api/battle/action', (req, res) => {
  const { username, action } = req.body;
  const player = players[username];
  if (!player || !player.battle) {
    return res.status(400).json({ error: 'No active battle!' });
  }

  const npc = player.battle;
  let battleLog = '';
  let playerDmgDealt = 0;
  let npcDmgDealt = 0;
  let status = 'ongoing'; // 'ongoing' | 'won' | 'lost'
  const rewards = { gold: 0, exp: 0, item: null };

  // A. Giliran Pemain
  if (action === 'attack') {
    const baseDmg = 14 + (player.level * 3);
    playerDmgDealt = baseDmg + Math.floor(Math.random() * 6);
    npc.hp = Math.max(0, npc.hp - playerDmgDealt);
    battleLog = `You attacked ${npc.name} for ${playerDmgDealt} damage!`;
  } else if (action === 'special') {
    if (player.energy < 1) {
      return res.status(400).json({ error: 'Not enough Energy (⚡) for Special Atk!' });
    }
    player.energy -= 1;
    const baseDmg = 28 + (player.level * 5);
    playerDmgDealt = baseDmg + Math.floor(Math.random() * 10);
    npc.hp = Math.max(0, npc.hp - playerDmgDealt);
    battleLog = `⚡ SPECIAL ATTACK! You unleashed a devastating blow on ${npc.name} for ${playerDmgDealt} damage!`;
  } else if (action === 'item') {
    // Cari potion pertama yang ada di inventory
    const potionName = player.inventory["Health Potion"] > 0 ? "Health Potion" :
                       player.inventory["Super Potion"] > 0 ? "Super Potion" : null;
    if (!potionName) {
      return res.status(400).json({ error: 'You have no healing potions left!' });
    }
    if (player.hp >= player.maxHp) {
      return res.status(400).json({ error: 'Your HP is already at 100%!' });
    }

    const healVal = ITEMS_DB[potionName].value;
    const actualHeal = Math.min(player.maxHp - player.hp, healVal);
    player.hp += actualHeal;
    player.inventory[potionName] -= 1;
    if (player.inventory[potionName] <= 0) delete player.inventory[potionName];

    battleLog = `🧪 You used ${potionName} and restored +${actualHeal} HP!`;
  }

  // B. Cek Apakah NPC Kalah
  if (npc.hp <= 0) {
    status = 'won';
    player.exp += npc.expReward;
    player.gold += npc.goldReward;
    rewards.exp = npc.expReward;
    rewards.gold = npc.goldReward;

    // 35% Peluang NPC menjatuhkan item
    if (Math.random() < 0.35) {
      const availableItems = Object.keys(ITEMS_DB);
      const dropItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      player.inventory[dropItem] = (player.inventory[dropItem] || 0) + 1;
      rewards.item = dropItem;
    }

    // Cek Level Up (Stat meningkat diam-diam tanpa pop-up sesuai permintaan)
    if (player.exp >= player.maxExp) {
      player.level += 1;
      player.exp -= player.maxExp;
      player.maxExp = Math.floor(player.maxExp * 1.5);
      player.maxHp += 20;
      player.hp = player.maxHp;
    }

    battleLog += ` 🏆 You defeated ${npc.name}!`;
    player.battle = null;
    return res.json({ player, battle: null, status, battleLog, playerDmgDealt, npcDmgDealt, rewards });
  }

  // C. Giliran NPC Membalas Serangan (jika NPC masih hidup)
  npcDmgDealt = Math.max(1, npc.atk + Math.floor(Math.random() * 4) - 1);
  player.hp = Math.max(0, player.hp - npcDmgDealt);
  battleLog += ` ${npc.name} struck back for ${npcDmgDealt} damage!`;

  // D. Cek Apakah Pemain Kalah
  if (player.hp <= 0) {
    status = 'lost';
    const lostGold = Math.floor(player.gold * 0.2);
    player.gold -= lostGold;
    player.hp = player.maxHp;
    player.battle = null;
    battleLog += ` 💀 You were defeated by ${npc.name} and lost ${lostGold} Gold!`;
    return res.json({ player, battle: null, status, battleLog, playerDmgDealt, npcDmgDealt, rewards });
  }

  res.json({ player, battle: npc, status, battleLog, playerDmgDealt, npcDmgDealt, rewards });
});

// 5. GUNAKAN ITEM DI LUAR PERTARUNGAN
app.post('/api/use-item', (req, res) => {
  const { username, itemName } = req.body;
  const player = players[username];
  if (!player) return res.status(404).json({ error: 'Player not found' });

  if (!player.inventory[itemName] || player.inventory[itemName] <= 0) {
    return res.status(400).json({ error: 'You do not have this item!' });
  }

  const itemData = ITEMS_DB[itemName];
  let actionMessage = '';

  if (itemData.type === 'heal') {
    if (player.hp >= player.maxHp) {
      return res.status(400).json({ error: 'Your HP is already full!' });
    }
    const healedAmount = Math.min(player.maxHp - player.hp, itemData.value);
    player.hp += healedAmount;
    actionMessage = `🧪 You drank a ${itemName} and recovered ${healedAmount} HP!`;
  } else if (itemData.type === 'sell') {
    player.gold += itemData.value;
    actionMessage = `💰 You sold ${itemName} for ${itemData.value} Gold!`;
  } else {
    return res.status(400).json({ error: 'This item cannot be used.' });
  }

  player.inventory[itemName] -= 1;
  if (player.inventory[itemName] <= 0) {
    delete player.inventory[itemName];
  }

  res.json({ player, message: actionMessage });
});

server.listen(PORT, () => {
  console.log(`DungeonMMO server running on port ${PORT}`);
});