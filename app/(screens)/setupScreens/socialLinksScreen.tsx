import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView, AnimatePresence } from "moti";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  danger: "#C34A4A",
};

interface SocialLink {
  id: string;
  title: string;
  url: string;
}

const getIconName = (title: string): any => {
  const lower = title.toLowerCase();
  if (lower.includes("instagram")) return "logo-instagram";
  if (lower.includes("twitter") || lower.includes("x")) return "logo-twitter";
  if (lower.includes("tiktok")) return "logo-tiktok";
  if (lower.includes("facebook")) return "logo-facebook";
  if (lower.includes("linkedin")) return "logo-linkedin";
  if (lower.includes("youtube")) return "logo-youtube";
  return "link-outline";
};

export default function SocialLinksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const [links, setLinks] = useState<SocialLink[]>(user?.socialLinks || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleAddForm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAdding(!isAdding);
  };

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newLink: SocialLink = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: newUrl.trim().toLowerCase().startsWith("http")
        ? newUrl.trim()
        : `https://${newUrl.trim()}`,
    };

    setLinks([...links, newLink]);
    setNewTitle("");
    setNewUrl("");
    setIsAdding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const removeLink = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userService.updateProfile({ socialLinks: links });
      if (res.success) {
        showSuccessToast("Connexions enregistrées");
        await refetch();
        router.back();
      }
    } catch {
      showErrorToast("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* NAV BAR */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>CONNEXIONS</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveAction}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={THEME.accent} />
          ) : (
            <Text style={styles.saveActionText}>OK</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={links}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Vos liens{"\n"}sociaux.</Text>
              <View style={styles.titleDivider} />
              <Text style={styles.heroSubtitle}>
                Rassemblez vos univers numériques en un seul lieu pour vos
                proches.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 50 }}
              style={styles.linkRow}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={getIconName(item.title)}
                  size={18}
                  color={THEME.accent}
                />
              </View>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>{item.title}</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {item.url.replace("https://", "")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeLink(item.id)}
                style={styles.removeBtn}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={THEME.border}
                />
              </TouchableOpacity>
            </MotiView>
          )}
          ListFooterComponent={
            <View style={styles.footerContainer}>
              <AnimatePresence>
                {isAdding ? (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={styles.addForm}
                  >
                    <Text style={styles.miniLabel}>NOUVELLE CONNEXION</Text>

                    <TextInput
                      style={styles.editorialInput}
                      placeholder="Plateforme (ex: Instagram)"
                      value={newTitle}
                      onChangeText={setNewTitle}
                      placeholderTextColor="#BCBCBC"
                      autoFocus
                    />

                    <TextInput
                      style={[styles.editorialInput, { marginTop: 15 }]}
                      placeholder="URL ou Nom d'utilisateur"
                      value={newUrl}
                      onChangeText={setNewUrl}
                      autoCapitalize="none"
                      placeholderTextColor="#BCBCBC"
                    />

                    <View style={styles.formActions}>
                      <TouchableOpacity
                        onPress={toggleAddForm}
                        style={styles.cancelLink}
                      >
                        <Text style={styles.cancelText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleAddLink}
                        style={[
                          styles.confirmBtn,
                          (!newTitle || !newUrl) && styles.disabledBtn,
                        ]}
                        disabled={!newTitle || !newUrl}
                      >
                        <Text style={styles.confirmText}>AJOUTER</Text>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtnRegistry}
                    onPress={toggleAddForm}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="add" size={20} color={THEME.accent} />
                    <Text style={styles.addBtnText}>AJOUTER UN LIEN</Text>
                  </TouchableOpacity>
                )}
              </AnimatePresence>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },

  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },
  navBtn: { width: 44, height: 44, justifyContent: "center" },
  saveAction: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  saveActionText: { fontSize: 14, fontWeight: "800", color: THEME.accent },

  /* CONTENT */
  listContent: { paddingHorizontal: 30, paddingBottom: 60 },
  heroSection: { marginTop: 20, marginBottom: 40 },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 44,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    backgroundColor: THEME.accent,
    marginVertical: 25,
  },
  heroSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* REGISTRY ROW */
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  linkInfo: { flex: 1, marginLeft: 15 },
  linkTitle: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  linkUrl: { fontSize: 12, color: THEME.textSecondary, marginTop: 2 },
  removeBtn: { padding: 5 },

  /* FOOTER & BUTTONS */
  footerContainer: { marginTop: 30 },
  addBtnRegistry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: THEME.border,
    borderStyle: "dashed",
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
    marginLeft: 8,
  },

  /* ADD FORM */
  addForm: {
    backgroundColor: "#FFF",
    padding: 25,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  editorialInput: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingVertical: 8,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 25,
    gap: 20,
  },
  cancelLink: { paddingVertical: 10 },
  cancelText: { fontSize: 12, color: THEME.textSecondary, fontWeight: "600" },
  confirmBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  confirmText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  disabledBtn: { opacity: 0.3 },
});
