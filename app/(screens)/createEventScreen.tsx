import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// Services
import { wishlistService } from "@/lib/services/wishlist-service";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

// --- DATA ---
const EVENT_TYPES = [
  { id: "BIRTHDAY", label: "Anniversaire" },
  { id: "CHRISTMAS", label: "Noël" },
  { id: "WEDDING", label: "Mariage" },
  { id: "BABY_SHOWER", label: "Naissance" },
  { id: "HOUSEWARMING", label: "Crémaillère" },
  { id: "OTHER", label: "Autre" },
];

const VISIBILITY_OPTIONS = [
  { id: "PUBLIC", label: "Public", desc: "Visible par tous vos proches." },
  { id: "FRIENDS", label: "Cercle", desc: "Uniquement vos amis acceptés." },
  { id: "PRIVATE", label: "Privé", desc: "Visible uniquement par vous." },
];

const getIconName = (type: string) => {
  switch (type) {
    case "BIRTHDAY":
      return "balloon-outline";
    case "CHRISTMAS":
      return "snow-outline";
    case "WEDDING":
      return "heart-outline";
    case "BABY_SHOWER":
      return "happy-outline";
    case "HOUSEWARMING":
      return "key-outline";
    default:
      return "sparkles-outline";
  }
};

export default function CreateWishlistScreen() {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("BIRTHDAY");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await wishlistService.createWishlist({
        title: title.trim(),
        description: description.trim(),
        eventType,
        eventDate: date,
        visibility,
      });

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        Alert.alert("Erreur", res.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* NAV BAR */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="close-outline" size={28} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>NOUVELLE COLLECTION</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!title.trim() || loading}
          style={styles.saveAction}
        >
          {loading ? (
            <ActivityIndicator size="small" color={THEME.accent} />
          ) : (
            <Text
              style={[styles.saveActionText, !title.trim() && { opacity: 0.3 }]}
            >
              CRÉER
            </Text>
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
          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <MotiView
              from={{ width: 0 }}
              animate={{ width: 35 }}
              transition={{ type: "timing", duration: 800 }}
              style={styles.heroDivider}
            />
            <View style={styles.titleRow}>
              <TextInput
                style={styles.titleInput}
                placeholder="Nom de l'événement"
                placeholderTextColor="#BCBCBC"
                multiline
                value={title}
                onChangeText={setTitle}
                autoFocus
                selectionColor={THEME.accent}
              />
              <Ionicons
                name={getIconName(eventType) as any}
                size={24}
                color={THEME.accent}
              />
            </View>
          </View>

          {/* DESCRIPTION ÉDITORIALE */}
          <View style={styles.inputGroup}>
            <Text style={styles.miniLabel}>NOTES DE RÉDACTION</Text>
            <TextInput
              style={styles.descInput}
              placeholder="Précisez l'intention de cette liste..."
              placeholderTextColor="#BCBCBC"
              multiline
              value={description}
              onChangeText={setDescription}
              selectionColor={THEME.accent}
            />
          </View>

          {/* OCCASION - STYLE REGISTRE */}
          <View style={styles.section}>
            <Text style={styles.miniLabel}>OCCASION PRESTIGE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillScroll}
            >
              {EVENT_TYPES.map((type) => {
                const isSelected = eventType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.registryChip,
                      isSelected && styles.registryChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setEventType(type.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.registryChipText,
                        isSelected && styles.registryChipTextActive,
                      ]}
                    >
                      {type.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* DATE - STYLE SIGNATURE */}
          <View style={styles.section}>
            <Text style={styles.miniLabel}>ÉCHÉANCE DE L&apos;ÉVÉNEMENT</Text>
            <TouchableOpacity
              style={styles.dateRow}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Text style={[styles.dateValue, !date && { color: "#BCBCBC" }]}>
                {date
                  ? date.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "DÉFINIR UNE DATE"}
              </Text>
              <Ionicons
                name="calendar-clear-outline"
                size={18}
                color={THEME.accent}
              />
            </TouchableOpacity>
          </View>

          {/* VISIBILITÉ - STYLE CATALOGUE */}
          <View style={styles.section}>
            <Text style={styles.miniLabel}>CONFIDENTIALITÉ</Text>
            <View style={styles.visibilityList}>
              {VISIBILITY_OPTIONS.map((option) => {
                const isSelected = visibility === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.visibilityRow}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setVisibility(option.id);
                    }}
                  >
                    <View style={styles.visibilityText}>
                      <Text style={styles.visibilityTitle}>{option.label}</Text>
                      <Text style={styles.visibilitySub}>{option.desc}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(d) => {
          setDate(d);
          setDatePickerVisibility(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        confirmTextIOS="CONFIRMER"
        cancelTextIOS="ANNULER"
      />
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
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },
  navBtn: { width: 44, height: 44, justifyContent: "center" },
  saveAction: { paddingHorizontal: 10, height: 44, justifyContent: "center" },
  saveActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
  },

  scrollContent: { paddingHorizontal: 30, paddingTop: 20 },

  /* HERO */
  heroSection: { marginBottom: 35 },
  heroDivider: { height: 2, backgroundColor: THEME.accent, marginBottom: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 38,
    marginRight: 15,
  },

  /* FORM ELEMENTS */
  inputGroup: { marginBottom: 35 },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  descInput: {
    fontSize: 16,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 15,
  },

  section: { marginBottom: 40 },

  /* REGISTRY CHIPS (OCCASION) */
  pillScroll: { marginHorizontal: -30, paddingHorizontal: 30 },
  registryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 10,
    backgroundColor: THEME.surface,
  },
  registryChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  registryChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
  },
  registryChipTextActive: { color: "#FFF" },

  /* DATE */
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 15,
  },
  dateValue: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },

  /* VISIBILITY LIST */
  visibilityList: { gap: 0 },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
  },
  visibilityText: { flex: 1 },
  visibilityTitle: { fontSize: 15, fontWeight: "600", color: THEME.textMain },
  visibilitySub: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: THEME.accent },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.accent,
  },
});
