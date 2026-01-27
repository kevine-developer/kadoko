import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { wishlistService } from "@/lib/services/wishlist-service";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();

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
        showSuccessToast("Collection créée avec succès");
        router.back();
      } else {
        showErrorToast(res.message || "Erreur de création");
      }
    } catch {
      showErrorToast("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <ThemedIcon name="close-outline" size={28} colorName="textMain" />
        </TouchableOpacity>
        <ThemedText type="label" style={styles.navTitle}>
          NOUVELLE COLLECTION
        </ThemedText>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!title.trim() || loading}
          style={styles.saveAction}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <ThemedText
              type="label"
              colorName="accent"
              style={[styles.saveActionText, !title.trim() && { opacity: 0.3 }]}
            >
              CRÉER
            </ThemedText>
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
            <MotiView
              from={{ width: 0 }}
              animate={{ width: 35 }}
              transition={{ type: "timing", duration: 800 }}
              style={[styles.heroDivider, { backgroundColor: theme.accent }]}
            />
            <View style={styles.titleRow}>
              <TextInput
                style={[styles.titleInput, { color: theme.textMain }]}
                placeholder="Nom de l'événement"
                placeholderTextColor="#BCBCBC"
                multiline
                value={title}
                onChangeText={setTitle}
                autoFocus
                selectionColor={theme.accent}
              />
              <ThemedIcon
                name={getIconName(eventType) as any}
                size={24}
                colorName="accent"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.miniLabel}
            >
              NOTES DE RÉDACTION
            </ThemedText>
            <TextInput
              style={[
                styles.descInput,
                { color: theme.textMain, borderBottomColor: theme.border },
              ]}
              placeholder="Précisez l'intention de cette liste..."
              placeholderTextColor="#BCBCBC"
              multiline
              value={description}
              onChangeText={setDescription}
              selectionColor={theme.accent}
            />
          </View>

          <View style={styles.section}>
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.miniLabel}
            >
              OCCASION PRESTIGE
            </ThemedText>
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
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                      isSelected && {
                        backgroundColor: theme.textMain,
                        borderColor: theme.textMain,
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setEventType(type.id);
                    }}
                  >
                    <ThemedText
                      type="label"
                      style={[
                        styles.registryChipText,
                        { color: theme.textMain },
                        isSelected && { color: theme.background },
                      ]}
                    >
                      {type.label.toUpperCase()}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.miniLabel}
            >
              ÉCHÉANCE DE L&apos;ÉVÉNEMENT
            </ThemedText>
            <TouchableOpacity
              style={[styles.dateRow, { borderBottomColor: theme.border }]}
              onPress={() => setDatePickerVisibility(true)}
            >
              <ThemedText
                type="subtitle"
                style={[styles.dateValue, !date && { color: "#BCBCBC" }]}
              >
                {date
                  ? date.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "DÉFINIR UNE DATE"}
              </ThemedText>
              <ThemedIcon
                name="calendar-clear-outline"
                size={18}
                colorName="accent"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.miniLabel}
            >
              CONFIDENTIALITÉ
            </ThemedText>
            <View style={styles.visibilityList}>
              {VISIBILITY_OPTIONS.map((option) => {
                const isSelected = visibility === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.visibilityRow,
                      { borderBottomColor: theme.border },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setVisibility(option.id);
                    }}
                  >
                    <View style={styles.visibilityText}>
                      <ThemedText
                        type="subtitle"
                        style={styles.visibilityTitle}
                      >
                        {option.label}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        colorName="textSecondary"
                        style={styles.visibilitySub}
                      >
                        {option.desc}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: theme.border },
                        isSelected && { borderColor: theme.accent },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: theme.accent },
                          ]}
                        />
                      )}
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
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  navTitle: { marginTop: 10 },
  navBtn: { width: 44, height: 44, justifyContent: "center" },
  saveAction: { paddingHorizontal: 10, height: 44, justifyContent: "center" },
  saveActionText: { fontSize: 13 },
  scrollContent: { paddingHorizontal: 30, paddingTop: 20 },
  heroSection: { marginBottom: 35 },
  heroDivider: { height: 2, marginBottom: 20 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleInput: { flex: 1, fontSize: 32, lineHeight: 38, marginRight: 15 },
  inputGroup: { marginBottom: 35 },
  miniLabel: { letterSpacing: 1.5, marginBottom: 12 },
  descInput: { fontSize: 16, borderBottomWidth: 1, paddingBottom: 15 },
  section: { marginBottom: 40 },
  pillScroll: { marginHorizontal: -30, paddingHorizontal: 30 },
  registryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    marginRight: 10,
  },
  registryChipText: { fontSize: 10 },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
  dateValue: {},
  visibilityList: { gap: 0 },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 0.5,
  },
  visibilityText: { flex: 1 },
  visibilityTitle: {},
  visibilitySub: { marginTop: 4 },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 8, height: 8, borderRadius: 4 },
});
