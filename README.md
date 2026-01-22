# Kadoko Native App 🎁

Application mobile de gestion de listes de cadeaux et partages, propulsée par Expo et React Native.

## 🚀 Fonctionnalités Clés

- **Authentification Sécurisée** : Intégration complète avec Better-Auth.
- **Vérification Flexible** : Inscription avec validation par code OTP (email) gérée par une modal in-app.
- **Réinitialisation de Mot de Passe** : Flux complet de "Mot de passe oublié" intégré.
- **Profil Utilisateur** : Édition de profil dédiée, changement d'avatar et gestion du nom d'utilisateur unique.
- **Expérience Utilisateur (UX) Maximisée** :
  - Validation des formulaires en temps réel.
  - Gestion des erreurs serveur "inline" (plus de toasts intrusifs).
- **Sécurité de Compte** : Suppression de compte sécurisée exigeant le mot de passe et l'OTP (si non vérifié).

## 🛠 Installation & Lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer l'environnement** :
   Créez un fichier `.env` à la racine de `apps/native` avec :
   ```env
   EXPO_PUBLIC_API_URL=http://votre-ip:3000
   ```

3. **Lancer l'application** :
   ```bash
   npx expo start
   ```

## 📂 Structure du Projet

- `app/` : Routes Expo Router (Auth, Tabs, Screens).
- `components/` : Composants UI réutilisables (Auth, Profil, Settings).
- `lib/` : Services API, gestion de l'état et utilitaires.
- `assets/` : Images et polices personnalisées.

## 📚 En savoir plus

- [Expo Documentation](https://docs.expo.dev/)
- [Better-Auth Client](https://www.better-auth.com/)
