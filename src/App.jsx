import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [moto, setMoto] = useState(null)
  const [proprietaire, setProprietaire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    let immat = null

    if (window.location.pathname.includes('/moto/')) {
      immat = window.location.pathname.split('/moto/')[1]
    } else if (window.location.hash.includes('/moto/')) {
      immat = window.location.hash.split('/moto/')[1]
    } else if (window.location.search.includes('immat=')) {
      immat = new URLSearchParams(window.location.search).get('immat')
    }

    if (immat) {
      chargerMoto(immat.toUpperCase().trim())
    } else {
      setErreur("Aucune immatriculation trouvée dans l'URL")
      setLoading(false)
    }
  }, [])

  const chargerMoto = async (immat) => {
    try {
      const { data, error } = await supabase
        .from('motos')
        .select('*, proprietaire:proprietaire_id(nom_complet, ville, telephone)')
        .eq('numero_immat', immat)
        .single()

      if (error || !data) {
        setErreur(`Moto "${immat}" introuvable dans le système`)
        setLoading(false)
        return
      }

      setMoto(data)
      setProprietaire(data.proprietaire)
      setLoading(false)
    } catch (e) {
      setErreur("Erreur de connexion au système")
      setLoading(false)
    }
  }

  // Formater le numéro pour l'appel
  const formaterTelephone = (tel) => {
    if (!tel) return null
    let numero = tel.trim().replaceAll(' ', '').replaceAll('-', '')
    if (!numero.startsWith('+')) {
      if (numero.startsWith('00')) {
        numero = '+' + numero.substring(2)
      } else {
        numero = '+226' + numero
      }
    }
    return numero
  }

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner}></div>
      <p style={{ color: "#8A97B0", marginTop: 16, fontFamily: "Arial" }}>Vérification en cours...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (erreur) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>🏍️</div>
        <h1 style={styles.titre}>Vérificateur d'Engins</h1>
        <p style={styles.sousTitre}>🇧🇫 Burkina Faso</p>
      </div>
      <div style={{ ...styles.card, textAlign: "center", padding: 40, margin: 16 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h2 style={{ color: "#991b1b", fontFamily: "Arial" }}>Moto introuvable</h2>
        <p style={{ color: "#8A97B0", fontFamily: "Arial" }}>{erreur}</p>
      </div>
      <p style={styles.footer}>Vérificateur d'Engins — Burkina Faso</p>
    </div>
  )

  const estVolee = moto.statut === "volée"
  const estNormale = moto.statut === "normal"
  const telFormate = formaterTelephone(proprietaire?.telephone)

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>🏍️</div>
        <h1 style={styles.titre}>Vérificateur d'Engins</h1>
        <p style={styles.sousTitre}>🇧🇫 Burkina Faso</p>
      </div>

      {/* BANNIÈRE STATUT */}
      <div style={{
        background: estVolee
          ? "linear-gradient(135deg, #991b1b, #ef4444)"
          : "linear-gradient(135deg, #065f46, #10b981)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>{estVolee ? "🚨" : "✅"}</div>
        <div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: "bold", fontFamily: "Arial" }}>
            {estVolee ? "MOTO VOLÉE" : "MOTO LÉGALE"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Arial" }}>
            {estVolee
              ? "Signalez immédiatement aux autorités !"
              : "Cette moto est enregistrée et vérifiée"}
          </div>
        </div>
      </div>

      <div style={styles.contenu}>

        {/* PHOTO MOTO */}
        {moto.photo_moto && (
          <img
            src={moto.photo_moto}
            alt="Photo moto"
            style={styles.photo}
          />
        )}

        {/* INFOS MOTO */}
        <div style={styles.card}>
          <h3 style={styles.cardTitre}>🏍️ Informations de la moto</h3>
          <div style={styles.divider} />
          {[
            ["Marque", moto.marque],
            ["Modèle", moto.modele],
            ["Immatriculation", moto.numero_immat],
            ["Couleur", moto.couleur],
            ["Année", String(moto.annee)],
          ].map(([cle, val]) => (
            <div key={cle} style={styles.ligne}>
              <span style={styles.cle}>{cle}</span>
              <span style={{
                ...styles.val,
                fontWeight: cle === "Immatriculation" ? "bold" : "normal",
                color: cle === "Immatriculation" ? "#1A2C5B" : "#374151"
              }}>{val}</span>
            </div>
          ))}
        </div>

        {/* INFOS PROPRIÉTAIRE */}
        <div style={styles.card}>
          <h3 style={styles.cardTitre}>👤 Propriétaire</h3>
          <div style={styles.divider} />
          <div style={styles.ligne}>
            <span style={styles.cle}>Nom</span>
            <span style={styles.val}>{proprietaire?.nom_complet || "Non renseigné"}</span>
          </div>
          <div style={styles.ligne}>
            <span style={styles.cle}>Ville</span>
            <span style={styles.val}>{proprietaire?.ville || "Non renseignée"}</span>
          </div>

          {/* NUMÉRO CLIQUABLE si moto volée */}
          {estVolee && proprietaire?.telephone && telFormate && (
            <a
              href={`tel:${telFormate}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#991b1b",
                borderRadius: 10,
                padding: "12px 16px",
                marginTop: 12,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(153,27,27,0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>📞</span>
                <div>
                  <div style={{ color: "#fff", fontSize: 12, fontFamily: "Arial" }}>
                    Appeler le propriétaire
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Arial" }}>
                    Cliquez pour appeler directement
                  </div>
                </div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.2)",
                padding: "6px 12px",
                borderRadius: 8,
              }}>
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: 14, fontFamily: "Arial" }}>
                  {proprietaire.telephone}
                </span>
              </div>
            </a>
          )}
        </div>

        {/* ALERTE VOLÉE */}
        {estVolee && (
          <div style={{ ...styles.card, background: "#fee2e2", border: "1px solid #fca5a5" }}>
            <h3 style={{ ...styles.cardTitre, color: "#991b1b" }}>⚠️ Que faire ?</h3>
            <div style={styles.divider} />
            {[
              "Ne pas acheter cette moto",
              "Appeler le propriétaire via le bouton ci-dessus",
              "Alerter les forces de l'ordre",
              "Noter le lieu et l'heure de l'observation",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#991b1b" }}>•</span>
                <span style={{ color: "#991b1b", fontFamily: "Arial", fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* CONFIRMATION LÉGALE */}
        {estNormale && (
          <div style={{ ...styles.card, background: "#d1fae5", border: "1px solid #6ee7b7" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 32 }}>✅</span>
              <p style={{ color: "#065f46", fontFamily: "Arial", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Cette moto est enregistrée officiellement dans le système national des engins motorisés du Burkina Faso.
              </p>
            </div>
          </div>
        )}

        {/* DATE VÉRIFICATION */}
        <p style={{ textAlign: "center", color: "#8A97B0", fontSize: 12, fontFamily: "Arial" }}>
          Vérifié le {new Date().toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
          })} à {new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
          })}
        </p>

      </div>

      <p style={styles.footer}>Vérificateur d'Engins — Burkina Faso 🇧🇫</p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F0F4F8; }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F0F4F8",
    fontFamily: "Arial, sans-serif",
    maxWidth: 480,
    margin: "0 auto",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  spinner: {
    width: 48,
    height: 48,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #E8821A",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    background: "linear-gradient(135deg, #1A2C5B, #0D1A3A)",
    padding: "28px 24px 20px",
    textAlign: "center",
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  titre: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    margin: "0 0 8px",
    fontFamily: "Arial",
  },
  sousTitre: {
    color: "#E8821A",
    fontSize: 14,
    margin: 0,
    fontFamily: "Arial",
  },
  contenu: {
    padding: 16,
  },
  photo: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardTitre: {
    color: "#1A2C5B",
    fontSize: 15,
    fontWeight: "bold",
    margin: "0 0 8px",
    fontFamily: "Arial",
  },
  divider: {
    height: 1,
    background: "#f0f4f8",
    margin: "8px 0 12px",
  },
  ligne: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #f8fafc",
  },
  cle: {
    color: "#8A97B0",
    fontSize: 13,
    fontFamily: "Arial",
  },
  val: {
    fontSize: 13,
    fontFamily: "Arial",
    color: "#374151",
  },
  footer: {
    textAlign: "center",
    color: "#8A97B0",
    fontSize: 12,
    padding: "20px 0",
    fontFamily: "Arial",
  }
}
