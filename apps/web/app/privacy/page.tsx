export default function Privacy() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="nav-logo">
            Save<span>Tide</span>
          </a>
          <div className="nav-links">
            <a href="/#features">Fonctionnalites</a>
            <a href="/#download" className="nav-cta">
              Telecharger
            </a>
          </div>
        </div>
      </nav>

      <main
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '120px 24px 80px',
          lineHeight: 1.8,
          color: '#334155',
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, color: '#0f172a' }}>
          Politique de Confidentialite
        </h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>
          Derniere mise a jour : Fevrier 2026
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          1. Donnees collectees
        </h2>
        <p>
          SaveTide collecte les donnees suivantes pour le fonctionnement du service :
        </p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>Adresse email et nom (lors de la creation de compte)</li>
          <li>Historique de recherche de produits (stocke localement sur votre appareil)</li>
          <li>Produits suivis et alertes de prix (si vous utilisez cette fonctionnalite)</li>
          <li>Pays de residence (pour afficher les marchands pertinents)</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          2. Utilisation des donnees
        </h2>
        <p>
          Vos donnees sont utilisees exclusivement pour :
        </p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>Fournir les resultats de comparaison de prix</li>
          <li>Envoyer des alertes de prix sur les produits que vous suivez</li>
          <li>Ameliorer la qualite du service</li>
        </ul>
        <p>
          Nous ne vendons jamais vos donnees a des tiers. Nous ne partageons
          pas vos informations personnelles avec des annonceurs.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          3. Liens d&apos;affiliation
        </h2>
        <p>
          SaveTide utilise des liens d&apos;affiliation. Lorsque vous cliquez
          sur un lien vers un marchand et effectuez un achat, nous pouvons
          recevoir une commission de la part du marchand. Cela n&apos;affecte
          pas le prix que vous payez. Les prix affiches sont toujours les prix
          reels du marchand.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          4. Cookies et traceurs
        </h2>
        <p>
          L&apos;application mobile SaveTide n&apos;utilise pas de cookies.
          Le site web savetide.com utilise uniquement des cookies techniques
          necessaires au fonctionnement du site.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          5. Securite
        </h2>
        <p>
          Vos donnees sont protegees par chiffrement en transit (HTTPS/TLS) et
          au repos. Les mots de passe sont haches avec bcrypt et ne sont jamais
          stockes en clair.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          6. Vos droits (RGPD)
        </h2>
        <p>
          Conformement au RGPD, vous disposez d&apos;un droit d&apos;acces, de
          rectification et de suppression de vos donnees personnelles. Pour
          exercer ces droits, contactez-nous a{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
          .
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          7. Contact
        </h2>
        <p>
          Pour toute question relative a la protection de vos donnees :
          <br />
          Email :{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
        </p>
      </main>
    </>
  );
}
