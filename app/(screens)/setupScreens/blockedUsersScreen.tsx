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
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";
import SettingHero from "@/components/Settings/SettingHero";
import EmptyContent from "@/components/EmptyContent";

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

  const renderHeader = () => (
    <SettingHero
      title={`Accès\nrestreints`}
      subtitle="Registre des personnes n'ayant plus accès à vos collections et listes privées."
    />
  );

  const renderEmptyState = () => (
    <EmptyContent
      title="Cercle protégé"
      subtitle="Votre liste de blocage est actuellement vide."
      icon="shield-outline"
    />
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
                  <ThemedText type="title" style={{ fontSize: 16 }}>
                    {item.name}
                  </ThemedText>
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
                  <ThemedText type="label" colorName="accent">
                    Débloquer
                  </ThemedText>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 30, paddingBottom: 40 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 15, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
  },
  userInfo: { flex: 1 },
  ghostActionBtn: { paddingVertical: 6, paddingLeft: 10 },
});
