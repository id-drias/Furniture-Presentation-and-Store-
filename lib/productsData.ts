import type { Category, MaterialSpec, Product } from "./types";

/* ------------------------------------------------------------------ *
 * Aetheria Atelier — the single source of truth for the collection.
 *
 * Everything the storefront and both API routes render is derived from
 * this module. Photography is hot-linked from the Unsplash CDN; `img()`
 * normalises crop + quality so every plate in the grid shares one look.
 *
 * Array order is *bento order*, not catalogue order — the `tile`
 * footprints are sequenced so the unfiltered grid closes every row of
 * the six-column layout exactly:
 *
 *   6 · (3+3) · (2+2+2) · (3+3) · (2+2+2) · (3+3)
 *
 * Ids stay stable (ae-01…ae-13) so carts and orders survive a reshuffle.
 * ------------------------------------------------------------------ */

/** Build a consistently-cropped Unsplash URL. */
const img = (id: string, w = 1600): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* --------------------------- material library --------------------------- */
/* Reused across pieces so a "walnut" chip means the same thing everywhere. */

const M = {
  boucle: {
    name: { en: "Undyed bouclé", fr: "Bouclé écru" },
    detail: {
      en: "Virgin wool looped on a Belgian shuttle loom. 42 metres per seat.",
      fr: "Laine vierge bouclée sur métier à navette belge. 42 mètres par assise.",
    },
    swatch: "#EDE7DB",
    macro: img("photo-1768946131690-247c5319f0d8", 900),
  },
  ash: {
    name: { en: "Kiln-dried ash", fr: "Frêne séché au four" },
    detail: {
      en: "Slow-dried for eleven weeks, then hand-shaped to a 4 mm radius.",
      fr: "Séché lentement onze semaines, puis façonné à la main au rayon de 4 mm.",
    },
    swatch: "#C9AE86",
    macro: img("photo-1564512533667-015a90133f04", 900),
  },
  walnut: {
    name: { en: "Black walnut", fr: "Noyer noir" },
    detail: {
      en: "Single-log matched veneer, book-opened across every door.",
      fr: "Placage tiré d'une seule bille, ouvert en livre sur chaque porte.",
    },
    swatch: "#5B4230",
    macro: img("photo-1583418007992-a8e33a92e7ad", 900),
  },
  oak: {
    name: { en: "Fumed European oak", fr: "Chêne européen fumé" },
    detail: {
      en: "Ammonia-fumed over nine days; the grain darkens from within.",
      fr: "Fumé à l'ammoniac durant neuf jours ; le grain fonce de l'intérieur.",
    },
    swatch: "#8A6B4A",
    macro: img("photo-1632199495802-18f7d21f323b", 900),
  },
  travertine: {
    name: { en: "Roman travertine", fr: "Travertin romain" },
    detail: {
      en: "Quarried at Tivoli, vein-cut and left unfilled to keep its breath.",
      fr: "Extrait à Tivoli, coupé dans la veine et laissé ouvert pour qu'il respire.",
    },
    swatch: "#D8CDBB",
    macro: img("photo-1525468568166-6f2cd17c7ec9", 900),
  },
  limestone: {
    name: { en: "Honed limestone", fr: "Calcaire adouci" },
    detail: {
      en: "Diamond-honed to 400 grit — matte, cool, faintly chalky underhand.",
      fr: "Adouci au diamant grain 400 — mat, frais, légèrement crayeux au toucher.",
    },
    swatch: "#CFC8BC",
    macro: img("photo-1606208594041-3dfd470247ce", 900),
  },
  leather: {
    name: { en: "Tuscan aniline leather", fr: "Cuir aniline de Toscane" },
    detail: {
      en: "Vegetable-tanned in Ponte a Egola. It will darken where you sit.",
      fr: "Tanné végétal à Ponte a Egola. Il fonce là où l'on s'assoit.",
    },
    swatch: "#8B5E3C",
    macro: img("photo-1567016376408-0226e4d0c1ea", 900),
  },
  brass: {
    name: { en: "Brushed brass", fr: "Laiton brossé" },
    detail: {
      en: "Hand-linished in one direction, then lacquered to hold the bloom.",
      fr: "Satiné à la main dans un seul sens, puis laqué pour figer la patine.",
    },
    swatch: "#C2A87C",
    macro: img("photo-1540408478354-3c7393dfbd0d", 900),
  },
  alabaster: {
    name: { en: "Alabaster diffuser", fr: "Diffuseur d'albâtre" },
    detail: {
      en: "Turned to 6 mm — thin enough that the stone itself becomes the light.",
      fr: "Tourné à 6 mm — assez fin pour que la pierre devienne la lumière.",
    },
    swatch: "#F3EFE7",
    macro: img("photo-1726987242665-d0a7d2268ea0", 900),
  },
  stoneware: {
    name: { en: "Grogged stoneware", fr: "Grès chamotté" },
    detail: {
      en: "Wheel-thrown, twice-fired to 1,280 °C. No two shoulders match.",
      fr: "Tourné, cuit deux fois à 1 280 °C. Aucune épaule n'est identique.",
    },
    swatch: "#E4DED4",
    macro: img("photo-1542732056-648731297c97", 900),
  },
  down: {
    name: { en: "Goose-down wrap", fr: "Enveloppe de duvet d'oie" },
    detail: {
      en: "90/10 down over a graded foam core. Plumped, never flattened.",
      fr: "90/10 sur âme de mousse à densité graduée. Regonflé, jamais tassé.",
    },
    swatch: "#F6F3EE",
    macro: img("photo-1686510347470-0e36eb055a30", 900),
  },
} satisfies Record<string, MaterialSpec>;

/* ------------------------------- catalogue ------------------------------- */

export const products: Product[] = [
  /* ---------- row 1 · 6 ---------- */
  {
    id: "ae-01",
    slug: "lumiere-sofa",
    name: "Lumière",
    collection: "Sculpted Series",
    category: "seating",
    price: 12400,
    tagline: {
      en: "A three-seat sofa that reads as one continuous gesture.",
      fr: "Un canapé trois places qui se lit comme un seul geste continu.",
    },
    story: {
      en: "The Lumière began as a single charcoal line drawn across a studio wall in Milan. Its shell is bent as one piece — no visible seam runs the length of the back — and the bouclé is cut on the bias so the loops catch light the way raw plaster does at six in the evening.",
      fr: "Le Lumière est né d'un unique trait de fusain tracé sur un mur d'atelier à Milan. Sa coque est cintrée d'une seule pièce — aucune couture apparente ne parcourt le dossier — et le bouclé est coupé en biais afin que les boucles accrochent la lumière comme le plâtre brut à six heures du soir.",
    },
    dimensions: { w: 244, d: 96, h: 74, seat: 42 },
    materials: [M.boucle, M.ash, M.down],
    leadTime: { en: "12–14 weeks", fr: "12–14 semaines" },
    stock: 4,
    edition: "Edition of 60",
    image: img("photo-1684165610413-2401399e0e59", 2000),
    gallery: [
      img("photo-1768946131690-247c5319f0d8"),
      img("photo-1599696848652-f0ff23bc911f"),
    ],
    tile: "full",
  },

  /* ---------- row 2 · 3 + 3 ---------- */
  {
    id: "ae-02",
    slug: "halcyon-lounge-chair",
    name: "Halcyon",
    collection: "Sculpted Series",
    category: "seating",
    price: 6900,
    tagline: {
      en: "Aniline leather over a steam-bent frame, softened by use.",
      fr: "Cuir aniline sur piètement cintré à la vapeur, adouci par l'usage.",
    },
    story: {
      en: "Every Halcyon leaves the atelier slightly too firm. That is deliberate. The hide is finished with nothing but wax, so the first hundred evenings belong to whoever sits in it — the shoulders slacken, the seat deepens, the colour moves toward amber.",
      fr: "Chaque Halcyon quitte l'atelier légèrement trop ferme. C'est délibéré. La peau n'est finie qu'à la cire : les cent premières soirées appartiennent donc à celui qui s'y assoit — les épaules se détendent, l'assise se creuse, la couleur vire à l'ambre.",
    },
    dimensions: { w: 78, d: 86, h: 71, seat: 40 },
    materials: [M.leather, M.oak, M.brass],
    leadTime: { en: "9–11 weeks", fr: "9–11 semaines" },
    stock: 7,
    image: img("photo-1579656381229-15bdb188da49"),
    gallery: [
      img("photo-1551231581-684f5c285fc0"),
      img("photo-1643717714693-9fc8cfcf46b3"),
    ],
    tile: "wide",
  },
  {
    id: "ae-04",
    slug: "verso-curved-sofa",
    name: "Verso",
    collection: "Sculpted Series",
    category: "seating",
    price: 14800,
    tagline: {
      en: "A serpentine four-seat, built to be walked around.",
      fr: "Un quatre places serpentin, conçu pour être contourné.",
    },
    story: {
      en: "Verso has no back — or rather, it has nothing but back. The curve inverts halfway along its length so the piece reads differently from either side of a room, which is why the atelier ships it with a plan drawing rather than a photograph.",
      fr: "Le Verso n'a pas de dos — ou plutôt, il n'est que dos. La courbe s'inverse à mi-longueur, si bien que la pièce se lit différemment de chaque côté d'une pièce ; c'est pourquoi l'atelier la livre avec un plan plutôt qu'une photographie.",
    },
    dimensions: { w: 312, d: 104, h: 72, seat: 41 },
    materials: [M.boucle, M.ash, M.down],
    leadTime: { en: "14–16 weeks", fr: "14–16 semaines" },
    stock: 2,
    edition: "Edition of 24",
    image: img("photo-1768946131536-39b5f3ec329d"),
    gallery: [
      img("photo-1694721025063-08eff99ba558"),
      img("photo-1567016376408-0226e4d0c1ea"),
    ],
    tile: "wide",
  },

  /* ---------- row 3 · 2 + 2 + 2 ---------- */
  {
    id: "ae-03",
    slug: "sable-armchair",
    name: "Sable",
    collection: "Quiet Objects",
    category: "seating",
    price: 5200,
    tagline: {
      en: "A low armchair with a spine of blackened steel.",
      fr: "Un fauteuil bas à colonne d'acier noirci.",
    },
    story: {
      en: "Sable hides its engineering. The blackened steel spine carries the entire load, which lets the bouclé shell stay only 34 millimetres thick — thin enough to look improbable from across a room, solid enough to outlive the room itself.",
      fr: "Le Sable dissimule son ingénierie. La colonne d'acier noirci reprend toute la charge, ce qui permet à la coque de bouclé de ne faire que 34 millimètres — assez fine pour paraître improbable d'un bout à l'autre d'une pièce, assez solide pour lui survivre.",
    },
    dimensions: { w: 72, d: 79, h: 68, seat: 38 },
    materials: [M.boucle, M.down],
    leadTime: { en: "8–10 weeks", fr: "8–10 semaines" },
    stock: 11,
    image: img("photo-1762803841369-103e283ad7d2"),
    gallery: [
      img("photo-1686510347470-0e36eb055a30"),
      img("photo-1710000937447-d0157bb2ce8e"),
    ],
    tile: "std",
  },
  {
    id: "ae-07",
    slug: "pierre-side-table",
    name: "Pierre",
    collection: "Quiet Objects",
    category: "tables",
    price: 2450,
    tagline: {
      en: "A turned column in solid ash. Sized for one glass and one book.",
      fr: "Une colonne tournée en frêne massif. Dimensionnée pour un verre et un livre.",
    },
    story: {
      en: "Pierre is the smallest thing the atelier makes and the one we argue about most. The top is 38 centimetres across — deliberately too small for a laptop, exactly right for a glass, a book, and the reading lamp you were going to put somewhere else.",
      fr: "Le Pierre est la plus petite pièce de l'atelier et celle qui suscite le plus de débats. Le plateau fait 38 centimètres — délibérément trop petit pour un ordinateur, exactement juste pour un verre, un livre et la lampe de lecture que vous comptiez poser ailleurs.",
    },
    dimensions: { w: 38, d: 38, h: 52 },
    materials: [M.ash, M.oak],
    leadTime: { en: "6–8 weeks", fr: "6–8 semaines" },
    stock: 18,
    image: img("photo-1543936177-12e24c26776a"),
    gallery: [
      img("photo-1698770531036-c627d35188f2"),
      img("photo-1571205086863-9d186c5cb8fb"),
    ],
    tile: "std",
  },
  {
    id: "ae-13",
    slug: "cassini-vessel",
    name: "Cassini",
    collection: "Quiet Objects",
    category: "decor",
    price: 680,
    tagline: {
      en: "Wheel-thrown stoneware. No two shoulders are alike.",
      fr: "Grès tourné. Aucune épaule n'est identique.",
    },
    story: {
      en: "Thrown wet, dried slowly, fired twice. The atelier rejects roughly one in three for a shoulder that fell a degree off vertical — a tolerance that matters to nobody except the person who made it, which is rather the point.",
      fr: "Tourné humide, séché lentement, cuit deux fois. L'atelier en écarte environ un sur trois pour une épaule tombée d'un degré — une tolérance qui n'importe qu'à celui qui l'a façonné, ce qui est précisément l'idée.",
    },
    dimensions: { w: 26, d: 26, h: 41 },
    materials: [M.stoneware],
    leadTime: { en: "In stock", fr: "En stock" },
    stock: 24,
    image: img("photo-1572853566597-b83cde546912"),
    gallery: [
      img("photo-1613424777445-f93a2a48e285"),
      img("photo-1687191883721-257d8cad5b54"),
    ],
    tile: "std",
  },

  /* ---------- row 4 · 3 + 3 ---------- */
  {
    id: "ae-05",
    slug: "monolith-travertine-table",
    name: "Monolith",
    collection: "Stone Work",
    category: "tables",
    price: 8600,
    tagline: {
      en: "One block of Roman travertine, cut twice and never filled.",
      fr: "Un bloc de travertin romain, coupé deux fois et jamais rebouché.",
    },
    story: {
      en: "Most travertine sold as furniture has been filled with resin to hide its pores. Ours has not. The stone arrives from Tivoli with its voids intact, and the top is vein-cut so the strata run edge to edge rather than swirling — a quieter, older-looking cut that takes twice the material to yield.",
      fr: "La plupart des travertins vendus en mobilier sont rebouchés à la résine pour masquer leurs pores. Pas le nôtre. La pierre arrive de Tivoli avec ses vides intacts, et le plateau est coupé dans la veine afin que les strates courent d'un bord à l'autre plutôt que de tourbillonner — une coupe plus calme, plus ancienne, qui exige deux fois plus de matière.",
    },
    dimensions: { w: 180, d: 92, h: 34 },
    materials: [M.travertine, M.limestone],
    leadTime: { en: "10–12 weeks", fr: "10–12 semaines" },
    stock: 5,
    image: img("photo-1759050427122-eaeb5885eaf7"),
    gallery: [
      img("photo-1525468568166-6f2cd17c7ec9"),
      img("photo-1606208594041-3dfd470247ce"),
    ],
    tile: "wide",
  },
  {
    id: "ae-06",
    slug: "ansel-dining-table",
    name: "Ansel",
    collection: "Stone Work",
    category: "tables",
    price: 11200,
    tagline: {
      en: "Fumed oak on a four-metre span with no centre leg.",
      fr: "Chêne fumé sur quatre mètres de portée, sans pied central.",
    },
    story: {
      en: "The span is the whole argument. A concealed steel spine lets the Ansel run four metres without a centre leg, so ten people sit without negotiating. The oak is ammonia-fumed rather than stained — the tannins darken from the inside, which means a scratch reveals more oak, not raw wood.",
      fr: "La portée est tout l'argument. Une âme d'acier dissimulée permet à l'Ansel de franchir quatre mètres sans pied central : dix convives s'assoient sans négocier. Le chêne est fumé à l'ammoniac plutôt que teinté — les tanins foncent de l'intérieur, si bien qu'une rayure révèle davantage de chêne, non du bois nu.",
    },
    dimensions: { w: 400, d: 110, h: 74 },
    materials: [M.oak, M.brass],
    leadTime: { en: "12–15 weeks", fr: "12–15 semaines" },
    stock: 3,
    image: img("photo-1581970696275-253e75ecf269"),
    gallery: [
      img("photo-1610177567940-cad90e9fb85e"),
      img("photo-1583418007992-a8e33a92e7ad"),
    ],
    tile: "wide",
  },

  /* ---------- row 5 · 2 + 2 + 2 ---------- */
  {
    id: "ae-08",
    slug: "aurum-floor-lamp",
    name: "Aurum",
    collection: "Light Studies",
    category: "lighting",
    price: 4300,
    tagline: {
      en: "Brushed brass geometry with a hand-turned alabaster shade.",
      fr: "Géométrie de laiton brossé, abat-jour d'albâtre tourné à la main.",
    },
    story: {
      en: "Aurum throws almost no light downward. The alabaster is turned to six millimetres and lit from within, so the stone itself glows and the room fills by reflection — the difference between a lamp you look at and a lamp you see by.",
      fr: "L'Aurum ne projette presque aucune lumière vers le bas. L'albâtre est tourné à six millimètres et éclairé de l'intérieur : la pierre elle-même s'illumine et la pièce se remplit par réflexion — toute la différence entre une lampe que l'on regarde et une lampe qui fait voir.",
    },
    dimensions: { w: 46, d: 46, h: 168 },
    materials: [M.brass, M.alabaster],
    leadTime: { en: "8–10 weeks", fr: "8–10 semaines" },
    stock: 9,
    image: img("photo-1765181539706-361512106019"),
    gallery: [
      img("photo-1540408478354-3c7393dfbd0d"),
      img("photo-1699549971117-5337d3ba252f"),
    ],
    tile: "std",
  },
  {
    id: "ae-09",
    slug: "solene-pendant",
    name: "Solène",
    collection: "Light Studies",
    category: "lighting",
    price: 3150,
    tagline: {
      en: "A spun brass hemisphere, weighted to hang dead level.",
      fr: "Un hémisphère de laiton repoussé, lesté pour pendre parfaitement d'aplomb.",
    },
    story: {
      en: "Spun over a wooden former by a workshop in Birmingham that has done nothing else since 1911. The rim is rolled by hand — run a finger under it and you will find the single join, which is the only evidence that it was not poured.",
      fr: "Repoussé sur forme de bois par un atelier de Birmingham qui ne fait rien d'autre depuis 1911. Le bord est roulé à la main — passez-y un doigt et vous trouverez l'unique jonction, seule preuve qu'il n'a pas été coulé.",
    },
    dimensions: { w: 62, d: 62, h: 28 },
    materials: [M.brass],
    leadTime: { en: "7–9 weeks", fr: "7–9 semaines" },
    stock: 14,
    image: img("photo-1615979200145-73c32aa299f2"),
    gallery: [
      img("photo-1623673251908-47d03ab4a8d1"),
      img("photo-1623783526602-4d9d3199b29a"),
    ],
    tile: "std",
  },
  {
    id: "ae-10",
    slug: "cortile-column-lamp",
    name: "Cortile",
    collection: "Light Studies",
    category: "lighting",
    price: 2880,
    tagline: {
      en: "A parchment column that dims to candlelight.",
      fr: "Une colonne de parchemin qui s'abaisse jusqu'à la bougie.",
    },
    story: {
      en: "The dimmer runs to 1,900 kelvin — roughly a candle — rather than stopping at the usual 2,700. Below a certain level, most LED lamps go grey. Cortile goes warm, which is the only reason to own a floor lamp at all.",
      fr: "Le variateur descend à 1 900 kelvins — environ une bougie — au lieu de s'arrêter aux 2 700 habituels. Sous un certain seuil, la plupart des lampes LED virent au gris. Le Cortile se réchauffe, ce qui est la seule raison de posséder un lampadaire.",
    },
    dimensions: { w: 34, d: 34, h: 152 },
    materials: [M.alabaster, M.ash],
    leadTime: { en: "6–8 weeks", fr: "6–8 semaines" },
    stock: 12,
    image: img("photo-1759647020559-2f91a4290ae4"),
    gallery: [
      img("photo-1676545165158-19854c5675dc"),
      img("photo-1661775734551-c98f32f5e6b9"),
    ],
    tile: "std",
  },

  /* ---------- row 6 · 3 + 3 ---------- */
  {
    id: "ae-11",
    slug: "meridian-cabinet",
    name: "Meridian",
    collection: "Case Goods",
    category: "decor",
    price: 9400,
    tagline: {
      en: "Book-matched walnut across four doors, from one tree.",
      fr: "Noyer ouvert en livre sur quatre portes, tiré d'un seul arbre.",
    },
    story: {
      en: "All four doors come from one log, opened like the pages of a book so the grain mirrors across the centre line. When a tree is not wide enough, the cabinet is not made. That is why the Meridian is numbered rather than stocked.",
      fr: "Les quatre portes proviennent d'une seule bille, ouverte comme les pages d'un livre pour que le fil se reflète de part et d'autre de l'axe. Quand un arbre n'est pas assez large, le meuble n'est pas fabriqué. C'est pourquoi le Meridian est numéroté plutôt que stocké.",
    },
    dimensions: { w: 210, d: 48, h: 82 },
    materials: [M.walnut, M.brass],
    leadTime: { en: "14–16 weeks", fr: "14–16 semaines" },
    stock: 3,
    edition: "Numbered, one tree per run",
    image: img("photo-1713810958247-01dbd76b4a61"),
    gallery: [
      img("photo-1650475496371-d7544a32563d"),
      img("photo-1522092663698-61ab4b1aa6a7"),
    ],
    tile: "wide",
  },
  {
    id: "ae-12",
    slug: "otto-sideboard",
    name: "Otto",
    collection: "Case Goods",
    category: "decor",
    price: 7900,
    tagline: {
      en: "Nine drawers on wooden runners — no metal, no click.",
      fr: "Neuf tiroirs sur coulisses de bois — sans métal, sans déclic.",
    },
    story: {
      en: "Otto runs on waxed wood, not ball bearings. The drawers close on a cushion of trapped air and land without a sound, which takes a cabinetmaker four days per case to fit and cannot be corrected later.",
      fr: "L'Otto coulisse sur du bois ciré, non sur roulements. Les tiroirs se referment sur un coussin d'air captif et se posent sans un bruit — un ajustage de quatre jours par caisson, impossible à corriger ensuite.",
    },
    dimensions: { w: 168, d: 45, h: 76 },
    materials: [M.walnut, M.oak, M.brass],
    leadTime: { en: "11–13 weeks", fr: "11–13 semaines" },
    stock: 6,
    image: img("photo-1579283111509-855c7eea1c49"),
    gallery: [
      img("photo-1584125969689-757863dc39dd"),
      img("photo-1632199495802-18f7d21f323b"),
    ],
    tile: "wide",
  },
];

/* ------------------------------ categories ------------------------------ */

export const categories: Category[] = [
  { id: "all", label: { en: "All", fr: "Tout" } },
  { id: "seating", label: { en: "Seating", fr: "Assises" } },
  { id: "tables", label: { en: "Tables", fr: "Tables" } },
  { id: "lighting", label: { en: "Lighting", fr: "Luminaires" } },
  { id: "decor", label: { en: "Decor", fr: "Décor" } },
];

/* ---------------------------- editorial plates ---------------------------- */
/* Photography used by the non-product sections, kept beside the catalogue so
   the whole art direction can be re-graded from one file. */

export const editorial = {
  hero: img("photo-1724582586529-62622e50c0b3", 2400),
  manifesto: img("photo-1725610036468-ee58fab023ef", 2000),
  pinned: [
    {
      key: "form",
      image: img("photo-1758448755778-90ebf4d0f1e7", 2000),
      eyebrow: { en: "Chapter I — Form", fr: "Chapitre I — La forme" },
      title: { en: "Drawn once.", fr: "Dessiné une fois." },
      body: {
        en: "A shell bent as a single piece, with no seam running the length of the back. The frame is steam-bent over eleven days and never cut to correct a curve — if the line is wrong, the wood is returned to stock.",
        fr: "Une coque cintrée d'une seule pièce, sans couture sur toute la longueur du dossier. Le bâti est cintré à la vapeur pendant onze jours et jamais recoupé pour corriger une courbe — si la ligne est fausse, le bois retourne au stock.",
      },
      specs: [
        { k: { en: "Frame", fr: "Bâti" }, v: { en: "Steam-bent ash", fr: "Frêne cintré vapeur" } },
        { k: { en: "Joinery", fr: "Assemblage" }, v: { en: "Mortise & tenon", fr: "Mortaise et tenon" } },
        { k: { en: "Seam length", fr: "Longueur de couture" }, v: { en: "0 mm", fr: "0 mm" } },
      ],
    },
    {
      key: "material",
      image: img("photo-1680773525468-eda783c5bfe7", 2000),
      eyebrow: { en: "Chapter II — Material", fr: "Chapitre II — La matière" },
      title: { en: "Left open.", fr: "Laissé ouvert." },
      body: {
        en: "Travertine sold as furniture is normally filled with resin to hide its pores. Ours is not. The stone arrives from Tivoli with its voids intact and is vein-cut, so the strata run edge to edge instead of swirling.",
        fr: "Le travertin vendu en mobilier est d'ordinaire rebouché à la résine pour masquer ses pores. Pas le nôtre. La pierre arrive de Tivoli avec ses vides intacts et coupée dans la veine, si bien que les strates courent d'un bord à l'autre au lieu de tourbillonner.",
      },
      specs: [
        { k: { en: "Origin", fr: "Origine" }, v: { en: "Tivoli, Lazio", fr: "Tivoli, Latium" } },
        { k: { en: "Cut", fr: "Coupe" }, v: { en: "Vein, unfilled", fr: "Veine, non rebouché" } },
        { k: { en: "Finish", fr: "Finition" }, v: { en: "Honed, 400 grit", fr: "Adouci, grain 400" } },
      ],
    },
    {
      key: "hand",
      image: img("photo-1714924674541-9e11b2d1dd1d", 2000),
      eyebrow: { en: "Chapter III — The hand", fr: "Chapitre III — La main" },
      title: { en: "Signed inside.", fr: "Signé à l'intérieur." },
      body: {
        en: "Every piece carries the maker's stamp where you will never see it — under the seat rail, behind the back panel. Nine people touch a Lumière before it is crated. All nine are named on the certificate.",
        fr: "Chaque pièce porte l'estampille de son artisan là où vous ne la verrez jamais — sous la traverse d'assise, derrière le panneau arrière. Neuf personnes touchent un Lumière avant sa mise en caisse. Les neuf sont nommées sur le certificat.",
      },
      specs: [
        { k: { en: "Hands per piece", fr: "Mains par pièce" }, v: { en: "9", fr: "9" } },
        { k: { en: "Atelier hours", fr: "Heures d'atelier" }, v: { en: "112", fr: "112" } },
        { k: { en: "Warranty", fr: "Garantie" }, v: { en: "30 years", fr: "30 ans" } },
      ],
    },
  ],
  craft: [
    {
      key: "wood",
      macro: img("photo-1583418007992-a8e33a92e7ad", 1400),
      title: { en: "Grain", fr: "Le fil" },
      body: {
        en: "Book-matched from a single log so the figure mirrors across the centre line.",
        fr: "Ouvert en livre depuis une seule bille pour que la figure se reflète de part et d'autre de l'axe.",
      },
      metric: { en: "11 weeks drying", fr: "11 semaines de séchage" },
    },
    {
      key: "leather",
      macro: img("photo-1567016376408-0226e4d0c1ea", 1400),
      title: { en: "Hide", fr: "La peau" },
      body: {
        en: "Vegetable-tanned in Tuscany, finished with wax alone. It records where you sit.",
        fr: "Tannage végétal en Toscane, fini à la cire seule. Il garde la trace de vos assises.",
      },
      metric: { en: "90 days in the pit", fr: "90 jours en fosse" },
    },
    {
      key: "stone",
      macro: img("photo-1525468568166-6f2cd17c7ec9", 1400),
      title: { en: "Stone", fr: "La pierre" },
      body: {
        en: "Vein-cut travertine, pores left open. Honed to 400 grit and nothing more.",
        fr: "Travertin coupé dans la veine, pores laissés ouverts. Adouci au grain 400, rien de plus.",
      },
      metric: { en: "2× yield loss", fr: "2× de perte matière" },
    },
    {
      key: "metal",
      macro: img("photo-1540408478354-3c7393dfbd0d", 1400),
      title: { en: "Joinery", fr: "L'assemblage" },
      body: {
        en: "Brass linished in one direction by hand, then TIG-welded and dressed flush.",
        fr: "Laiton satiné à la main dans un seul sens, soudé TIG puis dressé à fleur.",
      },
      metric: { en: "0.2 mm tolerance", fr: "Tolérance 0,2 mm" },
    },
  ],
} as const;

/* -------------------------------- helpers -------------------------------- */

export const productById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const productsByCategory = (category: string): Product[] =>
  category === "all" ? products : products.filter((p) => p.category === category);

/** Free-text search across name, collection and both localised taglines. */
export const searchProducts = (query: string): Product[] => {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) =>
    [p.name, p.collection, p.tagline.en, p.tagline.fr, p.category]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
};
