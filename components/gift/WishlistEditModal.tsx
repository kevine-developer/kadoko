import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Haptics from "expo-haptics";
import { GiftWishlist, WishlistVisibility } from "@/types/gift";

// --- THEME ÉDITORIAL COHÉRENT ---
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

const VISIBILITY_OPTIONS = [
  {
    id: WishlistVisibility.PUBLIC,
    label: "Public",
    description: "Visible par tout votre cercle.",
    icon: "globe-outline",
  },
  {
    id: WishlistVisibility.FRIENDS,
    label: "Cercle",
    description: "Limité à vos amis acceptés.",
    icon: "people-outline",
  },
  {
    id: WishlistVisibility.PRIVATE,
    label: "Privé",
    description: "Visible uniquement par vous.",
    icon: "lock-closed-outline",
  },
];

interface WishlistEditModalProps {
  wishlist: GiftWishlist | undefined;
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<GiftWishlist>) => void;
}

export default function WishlistEditModal({
  wishlist,
  visible,
  onClose,
  onSave,
}: WishlistEditModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["92%"], []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<WishlistVisibility>(
    WishlistVisibility.PUBLIC,
  );
  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    if (visible && wishlist) {
      setTitle(wishlist.title);
      setDescription(wishlist.description || "");
      setVisibility(wishlist.visibility);
      setDate(wishlist.eventDate ? new Date(wishlist.eventDate) : null);
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, wishlist]);

  const handleSave = () => {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      {visible && <View style={styles.backdrop} />}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={(index) => index === -1 && onClose()}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.container}>
          {/* HEADER ÉPURÉ */}
          <View style={styles.header}>
            <Text style={styles.navTitle}>ÉDITION DE COLLECTION</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-outline" size={24} color={THEME.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* SECTION TITRE ÉDITORIAL */}
            <View style={styles.inputSection}>
              <Text style={styles.miniLabel}>NOM DE L&apos;ÉVÉNEMENT</Text>
              <TextInput
                style={styles.heroInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Titre de la pièce..."
                placeholderTextColor="#BCBCBC"
                selectionColor={THEME.accent}
              />
            </View>

            {/* DATE STYLE SIGNATURE */}
            <View style={styles.inputSection}>
              <Text style={styles.miniLabel}>DATE DE CÉLÉBRATION</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDatePickerVisibility(true);
                }}
              >
                <Text style={[styles.dateValue, !date && { color: "#BCBCBC" }]}>
                  {date
                    ? date
                        .toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        .toUpperCase()
                    : "DÉFINIR UNE ÉCHÉANCE"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={THEME.accent}
                />
              </TouchableOpacity>
            </View>

            {/* DESCRIPTION STYLE MANUSCRIT */}
            <View style={styles.inputSection}>
              <Text style={styles.miniLabel}>NOTES DE RÉDACTION</Text>
              <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Ajoutez vos précisions ici..."
                placeholderTextColor="#BCBCBC"
                multiline
                selectionColor={THEME.accent}
              />
            </View>

            {/* VISIBILITÉ STYLE REGISTRE */}
            <View style={styles.settingsSection}>
              <Text style={styles.miniLabel}>PARAMÈTRES D&apos;ACCÈS</Text>
              <View style={styles.registryList}>
                {VISIBILITY_OPTIONS.map((option) => {
                  const isSelected = visibility === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.registryRow}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setVisibility(option.id);
                      }}
                    >
                      <View style={styles.rowLeft}>
                        <Ionicons
                          name={option.icon as any}
                          size={18}
                          color={
                            isSelected ? THEME.accent : THEME.textSecondary
                          }
                        />
                        <View style={{ marginLeft: 15 }}>
                          <Text
                            style={[
                              styles.rowTitle,
                              isSelected && { color: THEME.textMain },
                            ]}
                          >
                            {option.label}
                          </Text>
                          <Text style={styles.rowSub}>
                            {option.description}
                          </Text>
                        </View>
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

          {/* FOOTER AUTHORITY */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
              activeOpacity={0.9}
            >
              <Text style={styles.saveBtnText}>
                ENREGISTRER LES MODIFICATIONS
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={date || new Date()}
        onConfirm={(d) => {
          setDate(d);
          setDatePickerVisibility(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        confirmTextIOS="CONFIRMER"
        cancelTextIOS="ANNULER"
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetBackground: { backgroundColor: THEME.background, borderRadius: 0 },
  handle: { backgroundColor: THEME.border, width: 40, marginTop: 10 },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 20 },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  /* INPUT SECTIONS */
  inputSection: { marginBottom: 35 },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 15,
  },

  heroInput: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 10,
  },

  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 12,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: 0.5,
  },

  descInput: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    color: THEME.textMain,
    lineHeight: 24,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 10,
  },

  /* REGISTRY LIST (Visibility) */
  settingsSection: { marginTop: 10 },
  registryList: { marginTop: 5 },
  registryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: THEME.textSecondary },
  rowSub: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 3,
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

  /* FOOTER */
  footer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 20,
    left: 32,
    right: 32,
  },
  saveBtn: {
    height: 60,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
