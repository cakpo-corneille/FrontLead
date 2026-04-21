# Form Builder & Intelligence Artificielle

WiFiLeads propose un éditeur de formulaire puissant couplé à une IA pour maximiser la collecte de données clients.

## 🤖 Génération par IA

Le module IA utilise **Google Genkit** avec le modèle **Gemini 2.5 Flash** pour vous aider à concevoir le formulaire parfait.

### Comment ça marche ?
Dans l'éditeur de formulaire, vous pouvez saisir une description naturelle de vos besoins (ex: *"Je veux collecter les emails des clients et savoir s'ils sont intéressés par nos promotions de week-end"*).

L'IA va alors :
1.  Générer les champs appropriés (types, labels, placeholders).
2.  S'assurer que les contraintes techniques sont respectées (ex: présence obligatoire d'un email ou téléphone).
3.  Suggérer des questions additionnelles pour améliorer l'engagement.

## 🎨 Éditeur Drag-and-Drop

L'éditeur manuel vous permet de personnaliser chaque aspect de votre formulaire :

-   **Champs supportés** : Texte, Email, Téléphone (avec validation internationale), Nombre, Choix multiples (Select), et Booléen (Switch).
-   **Limites** : Pour garantir un taux de conversion optimal, le nombre de champs est limité à **5 par formulaire**.
-   **Personnalisation visuelle** :
    -   Upload de votre logo.
    -   Modification du titre et de la description.
    -   Personnalisation du libellé du bouton d'action.

## 📱 Aperçu Temps Réel

L'éditeur inclut un simulateur mobile qui reflète instantanément vos modifications. Cela vous permet de voir exactement ce que vos clients verront sur leur smartphone lors de la connexion au WiFi.

## 🛠️ Détails Techniques

Les flux d'IA sont situés dans `src/ai/flows/` :
-   `generate-form-from-description.ts` : Transforme une description textuelle en schéma JSON structuré.
-   `suggest-questions-for-conversion.ts` : Analyse le formulaire actuel pour proposer des optimisations.

Le schéma du formulaire est stocké de manière structurée :
```json
{
  "fields": [
    {
      "name": "email_client",
      "label": "Votre Email",
      "type": "email",
      "required": true
    }
  ]
}
```
