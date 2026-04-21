# CRM & Analytics

Le tableau de bord WiFiLeads vous offre une visibilité complète sur votre audience et vous permet de gérer vos relations clients.

## 📊 Analytics en Temps Réel

Le dashboard principal affiche les indicateurs clés de performance (KPI) :

-   **Total Leads** : Nombre total de contacts uniques collectés.
-   **Leads de la semaine** : Croissance de votre base de données sur les 7 derniers jours.
-   **Taux de Retour** : Pourcentage de clients qui reviennent dans votre établissement.
-   **Graphique d'Affluence** : Visualisation des heures de pointe de collecte sur les dernières 24 heures.
-   **Top Clients** : Liste des clients les plus fidèles basée sur leur fréquence de connexion.

## 👥 Gestion des Clients (CRM)

La page **Clients** est un véritable outil de gestion de la relation client :

### Fonctionnalités du CRM :
-   **Recherche & Filtres** : Retrouvez rapidement un client par son nom, email ou numéro de téléphone.
-   **Segmentation** : Ajoutez des **Tags** personnalisés pour catégoriser vos clients (ex: "VIP", "Habitué", "Promo-Octobre").
-   **Notes Internes** : Ajoutez des commentaires sur le profil d'un client pour un suivi personnalisé.
-   **Statut de Vérification** : Visualisez si l'email ou le téléphone du client a été vérifié via OTP.

### Export de Données
Vous pouvez exporter votre base de données à tout moment aux formats **CSV** ou **JSON** pour l'utiliser dans vos outils de marketing externe (Mailchimp, Sendinblue, etc.).

## 🛡️ Conformité & RGPD

WiFiLeads facilite la gestion de la confidentialité :
-   **Suppression de données** : Vous pouvez supprimer définitivement un profil client à sa demande directement depuis l'interface.
-   **Transparence** : Les données collectées sont limitées à ce que vous avez configuré dans votre formulaire.

## 🛠️ Implémentation
Les données sont récupérées via les endpoints suivants :
-   `/analytics/summary/` : Pour les KPI du dashboard.
-   `/leads/` : Pour la liste paginée et filtrable des clients.
