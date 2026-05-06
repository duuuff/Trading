import type { MarketEvent } from '../types'

export const marketEvents: MarketEvent[] = [
  {
    id: 'evt-001',
    date: '2020-02-24',
    shortLabel: 'COVID Panique',
    title: "COVID-19 : La pandémie s'emballe en Europe",
    category: 'health',
    impact: 'negative',
    severity: 3,
    affectedAssets: ['SPX', 'NDX', 'CAC', 'AAPL', 'TSLA', 'MSFT', 'MC', 'BTC'],
    variation: -34,
    isPremium: false,
    summary: `Le 24 février 2020, les marchés mondiaux entrent en panique alors que l'Italie déclare des centaines de cas de COVID-19 et que l'OMS avertit d'une pandémie imminente. L'indice S&P 500 perd 34% en seulement 33 jours de trading — la baisse la plus rapide depuis la Grande Dépression.

Mécanisme : Les investisseurs anticipent une contraction brutale de l'activité économique mondiale : fermetures d'usines, rupture des chaînes d'approvisionnement, effondrement de la consommation. Les secteurs aérien, hôtelier et énergétique sont les premiers touchés, mais aucun secteur n'est épargné. La volatilité (VIX) atteint 82 points, dépassant les records de 2008.

Conséquences : Les banques centrales et gouvernements répondent massivement (QE illimité, plans de relance). Les marchés touchent leur point bas le 23 mars 2020, puis entament une remontée spectaculaire portée par les valeurs technologiques bénéficiant du télétravail.`,
  },
  {
    id: 'evt-002',
    date: '2020-03-23',
    shortLabel: 'Fed QE Illimité',
    title: 'La Fed annonce un QE illimité + CARES Act',
    category: 'monetary',
    impact: 'positive',
    severity: 3,
    affectedAssets: ['SPX', 'NDX', 'CAC', 'AAPL', 'TSLA', 'MSFT', 'BTC'],
    variation: 70,
    isPremium: false,
    summary: `Le 23 mars 2020 marque le point bas du crash COVID. La Réserve Fédérale américaine annonce ce jour-là un programme de rachat d'actifs "illimité" (QE∞) : obligations d'État, obligations d'entreprises et MBS seront achetés sans plafond. Combiné au CARES Act de 2 200 milliards de dollars voté par le Congrès, ce signal est décisif.

Mécanisme : Le "Fed Put" — la conviction que la banque centrale interviendra toujours pour soutenir les marchés — est réaffirmé avec force. Les taux directeurs sont ramenés à zéro, rendant les actifs sans risque non attractifs et poussant les capitaux vers les actions. La liquidité injectée alimente une reprise record.

Conséquences : Le S&P 500 remonte de 70% en 5 mois. Les valeurs technologiques (Apple, Microsoft, Tesla, Amazon) dépassent leurs niveaux pré-COVID dès août 2020. Bitcoin profite également de la méfiance envers la valeur des monnaies fiduciaires.`,
  },
  {
    id: 'evt-003',
    date: '2020-11-09',
    shortLabel: 'Vaccin Pfizer',
    title: 'Pfizer annonce son vaccin efficace à 90%',
    category: 'health',
    impact: 'positive',
    severity: 2,
    affectedAssets: ['SPX', 'NDX', 'CAC', 'AAPL', 'MC'],
    variation: 12,
    isPremium: false,
    summary: `Le 9 novembre 2020, Pfizer et BioNTech annoncent que leur vaccin à ARNm est efficace à 90% contre le COVID-19, bien au-dessus du seuil de 50% fixé par la FDA. C'est la première preuve concrète qu'une sortie de crise sanitaire est possible.

Mécanisme : La rotation sectorielle est immédiate et violente : les valeurs cycliques (banques, énergie, voyages, luxe) bondissent tandis que les valeurs de confinement (Zoom, Peloton) s'effondrent. Les marchés anticipent la réouverture économique mondiale dès le premier semestre 2021.

Conséquences : Le S&P 500 gagne +12% en novembre 2020. Le CAC 40, plus exposé aux cycliques, surperforme avec +20%. LVMH rebondit fortement. À l'inverse, le secteur tech recule temporairement avant de reprendre sa progression.`,
  },
  {
    id: 'evt-004',
    date: '2021-11-30',
    shortLabel: 'Variant Omicron',
    title: 'Découverte du variant Omicron',
    category: 'health',
    impact: 'negative',
    severity: 2,
    affectedAssets: ['SPX', 'NDX', 'CAC', 'MC', 'XLE'],
    variation: -5,
    isPremium: true,
    summary: `Le 26 novembre 2021 (vendredi post-Thanksgiving), l'OMS classe le variant B.1.1.529 comme "préoccupant" et lui donne le nom Omicron. Les marchés mondiaux réagissent fortement le lundi 29 novembre à leur réouverture.

Mécanisme : La crainte d'un nouveau cycle de confinements et d'une perte d'efficacité des vaccins existants pousse à nouveau les ventes sur les cycliques. Le pétrole chute de 12% en une séance — sa plus forte baisse depuis avril 2020. Les valeurs de voyage, hôtellerie et luxe subissent des corrections de 5 à 10%.

Conséquences : L'inquiétude se dissipe rapidement en décembre quand les données montrent qu'Omicron, si plus contagieux, est moins sévère. Les marchés récupèrent leurs pertes en quelques semaines. Cet épisode illustre la forte sensibilité des marchés aux nouvelles sanitaires post-COVID.`,
  },
  {
    id: 'evt-005',
    date: '2022-02-24',
    shortLabel: 'Invasion Ukraine',
    title: "La Russie envahit l'Ukraine",
    category: 'geopolitical',
    impact: 'negative',
    severity: 3,
    affectedAssets: ['SPX', 'NDX', 'CAC', 'MC', 'GLD', 'XLE'],
    variation: -8,
    isPremium: false,
    summary: `Dans la nuit du 23 au 24 février 2022, la Russie lance une invasion à grande échelle de l'Ukraine. C'est le premier conflit armé majeur en Europe depuis la guerre de Yougoslavie. Les marchés mondiaux ouvrent en forte baisse.

Mécanisme : Le choc est multiple : 1/ Crise énergétique — la Russie est le premier fournisseur de gaz de l'Europe, les prix du gaz naturel bondissent de 50%. 2/ Crise alimentaire — Ukraine et Russie représentent 30% du blé mondial. 3/ Sanctions économiques massives perturbent les échanges mondiaux. 4/ L'incertitude géopolitique maximale pousse les investisseurs vers les valeurs refuges (or, dollar, bons du Trésor US).

Conséquences : Le CAC 40, très exposé à la Russie (Renault, Total, Société Générale), perd 8% en 2 jours. À l'inverse, l'ETF énergie (XLE) et l'or (GLD) progressent fortement. Ce conflit accélère la poussée inflationniste déjà en cours, forçant les banques centrales à durcir leur politique monétaire plus vite.`,
  },
  {
    id: 'evt-006',
    date: '2022-03-16',
    shortLabel: 'Premier Hausse Fed',
    title: 'La Fed relève ses taux pour la première fois depuis 2018',
    category: 'monetary',
    impact: 'negative',
    severity: 3,
    affectedAssets: ['SPX', 'NDX', 'AAPL', 'TSLA', 'MSFT', 'BTC'],
    variation: -25,
    isPremium: false,
    summary: `Le 16 mars 2022, la Réserve Fédérale relève ses taux directeurs de 25 points de base, inaugurant le cycle de resserrement monétaire le plus rapide depuis les années 1980. Avec une inflation à 8,5% (son plus haut depuis 40 ans), la Fed n'a d'autre choix que d'agir.

Mécanisme : La hausse des taux affecte les marchés via deux canaux principaux : 1/ La "compression des multiples" — quand les taux sans risque montent, les valorisations des actions (surtout growth/tech) baissent mécaniquement via le modèle DCF. 2/ Le "resserrement du crédit" — les conditions de financement se durcissent, pesant sur la croissance économique et les bénéfices des entreprises.

Conséquences : Entre janvier et octobre 2022, le NASDAQ perd 35%, le S&P 500 perd 25%. Tesla perd 65%, Bitcoin perd 75%. Les valeurs de croissance à haute valorisation sont les plus touchées. Ce cycle culminera avec 11 hausses de taux et un taux directeur porté à 5,50% en juillet 2023.`,
  },
  {
    id: 'evt-007',
    date: '2022-09-21',
    shortLabel: 'Fed +75pb (x3)',
    title: '3ème hausse consécutive de 75pb de la Fed',
    category: 'monetary',
    impact: 'negative',
    severity: 2,
    affectedAssets: ['SPX', 'NDX', 'BTC', 'TSLA', 'MSFT'],
    variation: -5,
    isPremium: true,
    summary: `Le 21 septembre 2022, la Fed relève ses taux de 75 points de base pour la 3ème fois consécutive — une cadence inédite depuis 1994. Le président Jerome Powell prononce un discours très hawkish : "Réduire l'inflation est la priorité absolue, même si cela provoque une douleur économique".

Mécanisme : Le signal est clair — la Fed est prête à induire une récession pour vaincre l'inflation. Le Dollar Index (DXY) atteint un plus haut de 20 ans à 114 points. Les marchés obligataires s'effondrent (le taux 10 ans US monte à 4%), créant une concurrence sérieuse pour les actions.

Conséquences : Le S&P 500 atteint son plus bas annuel le 13 octobre à 3 577 points. Bitcoin touche ses points bas de cycle autour de 15 500$ en novembre lors du krach FTX. La correction totale depuis les sommets de 2021 dépasse 25% pour le S&P 500 et 75% pour Bitcoin.`,
  },
  {
    id: 'evt-008',
    date: '2022-11-08',
    shortLabel: 'Krach FTX',
    title: 'Effondrement de FTX — 2ème exchange crypto mondial',
    category: 'corporate',
    impact: 'negative',
    severity: 3,
    affectedAssets: ['BTC'],
    variation: -25,
    isPremium: true,
    summary: `Le 8 novembre 2022, CoinDesk publie un article révélant que la majorité des actifs d'Alameda Research (le hedge fund de Sam Bankman-Fried) sont constituées de FTT, le token natif de FTX. Binance annonce la vente de ses FTT, déclenchant un bank run massif.

Mécanisme : FTX, le 2ème exchange mondial de cryptos, s'avère avoir utilisé les fonds de ses clients pour financer Alameda Research. Le trou est estimé à 8 milliards de dollars. FTX se place sous protection de la loi sur les faillites en 48 heures. C'est le plus grand scandale de l'histoire des cryptomonnaies.

Conséquences : Bitcoin plonge de 25% en une semaine, passant sous 15 500$. Des dizaines de projets crypto liés à FTX s'effondrent. La confiance dans l'écosystème crypto est sévèrement ébranlée. Paradoxalement, cet événement donnera un élan aux demandes d'ETF Bitcoin, qui aboutiront en janvier 2024.`,
  },
  {
    id: 'evt-009',
    date: '2023-03-10',
    shortLabel: 'Chute SVB',
    title: 'Silicon Valley Bank fait faillite en 48h',
    category: 'corporate',
    impact: 'negative',
    severity: 2,
    affectedAssets: ['SPX', 'NDX', 'BTC', 'AAPL', 'MSFT'],
    variation: -3,
    isPremium: false,
    summary: `Le 10 mars 2023, la Silicon Valley Bank (SVB) est placée sous tutelle de la FDIC, devenant la 2ème plus grande faillite bancaire de l'histoire américaine. Spécialisée dans le financement des startups, SVB avait massivement investi en bons du Trésor à long terme — dont la valeur a chuté avec la hausse des taux.

Mécanisme : Quand SVB annonce une perte de 1,8 milliard sur ses obligations et la nécessité de lever des fonds, un bank run numérique s'enclenche. En 48h, 42 milliards de dollars sont retirés. Le risque systémique est réel : des centaines de startups y avaient leur compte.

Conséquences : La crise est contenue rapidement — la FDIC garantit tous les dépôts. La Fed crée un mécanisme d'urgence (BTFP). Les marchés se stabilisent en quelques jours. Bitcoin, interprété comme une couverture contre le risque bancaire traditionnel, rebondit de 20% dans les semaines qui suivent.`,
  },
  {
    id: 'evt-010',
    date: '2023-11-14',
    shortLabel: 'Inflation Recule',
    title: "Inflation US à 3,2% — pivot de la Fed en vue",
    category: 'economic',
    impact: 'positive',
    severity: 3,
    affectedAssets: ['SPX', 'NDX', 'AAPL', 'TSLA', 'MSFT', 'BTC'],
    variation: 18,
    isPremium: false,
    summary: `Le 14 novembre 2023, le Bureau of Labor Statistics publie un CPI de 3,2% en glissement annuel pour octobre 2023 — en dessous des 3,3% attendus. C'est le signal le plus fort que l'inflation est durablement sous contrôle.

Mécanisme : Les marchés interprètent cette donnée comme la confirmation que la Fed a atteint son pic de taux et commencera à les baisser en 2024. Cette anticipation de "pivot" recrée immédiatement l'appétit pour le risque : les actions de croissance (tech, IA) rebondissent violemment. Les taux obligataires chutent.

Conséquences : Le S&P 500 gagne +5% sur la seule journée du 14 novembre, son meilleur jour en 2023. Le NASDAQ bondit de +8% en une semaine. Bitcoin dépasse les 37 000$. Le rallye s'amplifie en décembre 2023 et se poursuit tout au long de 2024 avec trois baisses de taux de la Fed.`,
  },
  {
    id: 'evt-011',
    date: '2024-01-11',
    shortLabel: 'ETF Bitcoin',
    title: 'La SEC approuve les ETF Bitcoin spot',
    category: 'tech',
    impact: 'positive',
    severity: 2,
    affectedAssets: ['BTC'],
    variation: 15,
    isPremium: true,
    summary: `Le 11 janvier 2024, la SEC approuve simultanément 11 ETF Bitcoin spot, dont ceux de BlackRock (iShares), Fidelity et Invesco. C'est l'aboutissement de dix ans de demandes répétées et rejetées par le régulateur.

Mécanisme : Un ETF Bitcoin spot permet aux investisseurs institutionnels (fonds de pension, assureurs, gestionnaires de patrimoine) d'accéder à Bitcoin via leur infrastructure boursière classique, sans avoir besoin de wallets ou d'exchanges crypto. Cela ouvre potentiellement plusieurs milliers de milliards de dollars de capitaux.

Conséquences : Paradoxalement, Bitcoin baisse légèrement dans les jours suivant l'approbation ("vendre la news") avant de reprendre sa progression. Les ETF accumulent des milliards de dollars en quelques semaines. En mars 2024, Bitcoin atteint un nouveau record historique à 73 000$, surpassant son précédent ATH de novembre 2021.`,
  },
  {
    id: 'evt-012',
    date: '2024-03-14',
    shortLabel: 'BTC ATH',
    title: 'Bitcoin : nouveau record historique à 73 000$',
    category: 'tech',
    impact: 'positive',
    severity: 2,
    affectedAssets: ['BTC'],
    variation: 20,
    isPremium: true,
    summary: `Le 14 mars 2024, Bitcoin atteint un nouveau record absolu à 73 098$, dépassant son précédent sommet de novembre 2021 (69 000$). Ce mouvement intervient deux mois après l'approbation des ETF spot et à trois semaines du halving d'avril 2024.

Mécanisme : Trois catalyseurs convergent : 1/ Demande institutionnelle via les ETF (BlackRock iShares absorbe 10 milliards en 7 semaines). 2/ Anticipation du halving Bitcoin (réduction de moitié de la récompense des mineurs, historiquement haussier). 3/ Contexte macro favorable avec les baisses de taux attendues de la Fed.

Conséquences : L'ensemble du marché crypto suit Bitcoin à la hausse. Ethereum gagne 60% dans les semaines suivantes. La capitalisation totale du marché crypto dépasse 2 500 milliards de dollars. Mais après le halving d'avril, les marchés consolident avant de reprendre avec l'élection de Trump.`,
  },
  {
    id: 'evt-013',
    date: '2020-04-21',
    shortLabel: 'Petrole Negatif',
    title: "Le pétrole WTI passe à -37$ — première fois dans l'histoire",
    category: 'economic',
    impact: 'negative',
    severity: 3,
    affectedAssets: ['XLE'],
    variation: -50,
    isPremium: true,
    summary: `Le 20 avril 2020, le contrat à terme sur le pétrole brut WTI (livraison mai 2020) clôture à -37,63$ le baril — du jamais vu dans l'histoire des marchés. Le prix est littéralement négatif : les producteurs paient pour qu'on leur retire leur pétrole.

Mécanisme : La conjonction est parfaite : la demande mondiale s'est effondrée de 30% avec les confinements (avions cloués au sol, voitures garées). Simultanément, la guerre des prix entre Russie et Arabie Saoudite a provoqué une surproduction. Les capacités de stockage américaines (Cushing, Oklahoma) sont saturées à 95%. Les traders ne peuvent pas prendre livraison.

Conséquences : L'ETF XLE (énergie) avait déjà perdu 50% depuis janvier 2020. Cet événement exceptionnel pousse de nombreux producteurs à l'arrêt. Il faudra attendre 2022 et la guerre en Ukraine pour que le secteur énergétique retrouve ses niveaux pré-COVID et les dépasse.`,
  },
  {
    id: 'evt-014',
    date: '2021-09-20',
    shortLabel: 'Evergrande',
    title: "Evergrande menace de défaut — onde de choc mondiale",
    category: 'corporate',
    impact: 'negative',
    severity: 2,
    affectedAssets: ['SPX', 'CAC', 'MC'],
    variation: -5,
    isPremium: true,
    summary: `Le 20 septembre 2021, les marchés mondiaux ouvrent en forte baisse à cause d'Evergrande, le 2ème promoteur immobilier chinois, qui menace de faire défaut sur 300 milliards de dollars de dettes. Certains médias parlent d'un "Lehman Brothers chinois".

Mécanisme : L'immobilier représente 25 à 30% du PIB chinois. Une faillite désordonnée d'Evergrande pourrait déclencher une crise financière systémique en Chine, avec des répercussions sur la croissance mondiale. Les marchés vendent en premier et posent des questions ensuite.

Conséquences : La baisse est sévère mais courte — les autorités chinoises interviennent pour gérer le défaut de façon ordonnée. Les marchés récupèrent en quelques jours. Le vrai impact s'étale sur plusieurs années : l'immobilier chinois entre dans une crise durable qui continue à peser sur la croissance mondiale.`,
  },
  {
    id: 'evt-015',
    date: '2024-11-06',
    shortLabel: 'Trump Elu',
    title: "Donald Trump élu 47ème président des États-Unis",
    category: 'political',
    impact: 'positive',
    severity: 3,
    affectedAssets: ['SPX', 'NDX', 'BTC', 'TSLA', 'XLE'],
    variation: 5,
    isPremium: false,
    summary: `Le 6 novembre 2024, Donald Trump remporte l'élection présidentielle américaine face à Kamala Harris avec une victoire claire dans les États pivots. Les marchés, qui redoutaient une nuit d'incertitude, réagissent positivement dès l'ouverture.

Mécanisme : Les marchés anticipent un programme pro-business : 1/ Réductions d'impôts sur les entreprises (passage de 21% à 15% promis). 2/ Dérèglementation, notamment dans la finance et l'énergie fossile. 3/ Droits de douane (inflation potentielle mais positif pour certains secteurs domestiques). Tesla (Elon Musk soutient Trump) et Bitcoin (Trump favorable aux cryptos) enregistrent les plus fortes hausses.

Conséquences : Le S&P 500 gagne +3% le 6 novembre et +5% dans la semaine. Bitcoin passe de 68 000$ à 93 000$ en moins d'un mois. Tesla double en 3 mois. En revanche, les énergies renouvelables et les marchés émergents corrigent. La menace de droits de douane pèse sur l'Europe et les marchés asiatiques début 2025.`,
  },
]
