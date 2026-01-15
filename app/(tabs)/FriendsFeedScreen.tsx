import RenderFriendCard from "@/components/Friends/renderFriendCard";
import { MOCK_USERS } from "@/mocks/users.mock";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


// Simulation de l'utilisateur connecté (ici Luna)
const CURRENT_USER_ID = "user-kevine";

// --- ECRAN PRINCIPAL ---
export default function UsersListScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // LOGIQUE DE RECHERCHE
  const filteredFriends = useMemo(() => {
    return MOCK_USERS.filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSubtitle}>VOTRE CERCLE</Text>
              <Text style={styles.headerTitle}>Communauté</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="person-add" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR FLOTTANTE */}
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Rechercher un profil..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor="#111827"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* LISTE */}
        <Animated.FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery
                  ? `Résultats (${filteredFriends.length})`
                  : "Membres"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            // Utilisation du composant local stylisé au lieu de renderFriendCard importé
            <RenderFriendCard item={item} index={1} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyText}>Aucun résultat trouvé.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7", // Blanc cassé "Bone" (Thème Luxe)
  },

  /* HEADER */
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: "#FDFBF7",
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "300", // Light pour l'élégance
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", // Serif "Éditorial"
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  /* SEARCH BAR */
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    // Ombre douce "Apple style"
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },

  /* LIST STYLES */
  listContent: {
    paddingHorizontal: 24,
  },
  listHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },


  /* EMPTY STATE */
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 16,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
  },
});
