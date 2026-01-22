import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

export default function PrivateInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  // privateInfo: { clothing: { top, bottom, shoes }, jewelry: { ring, bracelet, necklace }, diet: { allergies, preferences }, delivery: { address } }
  const [privateInfo, setPrivateInfo] = useState<any>(
    user?.privateInfo || {
      clothing: { top: "", bottom: "", shoes: "" },
      jewelry: { ring: "", bracelet: "", necklace: "" },
      diet: { allergies: "", preferences: "" },
      delivery: { address: "" },
    },
  );

  const [isSaving, setIsSaving] = useState(false);

  const updateInfo = (category: string, field: string, value: any) => {
    setPrivateInfo((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userService.updatePrivateInfo(privateInfo);
      if (res.success) {
        showSuccessToast("Informations mises à jour !");
        await refetch();
        router.back();
      } else {
        showErrorToast("Erreur lors de la sauvegarde");
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
        <Text style={styles.headerTitle}>Me connaître</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBox}>
            <Text style={styles.title}>Dites-nous ce que vous aimez</Text>
            <Text style={styles.subtitle}>
              Ces informations aideront vos amis à choisir des cadeaux qui vous
              vont à ravir.
            </Text>
          </View>

          {/* SECTION TAILLES */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shirt-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Tailles & Vêtements</Text>
            </View>
            <View style={styles.inputGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Haut (S, M, L...)</Text>
                <TextInput
                  style={styles.input}
                  value={privateInfo.clothing?.topSize}
                  onChangeText={(t) => updateInfo("clothing", "topSize", t)}
                  placeholder="M"
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Bas (38, 40...)</Text>
                <TextInput
                  style={styles.input}
                  value={privateInfo.clothing?.bottomSize}
                  onChangeText={(t) => updateInfo("clothing", "bottomSize", t)}
                  placeholder="40"
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Chaussures</Text>
                <TextInput
                  style={styles.input}
                  value={privateInfo.clothing?.shoeSize}
                  onChangeText={(t) => updateInfo("clothing", "shoeSize", t)}
                  placeholder="42"
                />
              </View>
            </View>
          </View>

          {/* SECTION BIJOUX */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Accessoires & Bijoux</Text>
            </View>
            <View style={styles.inputGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Taille Bague (52, 54...)</Text>
                <TextInput
                  style={styles.input}
                  value={privateInfo.jewelry?.ringSize}
                  onChangeText={(t) => updateInfo("jewelry", "ringSize", t)}
                  placeholder="54"
                />
              </View>
              <View style={[styles.gridItem, { flex: 2 }]}>
                <Text style={styles.label}>Préférence Métal</Text>
                <View style={styles.preferenceRow}>
                  {["OR", "ARGENT", "LES DEUX"].map((pref) => {
                    const valueMap: any = {
                      OR: "GOLD",
                      ARGENT: "SILVER",
                      "LES DEUX": "BOTH",
                    };
                    const isSelected =
                      privateInfo.jewelry?.preference === valueMap[pref];
                    return (
                      <TouchableOpacity
                        key={pref}
                        onPress={() =>
                          updateInfo("jewelry", "preference", valueMap[pref])
                        }
                        style={[
                          styles.prefBtn,
                          isSelected && styles.prefBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.prefText,
                            isSelected && styles.prefTextActive,
                          ]}
                        >
                          {pref}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* SECTION ALIMENTATION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Alimentation</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Allergies ou régimes spécifiques (séparés par une virgule)
              </Text>
              <TextInput
                style={styles.input}
                value={
                  Array.isArray(privateInfo.diet?.allergies)
                    ? privateInfo.diet.allergies.join(", ")
                    : ""
                }
                onChangeText={(t) =>
                  updateInfo(
                    "diet",
                    "allergies",
                    t.split(",").map((s) => s.trim()),
                  )
                }
                placeholder="Ex: Gluten, Arachides..."
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Préférences (ce que vous adorez)</Text>
              <TextInput
                style={styles.input}
                value={
                  Array.isArray(privateInfo.diet?.preferences)
                    ? privateInfo.diet.preferences.join(", ")
                    : ""
                }
                onChangeText={(t) =>
                  updateInfo(
                    "diet",
                    "preferences",
                    t.split(",").map((s) => s.trim()),
                  )
                }
                placeholder="Ex: Chocolat, Thé..."
              />
            </View>
          </View>

          {/* SECTION LIVRAISON */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color="#111827" />
              <Text style={styles.sectionTitle}>Adresse de livraison</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Où envoyer vos cadeaux ?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={privateInfo.delivery?.address}
                onChangeText={(t) => updateInfo("delivery", "address", t)}
                placeholder="Numéro, rue, code postal, ville..."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
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
  section: {
    marginBottom: 32,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  inputGrid: {
    flexDirection: "row",
    gap: 12,
  },
  gridItem: {
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  preferenceRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  prefBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  prefBtnActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  prefText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  prefTextActive: {
    color: "#FFF",
  },
});
