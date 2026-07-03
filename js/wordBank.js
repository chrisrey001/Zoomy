// wordBank.js — curated items grouped by category.
// Each item: { word, wikiTitle, synonyms[], hypernyms[] }
//   word      : the canonical answer shown on reveal
//   wikiTitle : Wikipedia page title used to fetch a representative photo
//   synonyms  : other spellings/names that earn FULL credit
//   hypernyms : broader/related terms that earn PARTIAL credit (e.g. fern -> plant)

export const CATEGORIES = {
  "Animals": [
    { word: "cat", wikiTitle: "Cat", synonyms: ["kitten", "kitty", "feline"], hypernyms: ["animal", "pet", "mammal"] },
    { word: "dog", wikiTitle: "Dog", synonyms: ["puppy", "hound", "canine"], hypernyms: ["animal", "pet", "mammal"] },
    { word: "elephant", wikiTitle: "Elephant", synonyms: [], hypernyms: ["animal", "mammal"] },
    { word: "giraffe", wikiTitle: "Giraffe", synonyms: [], hypernyms: ["animal", "mammal"] },
    { word: "butterfly", wikiTitle: "Butterfly", synonyms: [], hypernyms: ["animal", "insect", "bug"] },
    { word: "owl", wikiTitle: "Owl", synonyms: [], hypernyms: ["animal", "bird"] },
    { word: "peacock", wikiTitle: "Peafowl", synonyms: ["peafowl"], hypernyms: ["animal", "bird"] },
    { word: "octopus", wikiTitle: "Octopus", synonyms: [], hypernyms: ["animal", "sea creature", "mollusc"] },
    { word: "seahorse", wikiTitle: "Seahorse", synonyms: [], hypernyms: ["animal", "fish", "sea creature"] },
    { word: "ladybug", wikiTitle: "Coccinellidae", synonyms: ["ladybird", "lady beetle"], hypernyms: ["animal", "insect", "bug", "beetle"] },
    { word: "frog", wikiTitle: "Frog", synonyms: ["toad"], hypernyms: ["animal", "amphibian"] },
    { word: "zebra", wikiTitle: "Zebra", synonyms: [], hypernyms: ["animal", "mammal"] },
    { word: "jellyfish", wikiTitle: "Jellyfish", synonyms: [], hypernyms: ["animal", "sea creature"] },
    { word: "snail", wikiTitle: "Snail", synonyms: [], hypernyms: ["animal", "mollusc", "bug"] },
  ],
  "Food & Drink": [
    { word: "pineapple", wikiTitle: "Pineapple", synonyms: [], hypernyms: ["fruit", "food"] },
    { word: "strawberry", wikiTitle: "Strawberry", synonyms: [], hypernyms: ["fruit", "berry", "food"] },
    { word: "avocado", wikiTitle: "Avocado", synonyms: [], hypernyms: ["fruit", "food"] },
    { word: "pizza", wikiTitle: "Pizza", synonyms: [], hypernyms: ["food", "meal"] },
    { word: "banana", wikiTitle: "Banana", synonyms: [], hypernyms: ["fruit", "food"] },
    { word: "broccoli", wikiTitle: "Broccoli", synonyms: [], hypernyms: ["vegetable", "food"] },
    { word: "popcorn", wikiTitle: "Popcorn", synonyms: [], hypernyms: ["snack", "food"] },
    { word: "coffee", wikiTitle: "Coffee", synonyms: ["espresso"], hypernyms: ["drink", "beverage"] },
    { word: "cheese", wikiTitle: "Cheese", synonyms: [], hypernyms: ["food", "dairy"] },
    { word: "waffle", wikiTitle: "Waffle", synonyms: [], hypernyms: ["food", "breakfast"] },
    { word: "pomegranate", wikiTitle: "Pomegranate", synonyms: [], hypernyms: ["fruit", "food"] },
    { word: "cupcake", wikiTitle: "Cupcake", synonyms: ["muffin"], hypernyms: ["dessert", "cake", "food"] },
    { word: "donut", wikiTitle: "Doughnut", synonyms: ["doughnut"], hypernyms: ["dessert", "food"] },
    { word: "watermelon", wikiTitle: "Watermelon", synonyms: [], hypernyms: ["fruit", "melon", "food"] },
  ],
  "Nature & Plants": [
    { word: "fern", wikiTitle: "Fern", synonyms: [], hypernyms: ["plant", "leaf", "frond", "greenery"] },
    { word: "cactus", wikiTitle: "Cactus", synonyms: ["succulent"], hypernyms: ["plant"] },
    { word: "sunflower", wikiTitle: "Common sunflower", synonyms: [], hypernyms: ["flower", "plant"] },
    { word: "mushroom", wikiTitle: "Mushroom", synonyms: ["toadstool", "fungus"], hypernyms: ["fungus", "plant"] },
    { word: "pinecone", wikiTitle: "Conifer cone", synonyms: ["pine cone", "cone"], hypernyms: ["plant", "tree", "seed"] },
    { word: "coral", wikiTitle: "Coral", synonyms: [], hypernyms: ["sea", "reef", "ocean"] },
    { word: "moss", wikiTitle: "Moss", synonyms: [], hypernyms: ["plant", "greenery"] },
    { word: "dandelion", wikiTitle: "Taraxacum", synonyms: [], hypernyms: ["flower", "plant", "weed"] },
    { word: "seashell", wikiTitle: "Seashell", synonyms: ["shell", "sea shell"], hypernyms: ["beach", "sea", "ocean"] },
    { word: "maple leaf", wikiTitle: "Maple", synonyms: ["leaf"], hypernyms: ["plant", "tree", "foliage"] },
    { word: "rose", wikiTitle: "Rose", synonyms: [], hypernyms: ["flower", "plant"] },
    { word: "acorn", wikiTitle: "Acorn", synonyms: [], hypernyms: ["seed", "nut", "tree", "plant"] },
    { word: "waterfall", wikiTitle: "Waterfall", synonyms: [], hypernyms: ["water", "nature", "landscape"] },
  ],
  "Everyday Objects": [
    { word: "tin can", wikiTitle: "Tin can", synonyms: ["can", "canned food", "soup can"], hypernyms: ["container", "metal", "object"] },
    { word: "umbrella", wikiTitle: "Umbrella", synonyms: ["parasol"], hypernyms: ["object", "tool"] },
    { word: "key", wikiTitle: "Key (lock)", synonyms: [], hypernyms: ["object", "metal", "tool"] },
    { word: "zipper", wikiTitle: "Zipper", synonyms: ["zip"], hypernyms: ["fastener", "object"] },
    { word: "light bulb", wikiTitle: "Incandescent light bulb", synonyms: ["lightbulb", "bulb"], hypernyms: ["object", "light", "lamp"] },
    { word: "scissors", wikiTitle: "Scissors", synonyms: [], hypernyms: ["object", "tool"] },
    { word: "paperclip", wikiTitle: "Paper clip", synonyms: ["paper clip", "clip"], hypernyms: ["object", "metal", "stationery"] },
    { word: "toothbrush", wikiTitle: "Toothbrush", synonyms: [], hypernyms: ["object", "tool"] },
    { word: "headphones", wikiTitle: "Headphones", synonyms: ["earphones"], hypernyms: ["object", "electronics", "audio"] },
    { word: "wristwatch", wikiTitle: "Watch", synonyms: ["watch"], hypernyms: ["object", "clock", "timepiece"] },
    { word: "sponge", wikiTitle: "Sponge (tool)", synonyms: [], hypernyms: ["object", "cleaning"] },
    { word: "button", wikiTitle: "Button", synonyms: [], hypernyms: ["fastener", "object", "clothing"] },
    { word: "matchstick", wikiTitle: "Match", synonyms: ["match", "matches"], hypernyms: ["object", "fire"] },
    { word: "keyboard", wikiTitle: "Computer keyboard", synonyms: [], hypernyms: ["object", "electronics", "computer"] },
  ],
  "Vehicles": [
    { word: "bicycle", wikiTitle: "Bicycle", synonyms: ["bike"], hypernyms: ["vehicle", "transport"] },
    { word: "helicopter", wikiTitle: "Helicopter", synonyms: ["chopper"], hypernyms: ["vehicle", "aircraft", "transport"] },
    { word: "sailboat", wikiTitle: "Sailboat", synonyms: ["boat", "yacht"], hypernyms: ["vehicle", "boat", "transport"] },
    { word: "tractor", wikiTitle: "Tractor", synonyms: [], hypernyms: ["vehicle", "machine", "transport"] },
    { word: "train", wikiTitle: "Train", synonyms: ["locomotive"], hypernyms: ["vehicle", "transport"] },
    { word: "hot air balloon", wikiTitle: "Hot air balloon", synonyms: ["balloon"], hypernyms: ["vehicle", "aircraft", "transport"] },
    { word: "motorcycle", wikiTitle: "Motorcycle", synonyms: ["motorbike"], hypernyms: ["vehicle", "transport"] },
    { word: "airplane", wikiTitle: "Airplane", synonyms: ["aeroplane", "plane", "jet"], hypernyms: ["vehicle", "aircraft", "transport"] },
    { word: "submarine", wikiTitle: "Submarine", synonyms: ["sub"], hypernyms: ["vehicle", "boat", "transport"] },
    { word: "scooter", wikiTitle: "Scooter (motorcycle)", synonyms: [], hypernyms: ["vehicle", "transport"] },
    { word: "ambulance", wikiTitle: "Ambulance", synonyms: [], hypernyms: ["vehicle", "car", "transport"] },
    { word: "fire truck", wikiTitle: "Fire engine", synonyms: ["fire engine"], hypernyms: ["vehicle", "truck", "transport"] },
  ],
  "Textures & Materials": [
    { word: "brick", wikiTitle: "Brick", synonyms: ["bricks", "brickwork"], hypernyms: ["material", "wall", "texture"] },
    { word: "denim", wikiTitle: "Denim", synonyms: ["jeans", "jean"], hypernyms: ["fabric", "cloth", "material", "texture"] },
    { word: "honeycomb", wikiTitle: "Honeycomb", synonyms: [], hypernyms: ["pattern", "texture", "hexagon"] },
    { word: "bubble wrap", wikiTitle: "Bubble wrap", synonyms: [], hypernyms: ["plastic", "packaging", "texture"] },
    { word: "wood grain", wikiTitle: "Wood grain", synonyms: ["wood", "timber", "grain"], hypernyms: ["material", "texture"] },
    { word: "rust", wikiTitle: "Rust", synonyms: ["corrosion"], hypernyms: ["metal", "texture", "material"] },
    { word: "knitting", wikiTitle: "Knitting", synonyms: ["knit", "wool", "yarn"], hypernyms: ["fabric", "cloth", "texture"] },
    { word: "cork", wikiTitle: "Cork (material)", synonyms: [], hypernyms: ["material", "texture"] },
    { word: "marble", wikiTitle: "Marble", synonyms: [], hypernyms: ["stone", "rock", "material", "texture"] },
    { word: "sand", wikiTitle: "Sand", synonyms: [], hypernyms: ["material", "beach", "texture", "ground"] },
    { word: "leather", wikiTitle: "Leather", synonyms: ["hide"], hypernyms: ["material", "texture"] },
    { word: "gravel", wikiTitle: "Gravel", synonyms: ["pebbles", "stones"], hypernyms: ["material", "rock", "texture", "ground"] },
  ],
};

// Ordered list of pickable category names, plus a "Surprise Me" that spans all.
export const CATEGORY_NAMES = Object.keys(CATEGORIES);
export const SURPRISE = "Surprise Me";

const ALL_ITEMS = CATEGORY_NAMES.flatMap((name) =>
  CATEGORIES[name].map((it) => ({ ...it, category: name }))
);

// Return a random item from a category (or from everything for "Surprise Me").
// `exclude` is a Set of words already used this session to reduce repeats.
export function pickItem(category, exclude = new Set()) {
  let pool;
  if (category === SURPRISE || !CATEGORIES[category]) {
    pool = ALL_ITEMS;
  } else {
    pool = CATEGORIES[category].map((it) => ({ ...it, category }));
  }
  const fresh = pool.filter((it) => !exclude.has(it.word));
  const usePool = fresh.length ? fresh : pool;
  return usePool[Math.floor(Math.random() * usePool.length)];
}
