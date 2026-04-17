# Guide d'Intégration Routeur

WiFiLeads est conçu pour s'intégrer de manière transparente à n'importe quel portail captif supportant l'injection de JavaScript.

## 🛠️ Méthode d'Intégration

L'intégration repose sur un **Snippet JavaScript** unique généré pour chaque établissement.

### 1. Récupération du Snippet

Rendez-vous dans votre tableau de bord sous l'onglet **Intégration**. Vous y trouverez un code similaire à celui-ci :

```html
<script 
  src="https://api.wifileads.io/static/widget.js" 
  data-public-key="VOTRE_CLE_PUBLIQUE" 
  data-mac="$(mac)">
</script>
```

### 2. Installation sur le Portail Captif

#### Pour UniFi (Ubiquiti)
1.  Accédez à votre contrôleur UniFi.
2.  Allez dans **Settings > Guest Control**.
3.  Activez le **Portal Customization**.
4.  Éditez le fichier `index.html` ou `login.html` de votre portail.
5.  Collez le snippet juste avant la balise de fermeture `</body>`.

#### Pour Mikrotik
1.  Ouvrez **WinBox** et allez dans **Files**.
2.  Téléchargez le dossier `hotspot`.
3.  Éditez le fichier `login.html`.
4.  Insérez le snippet WiFiLeads.
5.  Renvoyez le fichier sur le routeur.

## 🌐 Configuration du Walled Garden (Liste Blanche)

Pour que le widget puisse se charger avant que l'utilisateur ne soit authentifié, vous **devez** autoriser les domaines suivants dans votre configuration "Walled Garden" ou "Pre-Auth Access" :

| Type | Domaine à autoriser |
| :--- | :--- |
| **API & Script** | `api.wifileads.io` (ou votre host personnalisé) |
| **Médias (Images)** | `media.wifileads.io` |

> [!IMPORTANT]
> Sans cette configuration, le navigateur de l'utilisateur bloquera le chargement du script WiFiLeads et le formulaire ne s'affichera pas.

## 🔄 Rotation de la Clé de Sécurité

Si vous suspectez que votre clé publique a été compromise, vous pouvez la régénérer dans l'onglet **Intégration**. 
**Attention** : Une fois la clé régénérée, l'ancien snippet cessera de fonctionner immédiatement. Vous devrez mettre à jour le code sur votre portail captif.

## 🧪 Validation de l'Installation

1.  Connectez-vous au réseau WiFi avec un **nouvel appareil**.
2.  Le portail captif doit s'ouvrir automatiquement.
3.  L'overlay WiFiLeads doit apparaître par-dessus votre portail.
4.  Remplissez le formulaire pour vérifier que les données remontent bien dans votre dashboard.
