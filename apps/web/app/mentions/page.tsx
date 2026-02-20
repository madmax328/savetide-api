export default function MentionsLegales() {
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
          Mentions Legales
        </h1>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          Editeur du site
        </h2>
        <p>
          SaveTide
          <br />
          Site web : <a href="https://savetide.com" style={{ color: '#0ea5e9' }}>savetide.com</a>
          <br />
          Email :{' '}
          <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
            contact@savetide.com
          </a>
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          Hebergement
        </h2>
        <p>
          Le site est heberge par :
          <br />
          Vercel Inc.
          <br />
          440 N Bashaw St, Covina, CA 91723, USA
          <br />
          <a href="https://vercel.com" style={{ color: '#0ea5e9' }}>
            vercel.com
          </a>
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          Liens d&apos;affiliation
        </h2>
        <p>
          Ce site et l&apos;application SaveTide contiennent des liens
          d&apos;affiliation. Lorsque vous cliquez sur un lien marchand et
          effectuez un achat, nous pouvons recevoir une commission. Cela
          n&apos;affecte pas le prix que vous payez. Les resultats de
          comparaison de prix sont affiches de maniere objective, du prix le
          plus bas au plus eleve, independamment des commissions
          d&apos;affiliation.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          Propriete intellectuelle
        </h2>
        <p>
          L&apos;ensemble du contenu de ce site (textes, images, logo, code
          source) est protege par le droit de la propriete intellectuelle.
          Toute reproduction, meme partielle, est soumise a autorisation
          prealable.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '32px 0 12px', color: '#0f172a' }}>
          Donnees personnelles
        </h2>
        <p>
          Pour toute information relative au traitement de vos donnees
          personnelles, consultez notre{' '}
          <a href="/privacy" style={{ color: '#0ea5e9' }}>
            Politique de Confidentialite
          </a>
          .
        </p>
      </main>
    </>
  );
}
