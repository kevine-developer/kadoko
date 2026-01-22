# Utiliser une image Node officielle
FROM node:20

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
# Note: On installe globalement expo-cli si besoin, mais npx est préféré
RUN npm install

# Copier le reste du code
COPY . .

# Exposer les ports nécessaires pour Expo / Metro
# 8081: Metro Bundler
# 19000, 19001, 19002: Anciens ports Expo (pour rétrocompatibilité)
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Commande par défaut pour lancer le serveur Expo
# On utilise --lan ou --tunnel selon les besoins
CMD ["npx", "expo", "start", "--dev-client"]
