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

// Services
import { wishlistService } from "@/lib/services/wishlist-service";

// --- THEME ---
const THEME = {
  background: "#FDFBF7", // Bone
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "#E5E7EB",
  accent: "#F3F4F6",
};

// --- DATA ---
const EVENT_TYPES = [
  { id: "BIRTHDAY", label: "Anniversaire", icon: "cake" }, // cake n'existe pas dans ionicons, on utilisera une map
  { id: "CHRISTMAS", label: "Noël", icon: "gift" },
  { id: "WEDDING", label: "Mariage", icon: "heart" },
  { id: "BABY_SHOWER", label: "Naissance", icon: "happy" },
  { id: "HOUSEWARMING", label: "Crémaillère", icon: "home" },
  { id: "OTHER", label: "Autre", icon: "star" },
];

const VISIBILITY_OPTIONS = [
  {
    id: "PUBLIC",
    label: "Public",
    desc: "Visible par tous via recherche ou lien.",
  },
  {
    id: "FRIENDS",
    label: "Cercle Proche",
    desc: "Visible uniquement par vos amis.",
  },
  {
    id: "PRIVATE",
    label: "Privé",
    desc: "Visible uniquement par vous.",
  },
  // "SELECT" sera implémenté plus tard, on peut le masquer ou le griser
];

// Mapping pour les icônes dynamiques (Ionicons)
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

  // States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("BIRTHDAY");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [loading, setLoading] = useState(false);

  // Date
  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Veuillez donner un titre à votre collection.");
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.createWishlist({
        title: title.trim(),
        description: description.trim(),
        eventType,
        eventDate: date,
        visibility,
      });

      if (res.success) {
        // Redirection vers la liste créée ou retour arrière
        router.back();
      } else {
        Alert.alert("Erreur", res.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Create wishlist error:", error);
      Alert.alert("Erreur", "Connexion au serveur impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* NAVBAR */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="close" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Nouvelle Collection</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!title.trim() || loading}
          style={[
            styles.createBtn,
            (!title.trim() || loading) && styles.createBtnDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={THEME.primary} />
          ) : (
            <Text
              style={[
                styles.createBtnText,
                !title.trim() && { color: "#D1D5DB" },
              ]}
            >
              Créer
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
          {/* 1. HERO SECTION (Titre + Icône dynamique) */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Ionicons
                name={getIconName(eventType) as any}
                size={32}
                color={THEME.textMain}
              />
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder="Nom de l'événement"
              placeholderTextColor="#9CA3AF"
              multiline
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          {/* 2. DESCRIPTION */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.descInput}
              placeholder="Ajouter une description ou une note..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.divider} />

          {/* 3. TYPE D'ÉVÉNEMENT (Pills) */}
          <View style={styles.section}>
            <Text style={styles.label}>OCCASION</Text>
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
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => setEventType(type.id)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        isSelected && styles.pillTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 4. DATE */}
          <View style={styles.section}>
            <Text style={styles.label}>DATE BUTOIR</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setDatePickerVisibility(true)}
            >
              <View style={styles.dateLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={THEME.textMain}
                />
                <Text style={[styles.dateText, !date && { color: "#9CA3AF" }]}>
                  {date
                    ? date.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Sélectionner une date"}
                </Text>
              </View>
              {date && (
                <TouchableOpacity onPress={() => setDate(null)}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 5. VISIBILITÉ */}
          <View style={styles.section}>
            <Text style={styles.label}>VISIBILITÉ</Text>
            <View style={styles.visibilityContainer}>
              {VISIBILITY_OPTIONS.map((option) => {
                const isSelected = visibility === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.visibilityOption,
                      isSelected && styles.visibilitySelected,
                    ]}
                    onPress={() => setVisibility(option.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioCircle}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.visibilityTextContainer}>
                      <Text style={styles.visibilityLabel}>{option.label}</Text>
                      <Text style={styles.visibilityDesc}>{option.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Option Grisée pour plus tard */}
              <View style={[styles.visibilityOption, { opacity: 0.5 }]}>
                <View
                  style={[styles.radioCircle, { borderColor: "#E5E7EB" }]}
                />
                <View style={styles.visibilityTextContainer}>
                  <Text style={[styles.visibilityLabel, { color: "#9CA3AF" }]}>
                    Spécifique
                  </Text>
                  <Text style={styles.visibilityDesc}>
                    Partager avec certains utilisateurs
                  </Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Bientôt</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(d) => {
          setDate(d);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: THEME.background,
  },
  navBtn: { padding: 8 },
  navTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  createBtn: { padding: 8 },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { fontSize: 16, fontWeight: "700", color: THEME.primary },

  scrollContent: { paddingBottom: 60 },

  /* HERO SECTION */
  heroSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 32,
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6", // Cercle gris doux
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    marginTop: 4, // Alignement optique avec le texte
  },
  titleInput: {
    flex: 1,
    fontSize: 34, // Très grand pour l'impact
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 40,
  },

  /* INPUTS */
  inputGroup: { paddingHorizontal: 24, paddingLeft: 88 }, // Alignement sous le titre
  descInput: {
    fontSize: 16,
    color: THEME.textMain,
    minHeight: 40,
    textAlignVertical: "top",
  },

  divider: {
    height: 8,
    backgroundColor: "#F3F4F6", // Séparateur épais style "Section"
    marginVertical: 24,
  },

  /* SECTIONS */
  section: { paddingHorizontal: 24, marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },

  /* PILLS (Occasion) */
  pillScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  pillSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  pillText: { fontSize: 14, fontWeight: "600", color: THEME.textMain },
  pillTextSelected: { color: "#FFFFFF" },

  /* DATE */
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  dateLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: THEME.textMain,
    textTransform: "capitalize",
  },

  /* VISIBILITY (Radio List) */
  visibilityContainer: {
    gap: 12,
  },
  visibilityOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  visibilitySelected: {
    borderColor: THEME.primary,
    backgroundColor: "#F9FAFB",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.textMain,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.primary,
  },
  visibilityTextContainer: { flex: 1 },
  visibilityLabel: { fontSize: 15, fontWeight: "600", color: THEME.textMain },
  visibilityDesc: { fontSize: 13, color: THEME.textSecondary, marginTop: 2 },

  /* Coming Soon Badge */
  comingSoonBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
});
