import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
  Keyboard,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { userService, type PrivateInfo } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import * as Haptics from "expo-haptics";

// Activer LayoutAnimation sur Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.08)",
};

// --- DATA ---
const CLOTHING_SIZES = {
  top: ["XS", "S", "M", "L", "XL", "XXL"],
  bottom: ["34", "36", "38", "40", "42", "44", "46", "48"],
  shoe: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
};

const JEWELRY_PREFERENCES = [
  { value: "GOLD", label: "Or" },
  { value: "SILVER", label: "Argent" },
  { value: "BOTH", label: "Les deux" },
  { value: "NONE", label: "Aucune" },
];

const DELIVERY_TYPES = [
  { value: "HOME", label: "Domicile", icon: "home-outline" },
  { value: "RELAY", label: "Relais", icon: "cube-outline" },
  { value: "OFFICE", label: "Bureau", icon: "business-outline" },
];

export default function PrivateInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const [saving, setSaving] = useState(false);

  // Gestion simple de l'accordéon
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "clothing",
  );

  const [formData, setFormData] = useState<PrivateInfo>({
    clothing: {},
    jewelry: {},
    diet: { allergies: [], preferences: [] },
    delivery: { address: {} },
  });

  useEffect(() => {
    if (user?.privateInfo) {
      setFormData((prev) => ({
        ...prev,
        ...user.privateInfo,
        clothing: { ...prev.clothing, ...(user.privateInfo.clothing || {}) },
        jewelry: { ...prev.jewelry, ...(user.privateInfo.jewelry || {}) },
        diet: {
          allergies:
            user.privateInfo.diet?.allergies || prev.diet?.allergies || [],
          preferences:
            user.privateInfo.diet?.preferences || prev.diet?.preferences || [],
        },
        delivery: {
          ...prev.delivery,
          ...(user.privateInfo.delivery || {}),
          address: {
            ...(prev.delivery?.address || {}),
            ...(user.privateInfo.delivery?.address || {}),
          },
        },
      }));

      // UX: Ouvrir la première section qui a du contenu si on n'a rien touché
      const hasClothing = Object.values(user.privateInfo.clothing || {}).some(
        (v) => !!v,
      );
      const hasJewelry = Object.values(user.privateInfo.jewelry || {}).some(
        (v) => !!v,
      );
      const hasDiet =
        (user.privateInfo.diet?.allergies?.length || 0) > 0 ||
        (user.privateInfo.diet?.preferences?.length || 0) > 0;
      const hasDelivery = Object.values(
        user.privateInfo.delivery?.address || {},
      ).some((v) => !!v);

      if (hasClothing) setExpandedSection("clothing");
      else if (hasJewelry) setExpandedSection("jewelry");
      else if (hasDiet) setExpandedSection("diet");
      else if (hasDelivery) setExpandedSection("delivery");
    }
  }, [user?.privateInfo]);

  // ✅ CORRECTION DU TOGGLE
  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    // Animation native fluide
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const res = await userService.updatePrivateInfo(formData);
      if (res.success) {
        showSuccessToast("Profil mis à jour");
        await refetch();
        router.back();
      }
    } catch {
      showErrorToast("Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateNested = (
    category: keyof PrivateInfo,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [field]: value },
    }));
  };

  return (
    <View style={styles.container}>
      {/* NAV BAR */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>CARNET DE MESURES</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={styles.saveAction}
        >
          {saving ? (
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Vos détails{"\n"}confidentiels.
            </Text>
            <View style={styles.titleDivider} />
            <Text style={styles.heroSubtitle}>
              Ces informations permettent à vos proches de viser juste, en toute
              discrétion.
            </Text>
          </View>

          {/* ✅ UTILISATION DIRECTE (Plus de composant wrapper complexe pour éviter les bugs) */}

          {/* SECTION GARDE-ROBE */}
          <View style={styles.registryBlock}>
            <TouchableOpacity
              style={styles.registryHeader}
              onPress={() => toggleSection("clothing")}
            >
              <View style={styles.row}>
                <Ionicons
                  name="shirt-outline"
                  size={20}
                  color={THEME.accent}
                  style={{ marginRight: 15 }}
                />
                <Text style={styles.registryTitle}>Garde-robe</Text>
              </View>
              <Ionicons
                name={expandedSection === "clothing" ? "remove" : "add"}
                size={20}
                color={THEME.textSecondary}
              />
            </TouchableOpacity>

            {expandedSection === "clothing" && (
              <View style={styles.registryContent}>
                <SizeSelector
                  label="HAUTS / VESTES"
                  options={CLOTHING_SIZES.top}
                  selected={formData.clothing?.topSize}
                  onSelect={(v) => updateNested("clothing", "topSize", v)}
                />
                <SizeSelector
                  label="BAS / PANTALONS"
                  options={CLOTHING_SIZES.bottom}
                  selected={formData.clothing?.bottomSize}
                  onSelect={(v) => updateNested("clothing", "bottomSize", v)}
                />
                <SizeSelector
                  label="POINTURE"
                  options={CLOTHING_SIZES.shoe}
                  selected={formData.clothing?.shoeSize}
                  onSelect={(v) => updateNested("clothing", "shoeSize", v)}
                />
              </View>
            )}
          </View>

          {/* SECTION JOAILLERIE */}
          <View style={styles.registryBlock}>
            <TouchableOpacity
              style={styles.registryHeader}
              onPress={() => toggleSection("jewelry")}
            >
              <View style={styles.row}>
                <Ionicons
                  name="diamond-outline"
                  size={20}
                  color={THEME.accent}
                  style={{ marginRight: 15 }}
                />
                <Text style={styles.registryTitle}>Joaillerie</Text>
              </View>
              <Ionicons
                name={expandedSection === "jewelry" ? "remove" : "add"}
                size={20}
                color={THEME.textSecondary}
              />
            </TouchableOpacity>

            {expandedSection === "jewelry" && (
              <View style={styles.registryContent}>
                <EditorialInput
                  label="TOUR DE DOIGT"
                  placeholder="Ex: 52"
                  keyboardType="numeric"
                  value={formData.jewelry?.ringSize || ""}
                  onChangeText={(t: string) =>
                    updateNested("jewelry", "ringSize", t)
                  }
                />
                <Text style={[styles.miniLabel, { marginTop: 20 }]}>
                  PRÉFÉRENCE DE MÉTAL
                </Text>
                <View style={styles.chipRow}>
                  {JEWELRY_PREFERENCES.map((pref) => (
                    <PreferenceChip
                      key={pref.value}
                      label={pref.label}
                      active={formData.jewelry?.preference === pref.value}
                      onPress={() =>
                        updateNested("jewelry", "preference", pref.value)
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* SECTION ALIMENTATION */}
          <View style={styles.registryBlock}>
            <TouchableOpacity
              style={styles.registryHeader}
              onPress={() => toggleSection("diet")}
            >
              <View style={styles.row}>
                <Ionicons
                  name="restaurant-outline"
                  size={20}
                  color={THEME.accent}
                  style={{ marginRight: 15 }}
                />
                <Text style={styles.registryTitle}>Alimentation</Text>
              </View>
              <Ionicons
                name={expandedSection === "diet" ? "remove" : "add"}
                size={20}
                color={THEME.textSecondary}
              />
            </TouchableOpacity>

            {expandedSection === "diet" && (
              <View style={styles.registryContent}>
                <EditorialInput
                  label="ALLERGIES"
                  placeholder="Arachides, lactose..."
                  multiline
                  value={formData.diet?.allergies?.join(", ") || ""}
                  onChangeText={(t: string) =>
                    updateNested(
                      "diet",
                      "allergies",
                      t
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
                <View style={{ height: 20 }} />
                <EditorialInput
                  label="RÉGIMES / PRÉFÉRENCES"
                  placeholder="Végétarien, sans gluten..."
                  multiline
                  value={formData.diet?.preferences?.join(", ") || ""}
                  onChangeText={(t: string) =>
                    updateNested(
                      "diet",
                      "preferences",
                      t
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </View>
            )}
          </View>

          {/* SECTION LIVRAISON */}
          <View style={styles.registryBlock}>
            <TouchableOpacity
              style={styles.registryHeader}
              onPress={() => toggleSection("delivery")}
            >
              <View style={styles.row}>
                <Ionicons
                  name="cube-outline"
                  size={20}
                  color={THEME.accent}
                  style={{ marginRight: 15 }}
                />
                <Text style={styles.registryTitle}>Livraison</Text>
              </View>
              <Ionicons
                name={expandedSection === "delivery" ? "remove" : "add"}
                size={20}
                color={THEME.textSecondary}
              />
            </TouchableOpacity>

            {expandedSection === "delivery" && (
              <View style={styles.registryContent}>
                <Text style={styles.miniLabel}>MODALITÉ PRÉFÉRÉE</Text>
                <View style={styles.chipRow}>
                  {DELIVERY_TYPES.map((type) => (
                    <PreferenceChip
                      key={type.value}
                      label={type.label}
                      icon={type.icon}
                      active={formData.delivery?.type === type.value}
                      onPress={() =>
                        updateNested("delivery", "type", type.value)
                      }
                    />
                  ))}
                </View>
                <View style={{ marginTop: 25 }}>
                  <EditorialInput
                    label="ADRESSE DE RÉSIDENCE"
                    placeholder="Rue et numéro"
                    value={formData.delivery?.address?.street || ""}
                    onChangeText={(t: string) =>
                      updateNested("delivery", "address", {
                        ...(formData.delivery?.address || {}),
                        street: t,
                      })
                    }
                  />
                  <View style={[styles.row, { marginTop: 15 }]}>
                    <View style={{ flex: 1 }}>
                      <EditorialInput
                        label="CODE POSTAL"
                        placeholder="75000"
                        keyboardType="numeric"
                        value={formData.delivery?.address?.postalCode || ""}
                        onChangeText={(t: string) =>
                          updateNested("delivery", "address", {
                            ...(formData.delivery?.address || {}),
                            postalCode: t,
                          })
                        }
                      />
                    </View>
                    <View style={{ flex: 2, marginLeft: 20 }}>
                      <EditorialInput
                        label="VILLE"
                        placeholder="Paris"
                        value={formData.delivery?.address?.city || ""}
                        onChangeText={(t: string) =>
                          updateNested("delivery", "address", {
                            ...(formData.delivery?.address || {}),
                            city: t,
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- SOUS-COMPOSANTS ---

const SizeSelector = ({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected?: string;
  onSelect: (v: string) => void;
}) => (
  <View style={{ marginBottom: 25 }}>
    <Text style={styles.miniLabel}>{label}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 10 }}
    >
      {options.map((opt: string) => (
        <TouchableOpacity
          key={opt}
          style={[styles.sizeItem, selected === opt && styles.sizeItemActive]}
          onPress={() => {
            Haptics.selectionAsync();
            onSelect(opt);
          }}
        >
          <Text
            style={[
              styles.sizeItemText,
              selected === opt && styles.sizeItemTextActive,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const EditorialInput = ({
  label,
  value,
  onChangeText,
  ...props
}: {
  label: string;
  value?: string;
  onChangeText?: (t: string) => void;
  [key: string]: any;
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.miniLabel}>{label}</Text>
    <TextInput
      style={styles.editorialInput}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#BCBCBC"
      selectionColor={THEME.accent}
      {...props}
    />
  </View>
);

const PreferenceChip = ({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: any;
  active?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.prefChip, active && styles.prefChipActive]}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
  >
    {icon && (
      <Ionicons
        name={icon}
        size={14}
        color={active ? "#FFF" : THEME.textMain}
        style={{ marginRight: 6 }}
      />
    )}
    <Text style={[styles.prefChipText, active && styles.prefChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
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

  scrollContent: { paddingHorizontal: 30, paddingTop: 20 },

  heroSection: { marginBottom: 40 },
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
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* REGISTRY */
  registryBlock: { borderBottomWidth: 1, borderBottomColor: THEME.border },
  registryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 25,
  },
  registryTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  registryContent: { paddingBottom: 30 },

  /* ELEMENTS */
  row: { flexDirection: "row", alignItems: "center" },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  sizeItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FFF",
  },
  sizeItemActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  sizeItemText: { fontSize: 13, fontWeight: "600", color: THEME.textMain },
  sizeItemTextActive: { color: "#FFF" },

  inputGroup: { marginBottom: 5 },
  editorialInput: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingVertical: 8,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 5 },
  prefChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FFF",
  },
  prefChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  prefChipText: { fontSize: 12, fontWeight: "700", color: THEME.textMain },
  prefChipTextActive: { color: "#FFF" },
});
