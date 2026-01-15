import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mocks
import { MOCK_USERS } from "@/mocks/users.mock";

// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  accent: "#111827",
  border: "rgba(0,0,0,0.06)",
  success: "#10B981",
};

// Simulation : Utilisateur connecté (Luna)
const CURRENT_USER_ID = "user-kevine";

// Simulation : Quelques demandes d'amis (IDs qui ne sont pas dans la liste d'amis de Luna)
const MOCK_REQUESTS_IDS = ["user-sophie", "user-thomas"];

export default function UsersListScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Récupérer l'utilisateur courant
  const currentUser = MOCK_USERS.find((u) => u.id === CURRENT_USER_ID);
  console.log(currentUser);
  const myFriendIds = useMemo(() => currentUser?.friends || [], [currentUser]);
  console.log(myFriendIds);

  // 2. Filtrer les données
  const data = useMemo(() => {
    // A. Cas Recherche : On cherche dans TOUT le monde (sauf soi-même)
    if (searchQuery.length > 0) {
      return {
        mode: "SEARCH",
        items: MOCK_USERS.filter(
          (u) =>
            u.id !== CURRENT_USER_ID &&
            u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      };
    }

    // B. Cas Défaut : Mes Amis + Demandes
    const myFriends = MOCK_USERS.filter((u) => myFriendIds.includes(u.id));
    const myRequests = MOCK_USERS.filter((u) =>
      MOCK_REQUESTS_IDS.includes(u.id)
    );

    return {
      mode: "FRIENDS",
      friends: myFriends,
      requests: myRequests,
    };
  }, [searchQuery, myFriendIds]);

  // --- COMPOSANTS INTERNES ---

  // Carte "Demande d'ami"
  const RequestCard = ({ user }: { user: (typeof MOCK_USERS)[0] }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Image source={{ uri: user.avatarUrl }} style={styles.requestAvatar} />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{user.fullName}</Text>
          <Text style={styles.requestMeta}>
            Souhaite rejoindre votre cercle
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.acceptBtn}>
          <Text style={styles.acceptText}>Accepter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ignoreBtn}>
          <Ionicons name="close" size={18} color={THEME.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Carte "Ami / Utilisateur" (Liste verticale)
  const UserRow = ({
    user,
    isFriend,
  }: {
    user: (typeof MOCK_USERS)[0];
    isFriend?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.userRowContainer}
      onPress={() =>
        router.push({
          pathname: "/profilFriend/[friendId]",
          params: { friendId: user.id },
        })
      }
    >
      <View style={styles.userRowLeft}>
        <Image source={{ uri: user.avatarUrl }} style={styles.rowAvatar} />
        <View style={styles.rowText}>
          <Text style={styles.rowName}>{user.fullName}</Text>
          <Text style={styles.rowHandle}>
            {isFriend ? "Dans votre cercle" : "Utilisateur"}
          </Text>
        </View>
      </View>

      {/* Action contextuelle */}
      <TouchableOpacity
        style={[
          styles.rowActionBtn,
          isFriend ? styles.btnOutline : styles.btnSolid,
        ]}
      >
        {isFriend ? (
          <Text style={styles.btnTextOutline}>Voir</Text>
        ) : (
          <>
            <Text style={styles.btnTextSolid}>Ajouter</Text>
            <Ionicons name="add" size={14} color="#FFF" />
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      {/* HEADER */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>COMMUNAUTÉ</Text>
            <Text style={styles.headerTitle}>Mon Cercle</Text>
          </View>
          <TouchableOpacity style={styles.inviteBtn}>
            <Ionicons name="share-outline" size={22} color={THEME.textMain} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Rechercher un ami ou un membre..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={THEME.textMain}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CAS 1 : MODE RECHERCHE GLOBALE */}
        {data.mode === "SEARCH" ? (
          <>
            <Text style={styles.sectionTitle}>
              Résultats ({data.items?.length})
            </Text>
            {data.items?.map((user) => {
              const isFriend = myFriendIds?.includes(user.id);
              return <UserRow key={user.id} user={user} isFriend={isFriend} />;
            })}
            {data.items?.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text>
              </View>
            )}
          </>
        ) : (
          // CAS 2 : MODE PAR DÉFAUT (AMIS + REQUETES)
          <>
            {/* SECTION DEMANDES (Si existantes) */}
            {data.requests && data.requests.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Demandes</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{data.requests.length}</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.requestsScroll}
                >
                  {data.requests.map((req) => (
                    <RequestCard key={req.id} user={req} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* SECTION LISTE D'AMIS */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Mes Amis ({data.friends?.length})
              </Text>
              {data.friends && data.friends.length > 0 ? (
                data.friends.map((friend) => (
                  <UserRow key={friend.id} user={friend} isFriend={true} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={40} color="#D1D5DB" />
                  <Text style={styles.emptyText}>
                    Votre cercle est encore vide.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      /* Logic invite */
                    }}
                  >
                    <Text style={styles.linkText}>Inviter des amis</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* HEADER */
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: THEME.background,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
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
    fontWeight: "400",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: -0.5,
  },
  inviteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },

  /* SEARCH BAR */
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: THEME.textMain,
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 12, // Default margin if no header container
  },
  badge: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* REQUEST CARDS (Horizontal) */
  requestsScroll: {
    overflow: "visible", // Permet aux ombres de ne pas être coupées
    marginHorizontal: -24, // Pour scroller bord à bord
    paddingHorizontal: 24,
  },
  requestCard: {
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
  },
  requestInfo: { flex: 1 },
  requestName: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textMain,
    marginBottom: 2,
  },
  requestMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: THEME.textMain,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  ignoreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },

  /* USER ROWS (Vertical) */
  userRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  userRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3F4F6",
  },
  rowText: {
    justifyContent: "center",
  },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
    marginBottom: 2,
  },
  rowHandle: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  rowActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btnSolid: {
    backgroundColor: THEME.textMain,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "transparent",
  },
  btnTextSolid: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  btnTextOutline: {
    color: THEME.textMain,
    fontSize: 12,
    fontWeight: "600",
  },

  /* EMPTY STATES */
  emptyState: {
    alignItems: "center",
    marginTop: 40,
    gap: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontStyle: "italic",
  },
  linkText: {
    color: THEME.textMain,
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
