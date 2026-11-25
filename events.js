// events.js - Koleksi cerita panjang, pertarungan dramatis, dan kejadian absurd

const goldEvents = [
  "While carefully stepping over a pile of ancient ruins, your boot kicks something metallic. You brush away the thick layer of dust and uncover a small velvet pouch containing {gold} Gold!",
  "You notice a faint glimmer inside a crack along the damp cavern wall. Reaching your hand inside, you pull out a handful of tarnished coins worth {gold} Gold.",
  "A clumsy goblin merchant runs past you in sheer panic, tripping over his own shoelaces and spilling {gold} Gold across the stone floor before disappearing into the shadows.",
  "You decide to smash an abandoned wooden barrel resting in the corner of the hallway. Amidst the splinters and cobwebs, you find {gold} Gold hidden at the bottom.",
  "Beneath the skeletal remains of an unfortunate adventurer who clearly forgot to bring potions, you discover a leather belt holding {gold} Gold.",
  "You spot a tiny mimic pretending to be a teacup. Instead of biting you, it spits out {gold} Gold in embarrassment and scuttles away into a hole.",
  "The ceiling trembles slightly as a loose stone falls right in front of you, revealing a secret stash tucked behind the brickwork containing {gold} Gold!",
  "You help a lost dungeon turtle flip back onto its feet. As a token of gratitude, it coughs up {gold} Gold and slowly walks away."
];

const monsterEvents = [
  "A massive Wild Slime drops from the ceiling right onto your shoulders! You panic and swing your weapon wildly until it dissolves into puddles, though its acid burns your skin. (+{exp} EXP, +{gold} Gold, -{dmg} HP)",
  "Out of the pitch-black corridor, a swarm of furious Cave Bats ambushes you! You manage to fend them off with swift strikes, but not before taking a few nasty bites. (+{exp} EXP, +{gold} Gold, -{dmg} HP)",
  "A rattling Skeleton Warrior blocks your path, brandishing a rusty broadsword. After an intense clash of steel, you shatter its bones into pieces, suffering a shallow cut in the process. (+{exp} EXP, +{gold} Gold, -{dmg} HP)",
  "You accidentally step on a sticky web, summoning a Giant Dungeon Spider from the darkness! You slice through its legs and claim victory, though its fangs grazed your arm. (+{exp} EXP, +{gold} Gold, -{dmg} HP)",
  "A grumpy Goblin Brawler challenges you to a fistfight over a half-eaten sandwich. You knock him out cold, but he managed to land a surprisingly solid punch on your jaw. (+{exp} EXP, +{gold} Gold, -{dmg} HP)",
  "An angry Haunted Armor comes to life and charges at you like a runaway wagon! You dodge at the last second and dismantle its helmet, bruising your ribs during the scuffle. (+{exp} EXP, +{gold} Gold, -{dmg} HP)",
  "A feral Sewer Rat the size of a golden retriever lunges at your ankles! You kick it across the room and finish it off, walking away with a painful scratch. (+{exp} EXP, +{gold} Gold, -{dmg} HP)",
  "You disturb a sleeping Stone Gargoyle that immediately tries to flatten you. You chip away at its joints until it crumbles into gravel, leaving you exhausted and bruised. (+{exp} EXP, +{gold} Gold, -{dmg} HP)"
];

const itemEvents = [
  "As you round a sharp corner, you notice a soft glowing light illuminating a mossy pedestal. Resting safely on top is a pristine 1x {item} waiting to be claimed!",
  "You pry open the rusted hinges of a forgotten iron chest half-buried in the mud. Inside, wrapped in dry cloth, you find 1x {item}!",
  "A mysterious hooded figure bumps into you in the dark, mutters 'You didn't see me,' and shoves 1x {item} straight into your hands before vanishing.",
  "You defeat a tiny, harmless dust bunny that somehow explodes into confetti, leaving behind 1x {item} on the dungeon floor.",
  "While inspecting a suspiciously clean bookshelf in the middle of a filthy cave, you pull a fake book and a hidden compartment drops 1x {item} into your bag!",
  "You find a backpack hanging from a stalactite with a note attached that reads: 'Free to a good home.' Inside, you discover 1x {item}!"
];

const emptyEvents = [
  "You take a step forward and hear dramatic boss music playing in the distance... only to realize it is just a skeleton playing a tiny flute.",
  "You find a wooden sign nailed to the wall that reads: 'Congratulations! You have read this sign.' You feel slightly wiser, yet nothing happens.",
  "A rock falls from the ceiling, bounces off your head with a hollow 'bonk' sound, and apologizes before rolling away.",
  "You spot a shadowy figure staring intensely at you from across the chasm. You wave awkwardly, and it waves back before walking into a wall.",
  "You step on a suspiciously glowing pressure plate! A loud mechanical noise echoes through the hall... and a toaster pops up with burnt bread.",
  "You pause for a moment to question why dungeons always have lit torches when nobody lives here. The mystery remains unsolved.",
  "A tiny goblin runs up to you, yells 'TAX EVASION!', slaps a piece of cheese onto your forehead, and sprints back into the darkness.",
  "You trip over absolutely nothing, look around quickly to make sure no monsters saw you, and continue walking with your dignity barely intact.",
  "You discover a magnificent golden door covered in ancient runes. When you push it open, it leads straight into a broom closet with a single mop.",
  "The wind howls eerily through the corridor, whispering your character's name... followed by a quiet 'never mind, wrong adventurer.'",
  "You encounter a slime wearing a tiny top hat and monocle. It tips its hat politely as you pass by without saying a word.",
  "You spend ten whole seconds staring at a puddle, convinced it is a water elemental, before realizing it is literally just dirty water.",
  "A stray dungeon cat walks up, rubs against your leg, judges your equipment with a disgusted meow, and struts away.",
  "You find an ancient treasure map! Upon closer inspection, it is just a napkin with a drawing of a potato on it."
];

module.exports = {
  goldEvents,
  monsterEvents,
  itemEvents,
  emptyEvents
};
