import { getDb } from './database.js';
import fs from 'fs';
import path from 'path';

fs.mkdirSync(path.join(__dirname, '../../data'), { recursive: true });

const db = getDb();

const assets = [
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'etf', description: 'SPDR S&P 500 ETF Trust', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'etf', description: 'Invesco QQQ Trust (Nasdaq-100)', currency: 'USD', exchange: 'Nasdaq' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', description: 'Apple – technologie grand public', currency: 'USD', exchange: 'Nasdaq' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', description: 'Tesla – véhicules électriques & énergie', currency: 'USD', exchange: 'Nasdaq' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', description: 'Microsoft – cloud & logiciels', currency: 'USD', exchange: 'Nasdaq' },
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', description: 'Bitcoin / Dollar', currency: 'USD', exchange: 'Crypto' },
  { symbol: '^FCHI', name: 'CAC 40', type: 'index', description: 'Indice boursier français', currency: 'EUR', exchange: 'Euronext' },
  { symbol: '^GDAXI', name: 'DAX 40', type: 'index', description: 'Indice boursier allemand', currency: 'EUR', exchange: 'XETRA' },
  { symbol: 'GLD', name: 'Gold ETF', type: 'etf', description: 'SPDR Gold Shares', currency: 'USD', exchange: 'NYSE' },
  { symbol: 'TLT', name: 'US 20Y Bond ETF', type: 'etf', description: 'iShares 20+ Year Treasury Bond ETF', currency: 'USD', exchange: 'Nasdaq' },
];

const insertAsset = db.prepare(`
  INSERT OR IGNORE INTO assets (symbol, name, type, description, currency, exchange)
  VALUES (@symbol, @name, @type, @description, @currency, @exchange)
`);

for (const a of assets) {
  insertAsset.run(a);
}

const sampleEvents = [
  {
    symbol: 'SPY',
    date: '2020-03-16',
    title: 'Pandémie COVID-19 – confinements mondiaux',
    description: 'L\'OMS déclare la pandémie. Les gouvernements ferment les frontières et imposent des confinements. L\'incertitude économique provoque une chute historique des marchés.',
    impact: 'bearish',
    source_url: 'https://www.who.int',
  },
  {
    symbol: 'SPY',
    date: '2021-01-27',
    title: 'Squeeze GameStop – volatilité extrême',
    description: 'Le short squeeze sur GME orchestré par r/WallStreetBets génère une volatilité record et des appels de marge massifs chez les hedge funds.',
    impact: 'neutral',
    source_url: null,
  },
  {
    symbol: 'SPY',
    date: '2022-02-24',
    title: 'Invasion de l\'Ukraine par la Russie',
    description: 'La Russie lance une invasion militaire de grande envergure en Ukraine. Les sanctions occidentales massives et la crise énergétique font chuter les marchés mondiaux.',
    impact: 'bearish',
    source_url: null,
  },
  {
    symbol: 'SPY',
    date: '2022-06-10',
    title: 'Inflation US à 8,6% – Fed hawkish',
    description: 'L\'inflation américaine atteint son plus haut depuis 40 ans. La Fed accélère le rythme des hausses de taux, déclenchant une correction majeure.',
    impact: 'bearish',
    source_url: null,
  },
  {
    symbol: 'AAPL',
    date: '2023-01-03',
    title: 'Avertissement sur les ventes iPhone en Chine',
    description: 'Les analystes réduisent leurs estimations de ventes d\'iPhone en raison du ralentissement économique chinois et de la concurrence de Huawei.',
    impact: 'bearish',
    source_url: null,
  },
  {
    symbol: 'TSLA',
    date: '2022-11-04',
    title: 'Musk vend des actions TSLA pour financer Twitter',
    description: 'Elon Musk finalise le rachat de Twitter à 44 Mds$ et vend massivement des actions Tesla pour financer l\'opération, faisant chuter le titre de plus de 50%.',
    impact: 'bearish',
    source_url: null,
  },
  {
    symbol: 'QQQ',
    date: '2023-11-30',
    title: 'OpenAI lance ChatGPT – début du boom IA',
    description: 'ChatGPT atteint 1 million d\'utilisateurs en 5 jours. L\'engouement pour l\'IA générative propulse les valeurs technologiques à la hausse.',
    impact: 'bullish',
    source_url: null,
  },
  {
    symbol: 'BTC-USD',
    date: '2024-01-10',
    title: 'Approbation des ETF Bitcoin Spot par la SEC',
    description: 'La SEC approuve les premiers ETF Bitcoin spot aux États-Unis (BlackRock, Fidelity…). Les entrées massives de capitaux font monter le Bitcoin vers de nouveaux sommets.',
    impact: 'bullish',
    source_url: null,
  },
];

const getAssetId = db.prepare('SELECT id FROM assets WHERE symbol = ?');
const insertEvent = db.prepare(`
  INSERT OR IGNORE INTO events (asset_id, date, title, description, impact, source_url)
  VALUES (@asset_id, @date, @title, @description, @impact, @source_url)
`);

for (const e of sampleEvents) {
  const row = getAssetId.get(e.symbol) as { id: number } | undefined;
  if (row) {
    insertEvent.run({ asset_id: row.id, date: e.date, title: e.title, description: e.description, impact: e.impact, source_url: e.source_url });
  }
}

console.log('Seed completed.');
