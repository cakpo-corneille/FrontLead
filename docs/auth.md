# Architecture & Authentification

Ce document détaille le fonctionnement de l'authentification et la structure globale de l'application WiFiLeads.

## 🔐 Système d'Authentification

L'application utilise un système d'authentification basé sur **JWT (JSON Web Tokens)** géré via le contexte React `AuthContext`.

### Flux d'Authentification

1.  **Connexion / Inscription** : L'utilisateur soumet ses identifiants via `/login` ou `/signup`.
2.  **Stockage des Tokens** : En cas de succès, l'Access Token et le Refresh Token sont stockés dans le `localStorage`.
3.  **Persistance** : Au chargement de l'application, le `AuthProvider` vérifie la présence d'un token et tente de récupérer le profil utilisateur (`/accounts/profile/me/`).
4.  **Rafraîchissement** : Un mécanisme automatique rafraîchit le token via `/api/token/refresh/` en cas d'expiration (erreur 401).

### États de l'Utilisateur

L'application gère plusieurs états de profil pour guider l'utilisateur :
-   **Non authentifié** : Redirection vers `/login`.
-   **Authentifié mais Onboarding incomplet** : Redirection forcée vers `/onboarding`.
-   **Authentifié et Complet** : Accès au `/dashboard`.

## 🏗️ Architecture des Appels API

Tous les appels authentifiés passent par la méthode `fetchWithAuth` définie dans le `AuthContext`.

```typescript
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Ajout automatique du header Authorization: Bearer <token>
  // Gestion automatique du rafraîchissement de token
  // Gestion des erreurs globales
}
```

## 📂 Organisation du Code

-   **`src/contexts/auth-context.tsx`** : Cœur de la logique d'authentification.
-   **`src/app/(auth)/`** : Regroupe toutes les pages liées à l'authentification (Login, Signup, OTP, Reset Password).
-   **`src/app/onboarding/`** : Tunnel de configuration initiale pour les nouveaux utilisateurs.

## 🛡️ Sécurité

-   **Routes Protégées** : Les routes sous `/dashboard` et `/onboarding` sont protégées par le `AuthProvider`.
-   **Vérification OTP** : L'inscription nécessite une validation par code OTP envoyé par email/SMS.
-   **Rotation de Clé** : Les utilisateurs peuvent régénérer leur clé publique d'intégration à tout moment depuis les paramètres d'intégration.
