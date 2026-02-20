export default function Terms() {
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
          Conditions Generales d&apos;Utilisation
        </h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>
          Derniere mise a jour : Fevrier 2026
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          1. Presentation du service
        </h2>
        <p>
          SaveTide est une application mobile de comparaison de prix qui permet
          aux utilisateurs de scanner des codes-barres, rechercher des produits
          et comparer les prix entre differents marchands en ligne.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          2. Gratuite du service
        </h2>
        <p>
          L&apos;utilisation de SaveTide est entierement gratuite. L&apos;application
          se remunere via des commissions d&apos;affiliation versees par les
          marchands partenaires lorsqu&apos;un achat est effectue via nos liens.
          Ces commissions n&apos;affectent en aucun cas les prix affiches.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          3. Exactitude des prix
        </h2>
        <p>
          Les prix affiches dans SaveTide proviennent directement des marchands
          partenaires et sont mis a jour regulierement. Cependant, les prix
          peuvent varier entre le moment de la consultation et le moment de
          l&apos;achat. SaveTide ne peut etre tenu responsable des ecarts de
          prix constates.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          4. Liens vers des sites tiers
        </h2>
        <p>
          SaveTide redirige les utilisateurs vers les sites web des marchands
          pour finaliser leurs achats. Ces sites tiers ont leurs propres
          conditions d&apos;utilisation et politiques de confidentialite.
          SaveTide n&apos;est pas responsable du contenu ou des pratiques de
          ces sites tiers.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          5. Compte utilisateur
        </h2>
        <p>
          La creation d&apos;un compte est optionnelle. Elle permet d&apos;acceder
          aux fonctionnalites de suivi de prix et d&apos;alertes. Vous etes
          responsable de la confidentialite de vos identifiants de connexion.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          6. Propriete intellectuelle
        </h2>
        <p>
          L&apos;application SaveTide, son design, son code source et son
          contenu sont proteges par le droit de la propriete intellectuelle.
          Toute reproduction non autorisee est interdite.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          7. Modification des conditions
        </h2>
        <p>
          SaveTide se reserve le droit de modifier ces conditions a tout
          moment. Les utilisateurs seront informes des modifications
          significatives via l&apos;application.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          8. Contact
        </h2>
        <p>
          Pour toute question :{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
        </p>
      </main>
    </>
  );
}
