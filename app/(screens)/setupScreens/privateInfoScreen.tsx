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
  TouchableOpacity,
  View,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { userService, type PrivateInfo } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import * as Haptics from "expo-haptics";
import {
  CLOTHING_SIZES,
  DELIVERY_TYPES,
  JEWELRY_PREFERENCES,
} from "@/constants/privateInfo";
import SettingHero from "@/components/Settings/SettingHero";
import { RegistryAccordion } from "@/components/Settings/InfoPrive/RegistryAccordion";
import { SizeSelector } from "@/components/Settings/InfoPrive/SizeSelector";
import { EditorialInput } from "@/components/Settings/InfoPrive/EditorialInput";
import { PreferenceChip } from "@/components/Settings/InfoPrive/PreferenceChip";

// Activer LayoutAnimation sur Android pour le changement d'état local
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const THEME = {
  background: "#FDFBF7",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.08)",
};

export default function PrivateInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const [saving, setSaving] = useState(false);
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
        diet: {
          allergies: user.privateInfo.diet?.allergies || [],
          preferences: user.privateInfo.diet?.preferences || [],
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
    }
  }, [user?.privateInfo]);

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
          <SettingHero
            title={`Vos détails\nconfidentiels.`}
            subtitle="Ces informations permettent à vos proches de viser juste, en toute discrétion."
          />

          <RegistryAccordion
            title="Garde-robe"
            icon="shirt-outline"
            isOpen={expandedSection === "clothing"}
            onToggle={() =>
              setExpandedSection(
                expandedSection === "clothing" ? null : "clothing",
              )
            }
          >
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
          </RegistryAccordion>

          <RegistryAccordion
            title="Joaillerie"
            icon="diamond-outline"
            isOpen={expandedSection === "jewelry"}
            onToggle={() =>
              setExpandedSection(
                expandedSection === "jewelry" ? null : "jewelry",
              )
            }
          >
            <EditorialInput
              label="TOUR DE DOIGT"
              placeholder="Ex: 52"
              keyboardType="numeric"
              value={formData.jewelry?.ringSize || ""}
              onChangeText={(t) => updateNested("jewelry", "ringSize", t)}
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
          </RegistryAccordion>

          <RegistryAccordion
            title="Alimentation"
            icon="restaurant-outline"
            isOpen={expandedSection === "diet"}
            onToggle={() =>
              setExpandedSection(expandedSection === "diet" ? null : "diet")
            }
          >
            <EditorialInput
              label="ALLERGIES"
              placeholder="Arachides, lactose..."
              multiline
              value={formData.diet?.allergies?.join(", ") || ""}
              onChangeText={(t) =>
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
              onChangeText={(t) =>
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
          </RegistryAccordion>

          <RegistryAccordion
            title="Livraison"
            icon="cube-outline"
            isOpen={expandedSection === "delivery"}
            onToggle={() =>
              setExpandedSection(
                expandedSection === "delivery" ? null : "delivery",
              )
            }
          >
            <Text style={styles.miniLabel}>MODALITÉ PRÉFÉRÉE</Text>
            <View style={styles.chipRow}>
              {DELIVERY_TYPES.map((type) => (
                <PreferenceChip
                  key={type.value}
                  label={type.label}
                  icon={type.icon}
                  active={formData.delivery?.type === type.value}
                  onPress={() => updateNested("delivery", "type", type.value)}
                />
              ))}
            </View>
            <View style={{ marginTop: 25 }}>
              <EditorialInput
                label="ADRESSE DE RÉSIDENCE"
                placeholder="Rue et numéro"
                value={formData.delivery?.address?.street || ""}
                onChangeText={(t) =>
                  updateNested("delivery", "address", {
                    ...formData.delivery?.address,
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
                    onChangeText={(t) =>
                      updateNested("delivery", "address", {
                        ...formData.delivery?.address,
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
                    onChangeText={(t) =>
                      updateNested("delivery", "address", {
                        ...formData.delivery?.address,
                        city: t,
                      })
                    }
                  />
                </View>
              </View>
            </View>
          </RegistryAccordion>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
  row: { flexDirection: "row", alignItems: "center" },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 5 },
});
