export type Locale = 'fr' | 'en';

export const translations = {
  // ─── Navbar ────────────────────────────────────────
  'nav.features': { fr: 'Fonctionnalites', en: 'Features' },
  'nav.howItWorks': { fr: 'Comment ca marche', en: 'How it works' },
  'nav.merchants': { fr: 'Merchants', en: 'Merchants' },
  'nav.download': { fr: 'Telecharger', en: 'Download' },

  // ─── Hero ──────────────────────────────────────────
  'hero.badge': {
    fr: 'Disponible en beta sur iOS (TestFlight)',
    en: 'Available in beta on iOS (TestFlight)',
  },
  'hero.title.before': { fr: 'Trouvez le ', en: 'Find the ' },
  'hero.title.highlight': { fr: 'meilleur prix', en: 'best price' },
  'hero.title.after': { fr: ' en un instant', en: ' instantly' },
  'hero.desc': {
    fr: 'Scannez un code-barre ou recherchez un produit pour comparer les prix parmi des centaines de marchands. Gratuit, rapide et sans pub.',
    en: 'Scan a barcode or search for a product to compare prices across hundreds of retailers. Free, fast and ad-free.',
  },
  'hero.cta': { fr: 'Telecharger gratuitement', en: 'Download for free' },
  'hero.learnMore': { fr: 'En savoir plus', en: 'Learn more' },
  'hero.compareOn': { fr: 'Comparez les prix sur', en: 'Compare prices on' },

  // ─── Features ──────────────────────────────────────
  'features.tag': { fr: 'Fonctionnalites', en: 'Features' },
  'features.title': {
    fr: 'Tout ce dont vous avez besoin',
    en: 'Everything you need',
  },
  'features.desc': {
    fr: 'SaveTide compare les prix pour vous et vous aide a economiser sur chaque achat.',
    en: 'SaveTide compares prices for you and helps you save on every purchase.',
  },
  'features.scan.title': { fr: 'Scan code-barre', en: 'Barcode scan' },
  'features.scan.desc': {
    fr: "Scannez n'importe quel code-barre en magasin pour comparer instantanement les prix en ligne et trouver la meilleure offre.",
    en: 'Scan any barcode in-store to instantly compare online prices and find the best deal.',
  },
  'features.search.title': { fr: 'Recherche par nom', en: 'Search by name' },
  'features.search.desc': {
    fr: "Recherchez n'importe quel produit par son nom et obtenez les prix de tous les marchands tries du moins cher au plus cher.",
    en: 'Search for any product by name and get prices from all retailers sorted from lowest to highest.',
  },
  'features.history.title': {
    fr: 'Historique des prix',
    en: 'Price history',
  },
  'features.history.desc': {
    fr: "Suivez l'evolution du prix d'un produit dans le temps. Savez si c'est le bon moment d'acheter ou s'il vaut mieux attendre.",
    en: "Track a product's price over time. Know if it's the right time to buy or if you should wait.",
  },
  'features.alerts.title': { fr: 'Alertes de prix', en: 'Price alerts' },
  'features.alerts.desc': {
    fr: "Definissez un prix cible et recevez une notification quand le produit atteint votre prix ideal. Ne ratez plus aucune bonne affaire.",
    en: 'Set a target price and get notified when the product reaches your ideal price. Never miss a deal again.',
  },
  'features.multi.title': { fr: 'Multi-pays', en: 'Multi-country' },
  'features.multi.desc': {
    fr: "Disponible en France et aux Etats-Unis avec les marchands locaux de chaque pays. D'autres pays arrivent bientot.",
    en: 'Available in France and the United States with local retailers for each country. More countries coming soon.',
  },
  'features.free.title': { fr: '100% gratuit', en: '100% free' },
  'features.free.desc': {
    fr: "SaveTide est entierement gratuit. Pas d'abonnement, pas de frais caches. Comparez et economisez sans limites.",
    en: 'SaveTide is completely free. No subscription, no hidden fees. Compare and save without limits.',
  },

  // ─── How it works ──────────────────────────────────
  'how.tag': { fr: 'Comment ca marche', en: 'How it works' },
  'how.title': { fr: "3 etapes, c'est tout", en: '3 steps, that\'s it' },
  'how.desc': {
    fr: 'Trouvez le meilleur prix en quelques secondes.',
    en: 'Find the best price in seconds.',
  },
  'how.step1.title': { fr: 'Scannez ou recherchez', en: 'Scan or search' },
  'how.step1.desc': {
    fr: 'Scannez le code-barre du produit en magasin ou tapez son nom dans la barre de recherche.',
    en: 'Scan the product barcode in-store or type its name in the search bar.',
  },
  'how.step2.title': { fr: 'Comparez les prix', en: 'Compare prices' },
  'how.step2.desc': {
    fr: "Visualisez les prix de dizaines de marchands tries du moins cher au plus cher, en un coup d'oeil.",
    en: 'See prices from dozens of retailers sorted from lowest to highest, at a glance.',
  },
  'how.step3.title': {
    fr: 'Achetez au meilleur prix',
    en: 'Buy at the best price',
  },
  'how.step3.desc': {
    fr: 'Cliquez sur le marchand de votre choix pour aller directement sur la page du produit et finaliser votre achat.',
    en: 'Click on your preferred retailer to go directly to the product page and complete your purchase.',
  },

  // ─── Merchants ─────────────────────────────────────
  'merchants.tag': { fr: 'Marchands', en: 'Retailers' },
  'merchants.title': {
    fr: 'Des centaines de marchands compares',
    en: 'Hundreds of retailers compared',
  },
  'merchants.desc': {
    fr: 'Nous comparons les prix des plus grands marchands en France et aux Etats-Unis.',
    en: 'We compare prices from the biggest retailers in France and the United States.',
  },

  // ─── CTA / Download ───────────────────────────────
  'cta.title': { fr: 'Pret a economiser ?', en: 'Ready to save?' },
  'cta.desc': {
    fr: "Telechargez SaveTide gratuitement et commencez a trouver les meilleurs prix des aujourd'hui.",
    en: 'Download SaveTide for free and start finding the best prices today.',
  },
  'cta.ios': { fr: 'Tester sur iOS via', en: 'Try on iOS via' },
  'cta.android.soon': { fr: 'Bientot sur', en: 'Coming soon to' },
  'cta.note': {
    fr: "L'application est actuellement en beta. Testez-la gratuitement sur iOS via TestFlight.",
    en: 'The app is currently in beta. Try it for free on iOS via TestFlight.',
  },

  // ─── Footer ────────────────────────────────────────
  'footer.desc': {
    fr: 'Comparateur de prix intelligent. Scannez, comparez, economisez sur tous vos achats.',
    en: 'Smart price comparison. Scan, compare, save on all your purchases.',
  },
  'footer.product': { fr: 'Produit', en: 'Product' },
  'footer.legal': { fr: 'Legal', en: 'Legal' },
  'footer.contact': { fr: 'Contact', en: 'Contact' },
  'footer.privacy': {
    fr: 'Politique de confidentialite',
    en: 'Privacy policy',
  },
  'footer.terms': {
    fr: "Conditions d'utilisation",
    en: 'Terms of use',
  },
  'footer.mentions': { fr: 'Mentions legales', en: 'Legal notice' },
  'footer.rights': {
    fr: 'Tous droits reserves.',
    en: 'All rights reserved.',
  },
  'footer.privacyShort': { fr: 'Confidentialite', en: 'Privacy' },

  // ─── Privacy page ──────────────────────────────────
  'privacy.title': {
    fr: 'Politique de Confidentialite',
    en: 'Privacy Policy',
  },
  'privacy.updated': {
    fr: 'Derniere mise a jour : Fevrier 2026',
    en: 'Last updated: February 2026',
  },
  'privacy.s1.title': { fr: '1. Donnees collectees', en: '1. Data collected' },
  'privacy.s1.desc': {
    fr: 'SaveTide collecte les donnees suivantes pour le fonctionnement du service :',
    en: 'SaveTide collects the following data for the operation of the service:',
  },
  'privacy.s1.l1': {
    fr: 'Adresse email et nom (lors de la creation de compte)',
    en: 'Email address and name (when creating an account)',
  },
  'privacy.s1.l2': {
    fr: 'Historique de recherche de produits (stocke localement sur votre appareil)',
    en: 'Product search history (stored locally on your device)',
  },
  'privacy.s1.l3': {
    fr: 'Produits suivis et alertes de prix (si vous utilisez cette fonctionnalite)',
    en: 'Tracked products and price alerts (if you use this feature)',
  },
  'privacy.s1.l4': {
    fr: 'Pays de residence (pour afficher les marchands pertinents)',
    en: 'Country of residence (to display relevant retailers)',
  },
  'privacy.s2.title': {
    fr: '2. Utilisation des donnees',
    en: '2. Use of data',
  },
  'privacy.s2.desc': {
    fr: 'Vos donnees sont utilisees exclusivement pour :',
    en: 'Your data is used exclusively for:',
  },
  'privacy.s2.l1': {
    fr: 'Fournir les resultats de comparaison de prix',
    en: 'Providing price comparison results',
  },
  'privacy.s2.l2': {
    fr: 'Envoyer des alertes de prix sur les produits que vous suivez',
    en: 'Sending price alerts on products you track',
  },
  'privacy.s2.l3': {
    fr: 'Ameliorer la qualite du service',
    en: 'Improving the quality of the service',
  },
  'privacy.s2.noSell': {
    fr: 'Nous ne vendons jamais vos donnees a des tiers. Nous ne partageons pas vos informations personnelles avec des annonceurs.',
    en: 'We never sell your data to third parties. We do not share your personal information with advertisers.',
  },
  'privacy.s3.title': {
    fr: "3. Liens d'affiliation",
    en: '3. Affiliate links',
  },
  'privacy.s3.desc': {
    fr: "SaveTide utilise des liens d'affiliation. Lorsque vous cliquez sur un lien vers un marchand et effectuez un achat, nous pouvons recevoir une commission de la part du marchand. Cela n'affecte pas le prix que vous payez. Les prix affiches sont toujours les prix reels du marchand.",
    en: 'SaveTide uses affiliate links. When you click on a link to a retailer and make a purchase, we may receive a commission from the retailer. This does not affect the price you pay. Displayed prices are always the actual retailer prices.',
  },
  'privacy.s4.title': {
    fr: '4. Cookies et traceurs',
    en: '4. Cookies and trackers',
  },
  'privacy.s4.desc': {
    fr: "L'application mobile SaveTide n'utilise pas de cookies. Le site web savetide.com utilise uniquement des cookies techniques necessaires au fonctionnement du site.",
    en: 'The SaveTide mobile app does not use cookies. The savetide.com website only uses technical cookies necessary for the site to function.',
  },
  'privacy.s5.title': { fr: '5. Securite', en: '5. Security' },
  'privacy.s5.desc': {
    fr: 'Vos donnees sont protegees par chiffrement en transit (HTTPS/TLS) et au repos. Les mots de passe sont haches avec bcrypt et ne sont jamais stockes en clair.',
    en: 'Your data is protected by encryption in transit (HTTPS/TLS) and at rest. Passwords are hashed with bcrypt and are never stored in plain text.',
  },
  'privacy.s6.title': {
    fr: '6. Vos droits (RGPD)',
    en: '6. Your rights (GDPR)',
  },
  'privacy.s6.desc': {
    fr: "Conformement au RGPD, vous disposez d'un droit d'acces, de rectification et de suppression de vos donnees personnelles. Pour exercer ces droits, contactez-nous a",
    en: 'In accordance with the GDPR, you have the right to access, rectify and delete your personal data. To exercise these rights, contact us at',
  },
  'privacy.s7.title': { fr: '7. Contact', en: '7. Contact' },
  'privacy.s7.desc': {
    fr: 'Pour toute question relative a la protection de vos donnees :',
    en: 'For any question regarding the protection of your data:',
  },

  // ─── Terms page ────────────────────────────────────
  'terms.title': {
    fr: "Conditions Generales d'Utilisation",
    en: 'Terms of Use',
  },
  'terms.updated': {
    fr: 'Derniere mise a jour : Fevrier 2026',
    en: 'Last updated: February 2026',
  },
  'terms.s1.title': {
    fr: '1. Presentation du service',
    en: '1. Service overview',
  },
  'terms.s1.desc': {
    fr: 'SaveTide est une application mobile de comparaison de prix qui permet aux utilisateurs de scanner des codes-barres, rechercher des produits et comparer les prix entre differents marchands en ligne.',
    en: 'SaveTide is a mobile price comparison app that allows users to scan barcodes, search for products and compare prices across different online retailers.',
  },
  'terms.s2.title': {
    fr: '2. Gratuite du service',
    en: '2. Free service',
  },
  'terms.s2.desc': {
    fr: "L'utilisation de SaveTide est entierement gratuite. L'application se remunere via des commissions d'affiliation versees par les marchands partenaires lorsqu'un achat est effectue via nos liens. Ces commissions n'affectent en aucun cas les prix affiches.",
    en: 'SaveTide is completely free to use. The app generates revenue through affiliate commissions paid by partner retailers when a purchase is made through our links. These commissions do not affect the displayed prices in any way.',
  },
  'terms.s3.title': {
    fr: '3. Exactitude des prix',
    en: '3. Price accuracy',
  },
  'terms.s3.desc': {
    fr: "Les prix affiches dans SaveTide proviennent directement des marchands partenaires et sont mis a jour regulierement. Cependant, les prix peuvent varier entre le moment de la consultation et le moment de l'achat. SaveTide ne peut etre tenu responsable des ecarts de prix constates.",
    en: 'Prices displayed in SaveTide come directly from partner retailers and are updated regularly. However, prices may vary between the time of viewing and the time of purchase. SaveTide cannot be held responsible for any price discrepancies.',
  },
  'terms.s4.title': {
    fr: '4. Liens vers des sites tiers',
    en: '4. Links to third-party sites',
  },
  'terms.s4.desc': {
    fr: "SaveTide redirige les utilisateurs vers les sites web des marchands pour finaliser leurs achats. Ces sites tiers ont leurs propres conditions d'utilisation et politiques de confidentialite. SaveTide n'est pas responsable du contenu ou des pratiques de ces sites tiers.",
    en: 'SaveTide redirects users to retailer websites to complete their purchases. These third-party sites have their own terms of use and privacy policies. SaveTide is not responsible for the content or practices of these third-party sites.',
  },
  'terms.s5.title': {
    fr: '5. Compte utilisateur',
    en: '5. User account',
  },
  'terms.s5.desc': {
    fr: "La creation d'un compte est optionnelle. Elle permet d'acceder aux fonctionnalites de suivi de prix et d'alertes. Vous etes responsable de la confidentialite de vos identifiants de connexion.",
    en: 'Creating an account is optional. It gives access to price tracking and alert features. You are responsible for the confidentiality of your login credentials.',
  },
  'terms.s6.title': {
    fr: '6. Propriete intellectuelle',
    en: '6. Intellectual property',
  },
  'terms.s6.desc': {
    fr: "L'application SaveTide, son design, son code source et son contenu sont proteges par le droit de la propriete intellectuelle. Toute reproduction non autorisee est interdite.",
    en: 'The SaveTide app, its design, source code and content are protected by intellectual property law. Any unauthorized reproduction is prohibited.',
  },
  'terms.s7.title': {
    fr: '7. Modification des conditions',
    en: '7. Modification of terms',
  },
  'terms.s7.desc': {
    fr: "SaveTide se reserve le droit de modifier ces conditions a tout moment. Les utilisateurs seront informes des modifications significatives via l'application.",
    en: 'SaveTide reserves the right to modify these terms at any time. Users will be notified of significant changes through the app.',
  },
  'terms.s8.title': { fr: '8. Contact', en: '8. Contact' },
  'terms.s8.desc': {
    fr: 'Pour toute question :',
    en: 'For any question:',
  },

  // ─── Mentions legales ──────────────────────────────
  'mentions.title': { fr: 'Mentions Legales', en: 'Legal Notice' },
  'mentions.s1.title': { fr: 'Editeur du site', en: 'Site publisher' },
  'mentions.s1.website': { fr: 'Site web :', en: 'Website:' },
  'mentions.s2.title': { fr: 'Hebergement', en: 'Hosting' },
  'mentions.s2.desc': {
    fr: 'Le site est heberge par :',
    en: 'The site is hosted by:',
  },
  'mentions.s3.title': {
    fr: "Liens d'affiliation",
    en: 'Affiliate links',
  },
  'mentions.s3.desc': {
    fr: "Ce site et l'application SaveTide contiennent des liens d'affiliation. Lorsque vous cliquez sur un lien marchand et effectuez un achat, nous pouvons recevoir une commission. Cela n'affecte pas le prix que vous payez. Les resultats de comparaison de prix sont affiches de maniere objective, du prix le plus bas au plus eleve, independamment des commissions d'affiliation.",
    en: 'This site and the SaveTide app contain affiliate links. When you click on a retailer link and make a purchase, we may receive a commission. This does not affect the price you pay. Price comparison results are displayed objectively, from lowest to highest price, regardless of affiliate commissions.',
  },
  'mentions.s4.title': {
    fr: 'Propriete intellectuelle',
    en: 'Intellectual property',
  },
  'mentions.s4.desc': {
    fr: "L'ensemble du contenu de ce site (textes, images, logo, code source) est protege par le droit de la propriete intellectuelle. Toute reproduction, meme partielle, est soumise a autorisation prealable.",
    en: 'All content on this site (text, images, logo, source code) is protected by intellectual property law. Any reproduction, even partial, requires prior authorization.',
  },
  'mentions.s5.title': {
    fr: 'Donnees personnelles',
    en: 'Personal data',
  },
  'mentions.s5.desc': {
    fr: 'Pour toute information relative au traitement de vos donnees personnelles, consultez notre',
    en: 'For any information regarding the processing of your personal data, please refer to our',
  },

  // ─── Extension privacy ────────────────────────────
  'ext.subtitle': {
    fr: 'Extension Chrome - SaveTide (PriceWatch)',
    en: 'Chrome Extension - SaveTide (PriceWatch)',
  },
  'ext.updated': {
    fr: 'Derniere mise a jour : 14 janvier 2026',
    en: 'Last updated: January 14, 2026',
  },
  'ext.s1.title': { fr: '1. Introduction', en: '1. Introduction' },
  'ext.s1.desc': {
    fr: 'PriceWatch ("nous", "notre") respecte votre vie privee. Cette politique de confidentialite explique comment notre extension Chrome collecte et utilise vos donnees.',
    en: 'PriceWatch ("we", "our") respects your privacy. This privacy policy explains how our Chrome extension collects and uses your data.',
  },
  'ext.s2.title': {
    fr: '2. Donnees collectees',
    en: '2. Data collected',
  },
  'ext.s2.desc': {
    fr: 'PriceWatch collecte les informations suivantes :',
    en: 'PriceWatch collects the following information:',
  },
  'ext.s2.l1.strong': {
    fr: 'URLs des pages visitees',
    en: 'URLs of visited pages',
  },
  'ext.s2.l1.desc': {
    fr: ' : Uniquement pour detecter les pages produits et comparer les prix',
    en: ': Only to detect product pages and compare prices',
  },
  'ext.s2.l2.strong': {
    fr: 'Historique de recherche local',
    en: 'Local search history',
  },
  'ext.s2.l2.desc': {
    fr: ' : Stocke localement dans votre navigateur pour afficher vos recherches recentes',
    en: ': Stored locally in your browser to display your recent searches',
  },
  'ext.s3.title': {
    fr: '3. Donnees NON collectees',
    en: '3. Data NOT collected',
  },
  'ext.s3.desc': {
    fr: 'PriceWatch ne collecte PAS :',
    en: 'PriceWatch does NOT collect:',
  },
  'ext.s3.l1': {
    fr: 'Vos informations personnelles (nom, email, adresse)',
    en: 'Your personal information (name, email, address)',
  },
  'ext.s3.l2': {
    fr: 'Vos mots de passe ou informations de paiement',
    en: 'Your passwords or payment information',
  },
  'ext.s3.l3': {
    fr: 'Votre historique de navigation complet',
    en: 'Your complete browsing history',
  },
  'ext.s3.l4': {
    fr: 'Vos donnees de localisation',
    en: 'Your location data',
  },
  'ext.s4.title': {
    fr: '4. Utilisation des donnees',
    en: '4. Use of data',
  },
  'ext.s4.desc': {
    fr: 'Les donnees collectees sont utilisees uniquement pour :',
    en: 'Collected data is used only for:',
  },
  'ext.s4.l1': {
    fr: 'Comparer les prix sur differents marchands',
    en: 'Comparing prices across different retailers',
  },
  'ext.s4.l2': {
    fr: 'Afficher les meilleurs prix disponibles',
    en: 'Displaying the best available prices',
  },
  'ext.s4.l3': {
    fr: 'Sauvegarder votre historique de recherche localement',
    en: 'Saving your search history locally',
  },
  'ext.s5.title': {
    fr: '5. Partage des donnees',
    en: '5. Data sharing',
  },
  'ext.s5.bold': {
    fr: 'Nous ne vendons ni ne partageons vos donnees avec des tiers.',
    en: 'We do not sell or share your data with third parties.',
  },
  'ext.s5.desc': {
    fr: 'Les requetes de comparaison de prix sont envoyees a notre serveur backend heberge sur Railway.app uniquement pour effectuer la recherche de prix.',
    en: 'Price comparison requests are sent to our backend server hosted on Railway.app solely to perform the price search.',
  },
  'ext.s6.title': {
    fr: '6. Stockage des donnees',
    en: '6. Data storage',
  },
  'ext.s6.l1.strong': { fr: 'Stockage local', en: 'Local storage' },
  'ext.s6.l1.desc': {
    fr: " : L'historique de recherche est stocke localement dans votre navigateur via chrome.storage.local",
    en: ': Search history is stored locally in your browser via chrome.storage.local',
  },
  'ext.s6.l2.strong': {
    fr: 'Duree de conservation',
    en: 'Retention period',
  },
  'ext.s6.l2.desc': {
    fr: " : Les donnees sont conservees jusqu'a ce que vous les supprimiez manuellement ou desinstalliez l'extension",
    en: ': Data is retained until you manually delete it or uninstall the extension',
  },
  'ext.s7.title': { fr: '7. Securite', en: '7. Security' },
  'ext.s7.desc': {
    fr: 'Nous prenons des mesures raisonnables pour proteger vos donnees contre tout acces non autorise. Toutes les communications avec notre backend utilisent HTTPS.',
    en: 'We take reasonable measures to protect your data against unauthorized access. All communications with our backend use HTTPS.',
  },
  'ext.s8.title': { fr: '8. Vos droits', en: '8. Your rights' },
  'ext.s8.desc': {
    fr: 'Vous avez le droit de :',
    en: 'You have the right to:',
  },
  'ext.s8.l1': {
    fr: "Supprimer votre historique de recherche a tout moment via l'extension",
    en: 'Delete your search history at any time via the extension',
  },
  'ext.s8.l2': {
    fr: "Desinstaller l'extension pour supprimer toutes les donnees locales",
    en: 'Uninstall the extension to delete all local data',
  },
  'ext.s8.l3': {
    fr: 'Nous contacter pour toute question concernant vos donnees',
    en: 'Contact us for any question regarding your data',
  },
  'ext.s9.title': { fr: '9. Services tiers', en: '9. Third-party services' },
  'ext.s9.desc': {
    fr: 'PriceWatch utilise :',
    en: 'PriceWatch uses:',
  },
  'ext.s9.l1': {
    fr: ' : Pour recuperer les resultats de comparaison de prix (soumis a leur propre politique de confidentialite)',
    en: ': To retrieve price comparison results (subject to their own privacy policy)',
  },
  'ext.s9.l2': {
    fr: ' : Pour heberger notre backend API',
    en: ': To host our backend API',
  },
  'ext.s10.title': {
    fr: '10. Modifications de cette politique',
    en: '10. Changes to this policy',
  },
  'ext.s10.desc': {
    fr: 'Nous pouvons mettre a jour cette politique de confidentialite occasionnellement. Toute modification sera publiee sur cette page avec une date de mise a jour actualisee.',
    en: 'We may update this privacy policy from time to time. Any changes will be posted on this page with an updated date.',
  },
  'ext.s11.title': { fr: '11. Contact', en: '11. Contact' },
  'ext.s11.desc': {
    fr: 'Pour toute question concernant cette politique de confidentialite, contactez-nous :',
    en: 'For any questions regarding this privacy policy, contact us:',
  },
  'ext.s12.title': {
    fr: '12. Conformite RGPD',
    en: '12. GDPR compliance',
  },
  'ext.s12.desc': {
    fr: "Pour les utilisateurs de l'Union Europeenne :",
    en: 'For European Union users:',
  },
  'ext.s12.l1': {
    fr: 'Nous respectons le RGPD (Reglement General sur la Protection des Donnees)',
    en: 'We comply with the GDPR (General Data Protection Regulation)',
  },
  'ext.s12.l2': {
    fr: "Vous avez le droit d'acceder, de rectifier et de supprimer vos donnees",
    en: 'You have the right to access, rectify and delete your data',
  },
  'ext.s12.l3': {
    fr: "Nous ne transferons pas vos donnees en dehors de l'UE",
    en: 'We do not transfer your data outside the EU',
  },
  'ext.copyright': {
    fr: 'SaveTide (PriceWatch). Tous droits reserves.',
    en: 'SaveTide (PriceWatch). All rights reserved.',
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[locale] || entry['en'];
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  const lang = navigator.language || (navigator as any).userLanguage || 'fr';
  return lang.startsWith('fr') ? 'fr' : 'en';
}
