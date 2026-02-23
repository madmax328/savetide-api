export default function Home() {
  return (
    <>
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-logo">
            Save<span>Tide</span>
          </div>

          <div className="nav-links">
            <a href="#features">Fonctionnalites</a>
            <a href="#how-it-works">Comment ca marche</a>
            <a href="#merchants">Marchands</a>
            <a href="#download" className="nav-cta">
              Telecharger
            </a>
          </div>

          <button className="mobile-menu-btn" aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="dot" />
            Disponible en beta sur iOS (TestFlight)
          </div>

          <h1>
            Trouvez le <span className="highlight">meilleur prix</span> en un
            instant
          </h1>

          <p className="hero-desc">
            Scannez un code-barre ou recherchez un produit pour comparer les
            prix parmi des centaines de marchands. Gratuit, rapide et sans pub.
          </p>

          <div className="hero-buttons">
            <a href="#download" className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Telecharger gratuitement
            </a>
            <a href="#features" className="btn-secondary">
              En savoir plus
            </a>
          </div>

          <div className="hero-stores">
            <p>Comparez les prix sur</p>
            <div className="store-logos">
              <span>Amazon</span>
              <span>Fnac</span>
              <span>Cdiscount</span>
              <span>Darty</span>
              <span>Boulanger</span>
              <span>Walmart</span>
              <span>eBay</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Fonctionnalites</span>
            <h2>Tout ce dont vous avez besoin</h2>
            <p>
              SaveTide compare les prix pour vous et vous aide a economiser sur
              chaque achat.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: '#dbeafe' }}
              >
                <span role="img" aria-label="scan">
                  📱
                </span>
              </div>
              <h3>Scan code-barre</h3>
              <p>
                Scannez n&apos;importe quel code-barre en magasin pour comparer
                instantanement les prix en ligne et trouver la meilleure offre.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: '#fef3c7' }}
              >
                <span role="img" aria-label="search">
                  🔍
                </span>
              </div>
              <h3>Recherche par nom</h3>
              <p>
                Recherchez n&apos;importe quel produit par son nom et obtenez
                les prix de tous les marchands tries du moins cher au plus
                cher.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: '#d1fae5' }}
              >
                <span role="img" aria-label="chart">
                  📊
                </span>
              </div>
              <h3>Historique des prix</h3>
              <p>
                Suivez l&apos;evolution du prix d&apos;un produit dans le temps.
                Savez si c&apos;est le bon moment d&apos;acheter ou s&apos;il
                vaut mieux attendre.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: '#fce7f3' }}
              >
                <span role="img" aria-label="bell">
                  🔔
                </span>
              </div>
              <h3>Alertes de prix</h3>
              <p>
                Definissez un prix cible et recevez une notification quand le
                produit atteint votre prix ideal. Ne ratez plus aucune bonne
                affaire.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: '#ede9fe' }}
              >
                <span role="img" aria-label="globe">
                  🌍
                </span>
              </div>
              <h3>Multi-pays</h3>
              <p>
                Disponible en France et aux Etats-Unis avec les marchands
                locaux de chaque pays. D&apos;autres pays arrivent bientot.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: '#e0f2fe' }}
              >
                <span role="img" aria-label="gift">
                  🎁
                </span>
              </div>
              <h3>100% gratuit</h3>
              <p>
                SaveTide est entierement gratuit. Pas d&apos;abonnement, pas de
                frais caches. Comparez et economisez sans limites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────────── */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Comment ca marche</span>
            <h2>3 etapes, c&apos;est tout</h2>
            <p>
              Trouvez le meilleur prix en quelques secondes.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Scannez ou recherchez</h3>
              <p>
                Scannez le code-barre du produit en magasin ou tapez son nom
                dans la barre de recherche.
              </p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Comparez les prix</h3>
              <p>
                Visualisez les prix de dizaines de marchands tries du moins cher
                au plus cher, en un coup d&apos;oeil.
              </p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Achetez au meilleur prix</h3>
              <p>
                Cliquez sur le marchand de votre choix pour aller directement
                sur la page du produit et finaliser votre achat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Merchants ──────────────────────────────────────── */}
      <section className="merchants" id="merchants">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Marchands</span>
            <h2>Des centaines de marchands compares</h2>
            <p>
              Nous comparons les prix des plus grands marchands en France et
              aux Etats-Unis.
            </p>
          </div>

          <div className="merchants-grid">
            {[
              'Amazon',
              'Fnac',
              'Cdiscount',
              'Darty',
              'Boulanger',
              'Rakuten',
              'E.Leclerc',
              'Carrefour',
              'eBay',
              'Back Market',
              'Walmart',
              'Best Buy',
              'Target',
              'Newegg',
              'Costco',
              'Home Depot',
            ].map((name) => (
              <div key={name} className="merchant-card">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA / Download ─────────────────────────────────── */}
      <section className="cta-section" id="download">
        <h2>Pret a economiser ?</h2>
        <p>
          Telechargez SaveTide gratuitement et commencez a trouver les
          meilleurs prix des aujourd&apos;hui.
        </p>
        <div className="cta-buttons">
          <a
            href="https://testflight.apple.com/join/KAJTdfCK"
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
          >
            <span className="store-icon">🍎</span>
            <span className="store-label">
              <small>Tester sur iOS via</small>
              TestFlight
            </span>
          </a>
          <button className="store-button store-button-disabled" disabled>
            <span className="store-icon">▶️</span>
            <span className="store-label">
              <small>Bientot sur</small>
              Google Play
            </span>
          </button>
        </div>
        <p className="download-note">
          L&apos;application est actuellement en beta. Testez-la gratuitement
          sur iOS via TestFlight.
        </p>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              Save<span>Tide</span>
            </div>
            <p>
              Comparateur de prix intelligent. Scannez, comparez, economisez
              sur tous vos achats.
            </p>
          </div>

          <div className="footer-col">
            <h4>Produit</h4>
            <a href="#features">Fonctionnalites</a>
            <a href="#how-it-works">Comment ca marche</a>
            <a href="#merchants">Marchands</a>
            <a href="#download">Telecharger</a>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <a href="/privacy">Politique de confidentialite</a>
            <a href="/terms">Conditions d&apos;utilisation</a>
            <a href="/mentions">Mentions legales</a>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:contact@savetide.com">contact@savetide.com</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} SaveTide. Tous droits reserves.</span>
          <a href="/privacy">Confidentialite</a>
        </div>
      </footer>
    </>
  );
}
