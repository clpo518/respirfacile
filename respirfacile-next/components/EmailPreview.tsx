import React from "react";

interface EmailPreviewProps {
  recipientName?: string;
  therapistName?: string;
  invitationLink?: string;
  invitationCode?: string;
}

export function EmailPreview({
  recipientName = "Jean",
  therapistName = "Dr. Dupont",
  invitationLink = "https://respirfacile.fr/auth?code=PRO-ABC123",
  invitationCode = "PRO-ABC123",
}: EmailPreviewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Email Preview Container */}
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: "#2D5016",
            padding: "40px 20px",
            textAlign: "center" as const,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🫁
            </div>
            <h1
              style={{
                color: "#FFF",
                margin: 0,
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              Respir<span style={{ color: "#8B4513" }}>facile</span>
            </h1>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "40px 30px", backgroundColor: "#F5F0E8" }}>
          {/* Greeting */}
          <p
            style={{
              fontSize: "18px",
              color: "#2D5016",
              fontWeight: "600",
              margin: "0 0 20px 0",
            }}
          >
            Bonjour {recipientName},
          </p>

          {/* Main message */}
          <p
            style={{
              fontSize: "16px",
              color: "#3D4420",
              lineHeight: "1.6",
              margin: "0 0 20px 0",
            }}
          >
            {therapistName} vous a invité à rejoindre <strong>Respirfacile</strong>, l'application de rééducation respiratoire adaptée aux patients SAOS et TMOF.
          </p>

          {/* Benefits section */}
          <div
            style={{
              backgroundColor: "#FFF",
              border: "1px solid #E8DDD2",
              borderRadius: "12px",
              padding: "24px",
              margin: "30px 0",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#2D5016",
                fontWeight: "600",
                margin: "0 0 16px 0",
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
              }}
            >
              Ce qui vous attend
            </p>
            <ul
              style={{
                margin: "0",
                padding: "0",
                listStyle: "none",
              }}
            >
              {[
                "🎯 Séances guidées pas à pas avec timer intégré",
                "📈 Suivi de votre progression semaine par semaine",
                "🏅 Badges et jalons pour célébrer votre engagement",
                "📞 Contact direct avec votre orthophoniste dans l'app",
              ].map((benefit, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: "14px",
                    color: "#3D4420",
                    marginBottom: "12px",
                    paddingLeft: "0",
                  }}
                >
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center" as const, margin: "30px 0" }}>
            <a
              href={invitationLink}
              style={{
                display: "inline-block",
                backgroundColor: "#2D5016",
                color: "#F5F0E8",
                padding: "14px 32px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "16px",
                transition: "background-color 0.2s",
              }}
            >
              Rejoindre Respirfacile
            </a>
          </div>

          {/* Code alternative */}
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              textAlign: "center" as const,
              margin: "20px 0",
            }}
          >
            Ou entrez le code: <code style={{ fontSize: "16px", fontWeight: "bold", color: "#2D5016" }}>{invitationCode}</code>
          </p>

          {/* Info section */}
          <div
            style={{
              backgroundColor: "#F5DEB3",
              border: "1px solid #D4A574",
              borderRadius: "12px",
              padding: "16px",
              margin: "30px 0",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#5C4033",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              <strong>Important :</strong> Respirfacile est un complément au suivi médical, pas un remplaçant. Si vous avez une apnée du sommeil diagnostiquée, continuez votre traitement habituel (CPAP, appareillage, etc.).
            </p>
          </div>

          {/* Closing */}
          <p
            style={{
              fontSize: "16px",
              color: "#3D4420",
              lineHeight: "1.6",
              margin: "30px 0 0 0",
            }}
          >
            Des questions ? {therapistName} est là pour vous aider.
          </p>

          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: "16px 0 0 0",
            }}
          >
            À bientôt,<br />
            L'équipe Respirfacile
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#2D5016",
            color: "#F5F0E8",
            padding: "30px",
            textAlign: "center" as const,
            fontSize: "12px",
            lineHeight: "1.6",
          }}
        >
          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Respirfacile</strong>, Application de rééducation respiratoire
          </p>
          <p style={{ margin: "0 0 10px 0" }}>
            <a
              href="https://respirfacile.fr"
              style={{ color: "#8B4513", textDecoration: "none", fontWeight: "600" }}
            >
              respirfacile.fr
            </a>
          </p>
          <p style={{ margin: "0", color: "#B8B8B8", fontSize: "11px" }}>
            © 2026 Respirfacile. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant de démonstration pour visualiser l'email de bienvenue
 * Usage: <EmailPreviewDemo />
 */
export function EmailPreviewDemo() {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest-800 mb-2">
            Aperçu Email de Bienvenue
          </h1>
          <p className="text-forest-500">
            Exemple de l'email envoyé aux patients invités par leur orthophoniste
          </p>
        </div>

        {/* Desktop View */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-forest-700 mb-4">
            📱 Vue Desktop (Gmail, Outlook, etc.)
          </p>
          <EmailPreview
            recipientName="Alice"
            therapistName="Dr. Marie Lefebvre"
            invitationCode="PRO-MRF2026"
            invitationLink="https://respirfacile.fr/auth?code=PRO-MRF2026"
          />
        </div>

        {/* Mobile View Simulation */}
        <div>
          <p className="text-sm font-semibold text-forest-700 mb-4">
            📲 Vue Mobile (approximation)
          </p>
          <div
            style={{
              maxWidth: "375px",
              margin: "0 auto",
              border: "10px solid #333",
              borderRadius: "30px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <EmailPreview
              recipientName="Thomas"
              therapistName="Dr. Jean Dupont"
              invitationCode="PRO-JD2026"
              invitationLink="https://respirfacile.fr/auth?code=PRO-JD2026"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
