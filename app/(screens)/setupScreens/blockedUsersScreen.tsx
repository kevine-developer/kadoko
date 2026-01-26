
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// Hooks & Components
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast, showCustomAlert } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";

export default function BlockedUsersScreen() {
  const theme = useAppTheme();
  
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
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const renderHeader = () => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={styles.listHeader}
    >
      <ThemedText type="hero">Accès{"\n"}restreints.</ThemedText>
      <View style={[styles.titleDivider, { backgroundColor: theme.accent }]} />
      <ThemedText type="subtitle" colorName="textSecondary">
        Registre des personnes n&apos;ayant plus accès à vos collections et listes privées.
      </ThemedText>
    </MotiView>
  );

  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 300 }}
      style={styles.emptyContainer}
    >
      <View style={[styles.placeholderCircle, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Icon name="shield-outline" size={30} colorName="accent" />
      </View>
      <ThemedText type="title" style={styles.emptyTitle}>Cercle protégé</ThemedText>
      <ThemedText type="subtitle" colorName="textSecondary" style={styles.emptyText}>
        Votre liste de blocage est actuellement vide.
      </ThemedText>
    </MotiView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER NAV */}
      <SettingsNavBar title="Blocage" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.accent} />
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
              style={[styles.userRow, { borderBottomColor: theme.border }]}
            >
              <View style={styles.rowLeft}>
                <Image
                  source={{ uri: item.image || "https://i.pravatar.cc/150" }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.userInfo}>
                  <ThemedText type="title" style={{ fontSize: 16 }}>{item.name}</ThemedText>
                  <ThemedText type="caption" colorName="textSecondary">
                    @{item.username || "utilisateur"}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleUnblock(item)}
                style={styles.ghostActionBtn}
                disabled={processingIds.has(item.id)}
              >
                {processingIds.has(item.id) ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  <ThemedText type="label" colorName="accent">Débloquer</ThemedText>
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
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 30, paddingBottom: 40 },
  listHeader: { marginTop: 20, marginBottom: 40 },
  titleDivider: { width: 35, height: 2, marginVertical: 20 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 15, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 0, backgroundColor: "#F2F2F7" },
  userInfo: { flex: 1 },
  ghostActionBtn: { paddingVertical: 6, paddingLeft: 10 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  placeholderCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
  },
  emptyTitle: { marginBottom: 8 },
  emptyText: { textAlign: "center", paddingHorizontal: 20 },
});