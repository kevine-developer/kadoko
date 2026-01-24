import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast, showCustomAlert } from "@/lib/toast";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Papier / Bone
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.05)",
  danger: "#C34A4A",
};

export default function BlockedUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchBlockedUsers = async () => {
    try {
      const res = await userService.getBlockedUsers();
      if (res.success) {
        setBlockedUsers(res.users);
      }
    } catch {
      showErrorToast("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = (user: any) => {
    if (processingIds.has(user.id)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showCustomAlert(
      "Rétablir l'accès ?",
      `Voulez-vous autoriser ${user.name} à consulter de nouveau votre profil ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Débloquer",
          onPress: async () => {
            setProcessingIds((prev) => new Set(prev).add(user.id));
            try {
              const res = await userService.unblockUser(user.id);
              if (res.success) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                showSuccessToast("Accès rétabli");
                fetchBlockedUsers();
              }
            } catch {
              showErrorToast("Erreur serveur");
            } finally {
              setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(user.id);
                return next;
              });
            }
          },
        },
      ],
    );
  };

  // --- RENDERS ---

  const renderHeader = () => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={styles.listHeader}
    >
      <Text style={styles.heroTitle}>Accès{"\n"}restreints.</Text>
      <View style={styles.titleDivider} />
      <Text style={styles.heroSubtitle}>
        Registre des personnes n&apos;ayant plus accès à vos collections et
        listes privées.
      </Text>
    </MotiView>
  );

  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 300 }}
      style={styles.emptyContainer}
    >
      <View style={styles.placeholderCircle}>
        <Ionicons name="shield-outline" size={30} color={THEME.accent} />
      </View>
      <Text style={styles.emptyTitle}>Cercle protégé</Text>
      <Text style={styles.emptyText}>
        Votre liste de blocage est actuellement vide.
      </Text>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      {/* HEADER NAV */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>CONFIDENTIALITÉ</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={THEME.accent} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={blockedUsers.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 50 }}
              style={styles.userRow}
            >
              <View style={styles.rowLeft}>
                <Image
                  source={{ uri: item.image || "https://i.pravatar.cc/150" }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userHandle}>
                    @{item.username || "utilisateur"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleUnblock(item)}
                style={styles.ghostActionBtn}
                disabled={processingIds.has(item.id)}
              >
                {processingIds.has(item.id) ? (
                  <ActivityIndicator size="small" color={THEME.accent} />
                ) : (
                  <Text style={styles.ghostActionText}>DÉBLOQUER</Text>
                )}
              </TouchableOpacity>
            </MotiView>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* NAVBAR */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },

  /* LIST CONTENT */
  listContent: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  listHeader: {
    marginTop: 20,
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 40,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 44,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    backgroundColor: THEME.accent,
    marginVertical: 20,
  },
  heroSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* USER ROW - STYLE REGISTRE */
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F2F2F7",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  userHandle: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  /* ACTION BUTTON - GHOST STYLE */
  ghostActionBtn: {
    paddingVertical: 6,
    paddingLeft: 10,
  },
  ghostActionText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
  },

  /* EMPTY STATE */
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  placeholderCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textMain,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
