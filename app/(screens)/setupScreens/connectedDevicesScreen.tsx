import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Hooks & Components
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast, showCustomAlert } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";
import NavBar from "@/features/setting/components/navBar";

export default function ConnectedDevicesScreen() {
  const theme = useAppTheme();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await userService.getSessions();
      console.log(
        `[ConnectedDevices] Sessions reçues: ${res.sessions?.length || 0}`,
      );
      if (res.success) {
        setSessions(res.sessions);
      }
    } catch (error) {
      console.error("[ConnectedDevices] Erreur fetchSessions:", error);
      showErrorToast("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = (session: any) => {
    if (session.isCurrent) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    showCustomAlert(
      "Déconnecter cet appareil ?",
      `La session sur cet appareil sera immédiatement invalidée.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            setRevokingId(session.id);
            try {
              const res = await userService.revokeSession(session.id);
              if (res.success) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                showSuccessToast("Appareil déconnecté");
                fetchSessions();
              }
            } catch {
              showErrorToast("Erreur serveur");
            } finally {
              setRevokingId(null);
            }
          },
        },
      ],
    );
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("iphone") ||
      ua.includes("android") ||
      ua.includes("mobile")
    ) {
      return "phone-portrait-outline";
    }
    return "laptop-outline";
  };

  const getDeviceName = (userAgent: string) => {
    if (!userAgent) return "Appareil inconnu";
    if (userAgent.includes("Expo")) return "Application Mobile";
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Chrome")) return "Navigateur Chrome";
    if (userAgent.includes("Safari")) return "Navigateur Safari";
    return "Ordinateur";
  };

  const renderHeader = () => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={styles.listHeader}
    >
      <ThemedText type="hero">Appareils{"\n"}actifs.</ThemedText>
      <View style={[styles.titleDivider, { backgroundColor: theme.accent }]} />
      <ThemedText type="subtitle" colorName="textSecondary">
        Liste des navigateurs et applications actuellement connectés à votre
        compte.
      </ThemedText>
    </MotiView>
  );

  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.emptyContainer}
    >
      <View
        style={[
          styles.placeholderCircle,
          { borderColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        <Icon name="laptop-outline" size={30} colorName="textSecondary" />
      </View>
      <ThemedText type="title" style={styles.emptyTitle}>
        Aucun appareil
      </ThemedText>
      <ThemedText
        type="subtitle"
        colorName="textSecondary"
        style={styles.emptyText}
      >
        Nous n&apos;avons pas pu récupérer la liste de vos sessions actives.
      </ThemedText>
    </MotiView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavBar title="Sécurité" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.accent} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={sessions.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 50 }}
              style={[styles.sessionRow, { borderBottomColor: theme.border }]}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Icon
                    name={getDeviceIcon(item.userAgent || "")}
                    size={22}
                    colorName={item.isCurrent ? "accent" : "textMain"}
                  />
                </View>
                <View style={styles.sessionInfo}>
                  <View style={styles.titleRow}>
                    <ThemedText type="title" style={{ fontSize: 16 }}>
                      {getDeviceName(item.userAgent || "")}
                    </ThemedText>
                    {item.isCurrent && (
                      <View
                        style={[
                          styles.currentBadge,
                          { backgroundColor: theme.accent + "20" },
                        ]}
                      >
                        <ThemedText
                          type="caption"
                          colorName="accent"
                          style={{ fontSize: 9 }}
                        >
                          ACTUEL
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText type="caption" colorName="textSecondary">
                    {item.ipAddress || "IP Inconnue"} • Connecté le{" "}
                    {format(new Date(item.createdAt), "d MMMM", { locale: fr })}
                  </ThemedText>
                </View>
              </View>

              {!item.isCurrent && (
                <TouchableOpacity
                  onPress={() => handleRevoke(item)}
                  style={styles.revokeBtn}
                  disabled={!!revokingId}
                >
                  {revokingId === item.id ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <Icon
                      name="log-out-outline"
                      size={20}
                      colorName="textSecondary"
                    />
                  )}
                </TouchableOpacity>
              )}
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
  listHeader: { marginTop: 20, marginBottom: 40 },
  titleDivider: { width: 35, height: 2, marginVertical: 20 },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 15, flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  sessionInfo: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  revokeBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
  },
  emptyTitle: { marginBottom: 8 },
  emptyText: { textAlign: "center", paddingHorizontal: 20 },
});
