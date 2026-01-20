import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { GiftWishlist, WishlistVisibility } from "@/types/gift";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "rgba(0,0,0,0.08)",
  danger: "#EF4444",
  accent: "#F3F4F6",
};

// --- OPTIONS VISIBILITÉ ---
const VISIBILITY_OPTIONS = [
  {
    id: WishlistVisibility.PUBLIC,
    label: "Public",
    description: "Visible par tous via recherche.",
    icon: "globe-outline",
  },
  {
    id: WishlistVisibility.FRIENDS,
    label: "Cercle Proche",
    description: "Visible par vos amis uniquement.",
    icon: "people-outline",
  },
  {
    id: WishlistVisibility.PRIVATE,
    label: "Privé",
    description: "Visible uniquement par vous.",
    icon: "lock-closed-outline",
  },
  {
    id: WishlistVisibility.SELECT,
    label: "Spécifique",
    description: "Partage sélectif (Bientôt).",
    icon: "person-add-outline",
    disabled: true,
  },
];

interface WishlistEditModalProps {
  wishlist: GiftWishlist | undefined;
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<GiftWishlist>) => void;
  onDelete?: (id: string) => void; // Ajout UX: Suppression
}

export default function WishlistEditModal({
  wishlist,
  visible,
  onClose,
  onSave,
}: WishlistEditModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["92%"], []);

  // --- STATE ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<WishlistVisibility>(
    WishlistVisibility.PUBLIC,
  );
  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Init Data
  useEffect(() => {
    if (visible && wishlist) {
      setTitle(wishlist.title);
      setDescription(wishlist.description || "");
      setVisibility(wishlist.visibility);
      setDate(wishlist.eventDate ? new Date(wishlist.eventDate) : null);
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
      Keyboard.dismiss();
    }
  }, [visible, wishlist]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      description,
      visibility,
      eventDate: date?.toISOString(),
    });
    onClose();
  };


  return (
    <GestureHandlerRootView
      style={[StyleSheet.absoluteFill, { zIndex: visible ? 100 : -1 }]}
      pointerEvents={visible ? "auto" : "none"}
    >
      {visible && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
        keyboardBlurBehavior="restore"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <BottomSheetView style={styles.container}>
            {/* HEADER MINIMALISTE */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Édition</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={THEME.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* SECTION 1 : CONTENU "ÉDITORIAL" */}
              <View style={styles.heroInputSection}>
                <Text style={styles.label}>TITRE DE LA COLLECTION</Text>
                <TextInput
                  style={styles.heroInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nom de l'événement"
                  placeholderTextColor="#D1D5DB"
                  multiline
                />

                {/* Date intégrée élégamment */}
                <TouchableOpacity
                  style={styles.dateRow}
                  onPress={() => setDatePickerVisibility(true)}
                >
                  <View style={styles.dateIconBadge}>
                    <Ionicons
                      name="calendar"
                      size={14}
                      color={THEME.textMain}
                    />
                  </View>
                  <Text
                    style={[styles.dateText, !date && { color: "#9CA3AF" }]}
                  >
                    {date
                      ? date.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Ajouter une date (Optionnel)"}
                  </Text>
                  {date && (
                    <TouchableOpacity
                      onPress={() => setDate(null)}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.label}>NOTE / DESCRIPTION</Text>
                <TextInput
                  style={styles.descInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ajoutez quelques mots pour vos proches..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  scrollEnabled={false}
                />
              </View>

              {/* SECTION 2 : PARAMÈTRES */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionHeader}>Confidentialité</Text>

                <View style={styles.visibilityList}>
                  {VISIBILITY_OPTIONS.map((option) => {
                    const isSelected = visibility === option.id;
                    const isDisabled = option.disabled;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.visibilityCard,
                          isSelected && styles.visibilityCardSelected,
                          isDisabled && styles.visibilityCardDisabled,
                        ]}
                        onPress={() => !isDisabled && setVisibility(option.id)}
                        activeOpacity={isDisabled ? 1 : 0.7}
                      >
                        <View style={styles.cardLeft}>
                          <View
                            style={[
                              styles.iconCircle,
                              isSelected && styles.iconCircleSelected,
                            ]}
                          >
                            <Ionicons
                              name={option.icon as any}
                              size={18}
                              color={isSelected ? "#FFF" : THEME.textMain}
                            />
                          </View>
                          <View>
                            <Text
                              style={[
                                styles.cardTitle,
                                isSelected && { fontWeight: "700" },
                              ]}
                            >
                              {option.label}
                            </Text>
                            <Text style={styles.cardDesc}>
                              {option.description}
                            </Text>
                          </View>
                        </View>

                        {/* Indicateur de sélection */}
                        <View style={styles.cardRight}>
                          {isDisabled ? (
                            <View style={styles.badgeComingSoon}>
                              <Text style={styles.badgeText}>Bientôt</Text>
                            </View>
                          ) : isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={THEME.textMain}
                            />
                          ) : (
                            <View style={styles.radioEmpty} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ height: 120 }} />
            </ScrollView>

            {/* FOOTER FLOTTANT */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !title.trim() && styles.saveBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={!title.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.saveText}>Enregistrer</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </TouchableWithoutFeedback>
      </BottomSheet>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={date || new Date()}
        onConfirm={(d) => {
          setDate(d);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        confirmTextIOS="Valider"
        cancelTextIOS="Annuler"
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheetBackground: {
    backgroundColor: THEME.background,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    backgroundColor: "#E5E7EB",
    width: 40,
    marginTop: 10,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },

  /* HERO INPUT SECTION */
  heroInputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  heroInput: {
    fontSize: 34,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 40,
    marginBottom: 16,
  },
  descInput: {
    fontSize: 16,
    color: THEME.textMain,
    lineHeight: 24,
    minHeight: 40,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },

  /* DATE ROW */
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  dateIconBadge: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
    textTransform: "capitalize",
  },

  /* SETTINGS SECTION */
  settingsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.textMain,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  visibilityList: {
    gap: 12,
  },
  visibilityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    // Ombre légère pour effet carte
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  visibilityCardSelected: {
    borderColor: THEME.textMain, // Bordure noire quand sélectionné
    backgroundColor: "#F9FAFB",
  },
  visibilityCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: THEME.textMain,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.textMain,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: THEME.textSecondary,
    
  },
  cardRight: {
    marginLeft: 10,
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  badgeComingSoon: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
  },


  /* FOOTER */
  footer: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary, // Noir
    gap: 10,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
