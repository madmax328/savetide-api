import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialite - SaveTide Extension Chrome',
  description:
    'Politique de confidentialite de l\'extension Chrome SaveTide (PriceWatch). Decouvrez comment nous protegeons vos donnees.',
};

export default function ExtensionPrivacy() {
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
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 12,
            color: '#0f172a',
          }}
        >
          Politique de Confidentialite
        </h1>
        <p
          style={{
            fontSize: 16,
            color: '#0ea5e9',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Extension Chrome - SaveTide (PriceWatch)
        </p>
        <p style={{ color: '#64748b', marginBottom: 32 }}>
          Derniere mise a jour : 14 janvier 2026
        </p>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          1. Introduction
        </h2>
        <p>
          PriceWatch (&quot;nous&quot;, &quot;notre&quot;) respecte votre vie
          privee. Cette politique de confidentialite explique comment notre
          extension Chrome collecte et utilise vos donnees.
        </p>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          2. Donnees collectees
        </h2>
        <p>PriceWatch collecte les informations suivantes :</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            <strong>URLs des pages visitees</strong> : Uniquement pour detecter
            les pages produits et comparer les prix
          </li>
          <li>
            <strong>Historique de recherche local</strong> : Stocke localement
            dans votre navigateur pour afficher vos recherches recentes
          </li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          3. Donnees NON collectees
        </h2>
        <p>PriceWatch ne collecte PAS :</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>Vos informations personnelles (nom, email, adresse)</li>
          <li>Vos mots de passe ou informations de paiement</li>
          <li>Votre historique de navigation complet</li>
          <li>Vos donnees de localisation</li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          4. Utilisation des donnees
        </h2>
        <p>Les donnees collectees sont utilisees uniquement pour :</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>Comparer les prix sur differents marchands</li>
          <li>Afficher les meilleurs prix disponibles</li>
          <li>Sauvegarder votre historique de recherche localement</li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          5. Partage des donnees
        </h2>
        <p>
          <strong>
            Nous ne vendons ni ne partageons vos donnees avec des tiers.
          </strong>
        </p>
        <p>
          Les requetes de comparaison de prix sont envoyees a notre serveur
          backend heberge sur Railway.app uniquement pour effectuer la recherche
          de prix.
        </p>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          6. Stockage des donnees
        </h2>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            <strong>Stockage local</strong> : L&apos;historique de recherche est
            stocke localement dans votre navigateur via chrome.storage.local
          </li>
          <li>
            <strong>Duree de conservation</strong> : Les donnees sont conservees
            jusqu&apos;a ce que vous les supprimiez manuellement ou
            desinstalliez l&apos;extension
          </li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          7. Securite
        </h2>
        <p>
          Nous prenons des mesures raisonnables pour proteger vos donnees contre
          tout acces non autorise. Toutes les communications avec notre backend
          utilisent HTTPS.
        </p>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          8. Vos droits
        </h2>
        <p>Vous avez le droit de :</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            Supprimer votre historique de recherche a tout moment via
            l&apos;extension
          </li>
          <li>
            Desinstaller l&apos;extension pour supprimer toutes les donnees
            locales
          </li>
          <li>
            Nous contacter pour toute question concernant vos donnees
          </li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          9. Services tiers
        </h2>
        <p>PriceWatch utilise :</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            <strong>SerpAPI</strong> : Pour recuperer les resultats de
            comparaison de prix (soumis a leur propre politique de
            confidentialite)
          </li>
          <li>
            <strong>Railway.app</strong> : Pour heberger notre backend API
          </li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          10. Modifications de cette politique
        </h2>
        <p>
          Nous pouvons mettre a jour cette politique de confidentialite
          occasionnellement. Toute modification sera publiee sur cette page avec
          une date de mise a jour actualisee.
        </p>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          11. Contact
        </h2>
        <p>
          Pour toute question concernant cette politique de confidentialite,
          contactez-nous :
        </p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            Email :{' '}
            <a href="mailto:contact@savetide.com" style={{ color: '#0ea5e9' }}>
              contact@savetide.com
            </a>
          </li>
        </ul>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '32px 0 12px',
            color: '#0f172a',
          }}
        >
          12. Conformite RGPD
        </h2>
        <p>Pour les utilisateurs de l&apos;Union Europeenne :</p>
        <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
          <li>
            Nous respectons le RGPD (Reglement General sur la Protection des
            Donnees)
          </li>
          <li>
            Vous avez le droit d&apos;acceder, de rectifier et de supprimer vos
            donnees
          </li>
          <li>
            Nous ne transferons pas vos donnees en dehors de l&apos;UE
          </li>
        </ul>

        <hr
          style={{
            margin: '40px 0',
            border: 'none',
            borderTop: '1px solid #e2e8f0',
          }}
        />
        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: 14,
          }}
        >
          &copy; 2026 SaveTide (PriceWatch). Tous droits reserves.
        </p>
      </main>
    </>
  );
}
