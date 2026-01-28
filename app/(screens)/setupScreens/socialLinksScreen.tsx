import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView, AnimatePresence } from "moti";

// Hooks & Components
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { getIconName } from "@/constants/socialLink";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";
import SettingHero from "@/components/Settings/SettingHero";
import NavBar from "@/features/setting/components/navBar";

interface SocialLink {
  id: string;
  title: string;
  url: string;
}

export default function SocialLinksScreen() {
  const router = useRouter();

  const theme = useAppTheme();

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* NAV BAR */}
      <NavBar
        title="Connexions"
        onPress={handleSave}
        isSaving={isSaving}
      />

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
            <SettingHero
              title={`Vos liens\nsociaux.`}
              subtitle="Rassemblez vos univers numériques en un seul lieu pour vos proches."
            />
          }
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 50 }}
              style={[styles.linkRow, { borderBottomColor: theme.border }]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}
              >
                <Icon name={getIconName(item.title)} />
              </View>
              <View style={styles.linkInfo}>
                <ThemedText type="title" style={{ fontSize: 16 }}>
                  {item.title}
                </ThemedText>
                <ThemedText
                  type="caption"
                  colorName="textSecondary"
                  style={{ marginTop: 2 }}
                >
                  {item.url.replace("https://", "")}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => removeLink(item.id)}
                style={styles.removeBtn}
              >
                <Icon name="close-circle-outline" colorName="border" />
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
                    style={[
                      styles.addForm,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      },
                    ]}
                  >
                    <ThemedText
                      type="label"
                      colorName="textSecondary"
                      style={{ marginBottom: 20 }}
                    >
                      NOUVELLE CONNEXION
                    </ThemedText>

                    <TextInput
                      style={[
                        styles.editorialInput,
                        {
                          color: theme.textSecondary,
                          borderBottomColor: theme.border,
                          fontFamily:
                            Platform.OS === "ios" ? "Georgia" : "serif",
                        },
                      ]}
                      placeholder="Plateforme (ex: Instagram)"
                      value={newTitle}
                      onChangeText={setNewTitle}
                      placeholderTextColor={theme.textSecondary}
                      autoFocus
                    />

                    <TextInput
                      style={[
                        styles.editorialInput,
                        {
                          marginTop: 15,
                          color: theme.textSecondary,
                          borderBottomColor: theme.border,
                          fontFamily:
                            Platform.OS === "ios" ? "Georgia" : "serif",
                        },
                      ]}
                      placeholder="URL ou Nom d'utilisateur"
                      value={newUrl}
                      onChangeText={setNewUrl}
                      autoCapitalize="none"
                      placeholderTextColor={theme.textSecondary}
                    />

                    <View style={styles.formActions}>
                      <TouchableOpacity
                        onPress={toggleAddForm}
                        style={styles.cancelLink}
                      >
                        <ThemedText type="caption" colorName="textSecondary">
                          Annuler
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleAddLink}
                        style={[
                          styles.confirmBtn,
                          { backgroundColor: theme.accent },
                          (!newTitle || !newUrl) && styles.disabledBtn,
                        ]}
                        disabled={!newTitle || !newUrl}
                      >
                        <ThemedText type="label" colorName="surface">
                          AJOUTER
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.addBtnRegistry,
                      { borderColor: theme.border },
                    ]}
                    onPress={toggleAddForm}
                    activeOpacity={0.6}
                  >
                    <Icon name="add" size={20} colorName="accent" />
                    <ThemedText type="label" style={{ marginLeft: 8 }}>
                      AJOUTER UN LIEN
                    </ThemedText>
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
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  navBtn: { width: 44, height: 44, justifyContent: "center" },
  saveAction: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  listContent: { paddingHorizontal: 30, paddingBottom: 60 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  linkInfo: { flex: 1, marginLeft: 15 },
  removeBtn: { padding: 5 },
  footerContainer: { marginTop: 30 },
  addBtnRegistry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addForm: {
    padding: 25,
    borderWidth: 1,
    overflow: "hidden",
  },
  editorialInput: {
    fontSize: 16,
    borderBottomWidth: 1,
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
  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
  },
  disabledBtn: { opacity: 0.3 },
});
