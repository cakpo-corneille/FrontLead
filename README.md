# WiFiLeads (FrontLead)

**WiFiLeads** est une plateforme de WiFi Marketing intelligente conçue pour transformer votre portail captif en un puissant outil de génération de leads et d'analyse client. Grâce à une intégration simple par snippet JavaScript, WiFiLeads permet aux établissements (hôtels, restaurants, cafés, boutiques) de capturer des données clients qualifiées tout en offrant une expérience utilisateur fluide.

## 🚀 Fonctionnalités Clés

- **Génération de Leads par IA** : Créez des formulaires optimisés en décrivant simplement vos besoins. L'IA suggère des questions pertinentes pour maximiser le taux de conversion.
- **Widget d'Intégration Universel** : Un simple script à ajouter à votre portail captif existant (UniFi, Mikrotik, etc.).
- **Tableau de Bord Analytics** : Suivez en temps réel le nombre de prospects, les taux de retour, et identifiez vos clients les plus fidèles.
- **CRM Intégré** : Gérez vos contacts, ajoutez des notes, des tags et exportez vos données en CSV/JSON.
- **Vérification OTP** : Assurez la validité des numéros de téléphone et des emails collectés.
- **Personnalisation Avancée** : Éditeur de formulaire drag-and-drop pour adapter le design à votre image de marque.

## 🛠️ Stack Technique

- **Framework** : [Next.js 15+](https://nextjs.org/) (App Router)
- **Langage** : TypeScript
- **IA** : [Google Genkit](https://firebase.google.com/docs/genkit) avec Gemini 2.5 Flash
- **UI/UX** : Tailwind CSS, Shadcn/UI, Framer Motion
- **Gestion d'état** : React Context API
- **Formulaires** : React Hook Form, Zod
- **Analyses** : Recharts

## 📂 Structure du Projet

```text
src/
├── ai/             # Configuration Genkit et flux d'IA (génération de formulaires)
├── app/            # Routes Next.js (Dashboard, Auth, Onboarding)
├── components/     # Composants UI réutilisables (Landing, Dashboard, UI)
├── contexts/       # Contextes globaux (Authentification, État)
├── hooks/          # Hooks React personnalisés
└── lib/            # Utilitaires, types et constantes
```

## 🗺️ Routes de l'Application

| Route | Description |
| :--- | :--- |
| `/` | Page d'accueil (Hero, Fonctionnalités, Tarifs, FAQ) |
| `/login` | Connexion utilisateur |
| `/signup` | Création de compte |
| `/verify-otp` | Vérification du code OTP après inscription |
| `/forgot-password` | Demande de réinitialisation de mot de passe |
| `/reset-password` | Saisie du nouveau mot de passe |
| `/onboarding` | Tunnel de configuration initiale pour les nouveaux comptes |
| `/dashboard` | Vue d'ensemble : analytics et KPIs |
| `/dashboard/clients` | CRM — gestion et export des leads |
| `/dashboard/form-builder` | Statut et aperçu du formulaire |
| `/dashboard/form-builder/edit` | Éditeur drag-and-drop et génération IA |
| `/dashboard/integration` | Snippet d'intégration et guide routeur |
| `/dashboard/settings` | Paramètres du compte et de l'établissement |

## 📖 Documentation

Une documentation détaillée est disponible pour chaque module dans le dossier [`/docs`](./docs) :

- [**Architecture & Authentification**](./docs/auth.md) : Détails sur le flux JWT et la gestion des sessions.
- [**Intégration Routeur**](./docs/integration.md) : Guide pas à pas pour UniFi, Mikrotik et autres.
- [**Form Builder & IA**](./docs/form-builder.md) : Comment utiliser l'IA pour optimiser vos formulaires.
- [**CRM & Analytics**](./docs/crm-analytics.md) : Guide d'utilisation du tableau de bord.

## ⚙️ Installation et Développement

1. **Cloner le projet** :
   ```bash
   git clone <repository-url>
   cd FrontLead
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :
   Créez un fichier `.env.local` à la racine et ajoutez les clés nécessaires (API Backend, Google AI, etc.).

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5000`.

5. **Lancer l'interface Genkit (IA)** :
   ```bash
   npm run genkit:dev
   ```

## 📄 Licence

Ce projet est la propriété de WiFiLeads. Tous droits réservés.
