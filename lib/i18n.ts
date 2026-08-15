import type { Locale, Localized } from "./types";

/* ------------------------------------------------------------------ *
 * Interface copy. Product prose lives in furnitureData.ts; this file
 * holds the chrome — navigation, store controls, drawer, footer.
 * ------------------------------------------------------------------ */

export const locales: Locale[] = ["en", "fr"];

export const dictionary = {
  /* nav */
  navLiving: { en: "Living", fr: "Salon" },
  navDining: { en: "Dining", fr: "Salle à manger" },
  navLighting: { en: "Lighting", fr: "Luminaires" },
  navAtelier: { en: "Atelier", fr: "Atelier" },
  navCollection: { en: "The Collection", fr: "La Collection" },
  openMenu: { en: "Open menu", fr: "Ouvrir le menu" },
  closeMenu: { en: "Close menu", fr: "Fermer le menu" },
  openCart: { en: "Open cart", fr: "Ouvrir le panier" },

  /* hero */
  heroEyebrow: { en: "Aetheria Atelier — Est. 1974, Milan", fr: "Aetheria Atelier — fondé en 1974, Milan" },
  heroLine1: { en: "Sculpted Comfort.", fr: "Confort sculpté." },
  heroLine2: { en: "Timeless", fr: "Formes" },
  heroLine2Accent: { en: "Forms.", fr: "intemporelles." },
  heroSub: {
    en: "Thirty-one makers. One workshop outside Milan. Furniture drawn once, built to be repaired rather than replaced.",
    fr: "Trente-et-un artisans. Un atelier près de Milan. Un mobilier dessiné une fois, conçu pour être réparé plutôt que remplacé.",
  },
  heroCta: { en: "Explore the Collection", fr: "Découvrir la collection" },
  heroCtaAlt: { en: "Book the Atelier", fr: "Réserver l'atelier" },
  scrollHint: { en: "Scroll", fr: "Défiler" },
  dragHint: { en: "Drag to orbit", fr: "Faites glisser pour pivoter" },

  /* collection */
  collectionEyebrow: { en: "The Gallery & Collection", fr: "La galerie et la collection" },
  collectionTitle: { en: "Thirteen pieces.", fr: "Treize pièces." },
  collectionTitleAccent: { en: "Nothing else.", fr: "Rien d'autre." },
  collectionSub: {
    en: "The atelier releases one run a year. When a run closes, the drawings are archived and the piece is not made again.",
    fr: "L'atelier ne produit qu'une série par an. Une fois close, les dessins sont archivés et la pièce n'est plus fabriquée.",
  },
  filterLabel: { en: "Filter", fr: "Filtrer" },
  resultsOne: { en: "piece", fr: "pièce" },
  resultsMany: { en: "pieces", fr: "pièces" },
  quickView: { en: "Quick view", fr: "Aperçu" },
  empty: { en: "Nothing in this category yet.", fr: "Rien dans cette catégorie pour l'instant." },

  /* product detail */
  dimensions: { en: "Dimensions", fr: "Dimensions" },
  width: { en: "Width", fr: "Largeur" },
  depth: { en: "Depth", fr: "Profondeur" },
  height: { en: "Height", fr: "Hauteur" },
  seatHeight: { en: "Seat height", fr: "Hauteur d'assise" },
  materials: { en: "Materials", fr: "Matériaux" },
  leadTime: { en: "Lead time", fr: "Délai" },
  availability: { en: "Availability", fr: "Disponibilité" },
  inRun: { en: "in current run", fr: "dans la série en cours" },
  lastPieces: { en: "Final pieces", fr: "Dernières pièces" },
  addToCart: { en: "Add to Cart", fr: "Ajouter au panier" },
  added: { en: "Added", fr: "Ajouté" },
  requestConsultation: { en: "Request Consultation", fr: "Demander un conseil" },
  close: { en: "Close", fr: "Fermer" },

  /* craft */
  craftEyebrow: { en: "Craftsmanship", fr: "Savoir-faire" },
  craftTitle: { en: "Look closer.", fr: "Regardez de plus près." },
  craftTitleAccent: { en: "It holds up.", fr: "Cela tient." },
  craftSub: {
    en: "Four materials, photographed at the distance a maker works from.",
    fr: "Quatre matières, photographiées à la distance où travaille l'artisan.",
  },

  /* manifesto */
  manifestoEyebrow: { en: "The Manifesto", fr: "Le manifeste" },
  manifestoQuote: {
    en: "We make objects meant to outlive the trend that produced them.",
    fr: "Nous faisons des objets destinés à survivre à la mode qui les a produits.",
  },
  manifestoAttr: { en: "Elena Vasari, Founder", fr: "Elena Vasari, fondatrice" },

  /* cart */
  cartTitle: { en: "Your Selection", fr: "Votre sélection" },
  cartEmpty: { en: "Nothing selected yet.", fr: "Aucune pièce sélectionnée." },
  cartEmptySub: {
    en: "Pieces you add will be held for 72 hours.",
    fr: "Les pièces ajoutées sont réservées 72 heures.",
  },
  cartBrowse: { en: "Browse the Collection", fr: "Parcourir la collection" },
  subtotal: { en: "Subtotal", fr: "Sous-total" },
  whiteGlove: { en: "White-glove delivery", fr: "Livraison gantée" },
  included: { en: "Included", fr: "Incluse" },
  total: { en: "Total", fr: "Total" },
  checkout: { en: "Complete Order", fr: "Finaliser la commande" },
  processing: { en: "Processing…", fr: "Traitement…" },
  remove: { en: "Remove", fr: "Retirer" },
  qty: { en: "Qty", fr: "Qté" },
  yourName: { en: "Full name", fr: "Nom complet" },
  yourEmail: { en: "Email", fr: "Courriel" },
  yourNote: { en: "Notes for the atelier (optional)", fr: "Notes pour l'atelier (facultatif)" },
  orderPlaced: { en: "Order received", fr: "Commande reçue" },
  orderRef: { en: "Reference", fr: "Référence" },
  continueBrowsing: { en: "Continue", fr: "Continuer" },
  checkoutError: {
    en: "Something went wrong. Please try again.",
    fr: "Une erreur est survenue. Veuillez réessayer.",
  },
  requiredFields: {
    en: "Please add your name and a valid email.",
    fr: "Veuillez indiquer votre nom et un courriel valide.",
  },

  /* footer */
  footerManifesto: {
    en: "Aetheria Atelier is a workshop of thirty-one makers outside Milan. We publish one collection a year and repair anything we have ever made, for as long as we exist.",
    fr: "Aetheria Atelier est un atelier de trente-et-un artisans près de Milan. Nous publions une collection par an et réparons tout ce que nous avons fabriqué, aussi longtemps que nous existerons.",
  },
  studios: { en: "Studios", fr: "Studios" },
  collectionCol: { en: "Collection", fr: "Collection" },
  houseCol: { en: "House", fr: "Maison" },
  newsletterTitle: { en: "The Dispatch", fr: "La Dépêche" },
  newsletterSub: {
    en: "Four letters a year. New runs, closing editions, and the occasional workshop note.",
    fr: "Quatre lettres par an. Nouvelles séries, éditions closes et quelques notes d'atelier.",
  },
  newsletterPlaceholder: { en: "your@email.com", fr: "vous@courriel.com" },
  subscribe: { en: "Subscribe", fr: "S'abonner" },
  subscribed: { en: "Thank you — check your inbox.", fr: "Merci — consultez votre boîte de réception." },
  rights: { en: "All rights reserved.", fr: "Tous droits réservés." },
  privacy: { en: "Privacy", fr: "Confidentialité" },
  terms: { en: "Terms", fr: "Conditions" },
  care: { en: "Care & Repair", fr: "Entretien et réparation" },
  trade: { en: "Trade Program", fr: "Programme pro" },
  press: { en: "Press", fr: "Presse" },
  contact: { en: "Contact", fr: "Contact" },
} satisfies Record<string, Localized>;

export type DictKey = keyof typeof dictionary;

/** Resolve a dictionary key for a locale. */
export const t = (key: DictKey, locale: Locale): string => dictionary[key][locale];

/** Resolve any localised value for a locale. */
export const L = (value: Localized, locale: Locale): string => value[locale];
