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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { MotiView, AnimatePresence } from "moti";

interface SocialLink {
  id: string;
  title: string;
  url: string;
}

export default function SocialLinksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  // socialLinks est stocké en JSON : [{id, title, url}, ...]
  const [links, setLinks] = useState<SocialLink[]>(user?.socialLinks || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      showErrorToast("Veuillez remplir le titre et l'URL");
      return;
    }

    const newLink: SocialLink = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: newUrl.trim(),
    };

    setLinks([...links, newLink]);
    setNewTitle("");
    setNewUrl("");
    setIsAdding(false);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userService.updateProfile({ socialLinks: links });
      if (res.success) {
        showSuccessToast("Liens mis à jour !");
        await refetch();
        router.back();
      } else {
        showErrorToast(res.message);
      }
    } catch {
      showErrorToast("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liens sociaux</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveBtn}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#111827" />
          ) : (
            <Text style={styles.saveText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={links}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Text style={styles.title}>Vos réseaux & liens</Text>
            <Text style={styles.subtitle}>
              Ajoutez vos profils Instagram, TikTok ou vos sites personnels.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MotiView
            layout={Platform.OS === "ios" ? undefined : undefined}
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.linkCard}
          >
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>{item.title}</Text>
              <Text style={styles.linkUrl} numberOfLines={1}>
                {item.url}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeLink(item.id)}
              style={styles.removeBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </MotiView>
        )}
        ListFooterComponent={
          <AnimatePresence>
            {isAdding ? (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 200 }}
                exit={{ opacity: 0, height: 0 }}
                style={styles.addForm}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Titre (ex: Instagram)"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={styles.input}
                  placeholder="URL (ex: instagram.com/user)"
                  value={newUrl}
                  onChangeText={setNewUrl}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    onPress={() => setIsAdding(false)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddLink}
                    style={styles.confirmBtn}
                  >
                    <Text style={styles.confirmText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setIsAdding(true)}
              >
                <Ionicons name="add" size={24} color="#111827" />
                <Text style={styles.addBtnText}>Ajouter un lien</Text>
              </TouchableOpacity>
            )}
          </AnimatePresence>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FDFBF7",
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  saveBtn: {
    paddingHorizontal: 12,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  infoBox: {
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 13,
    color: "#6B7280",
  },
  removeBtn: {
    padding: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingVertical: 16,
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 10,
    gap: 8,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  addForm: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#111827",
    marginTop: 10,
    gap: 12,
  },
  input: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
