Mailist — Front-end prototype

Contenu:
- index.html : page unique avec onglets "Nouvelle campagne" et "Campagnes"
- style.css : styles de base
- app.js : logique front-end (utilise localStorage pour simuler back-end)

Comment tester (Windows PowerShell):

1. Ouvrir le dossier `site` dans l'explorateur de fichiers.
2. Double-cliquer sur `index.html` pour l'ouvrir dans votre navigateur, ou lancer :

   Start-Process .\site\index.html

3. Utilisation :
   - Onglet "Nouvelle campagne" : saisir un objet, composer le message (éditeur riche), ajouter des contacts (coller une liste d'emails), ajouter des relances, planifier si besoin et cliquer sur "Enregistrer la campagne".
   - Onglet "Campagnes" : voir les campagnes sauvegardées, mettre en pause/reprendre et marquer comme terminé.

Limites :
- Prototype front-end uniquement; aucune action d'envoi n'est réalisée.
- Les données sont stockées localement dans le navigateur (localStorage).

Prochaines étapes recommandées :
- connecter à un backend pour stocker les campagnes et effectuer les envois
- ajouter validation de format des emails et gestion avancée des relances
- ajouter tests unitaires pour la logique côté client
