import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Haptics from "expo-haptics";
import { GiftWishlist, WishlistVisibility } from "@/types/gift";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();
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
        backgroundStyle={{ backgroundColor: theme.background, borderRadius: 0 }}
        handleIndicatorStyle={{
          backgroundColor: theme.border,
          width: 40,
          marginTop: 10,
        }}
      >
        <BottomSheetView style={styles.container}>
          {/* HEADER ÉPURÉ */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.navTitle}
            >
              ÉDITION DE COLLECTION
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <ThemedIcon name="close-outline" size={24} colorName="textMain" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* SECTION TITRE ÉDITORIAL */}
            <View style={styles.inputSection}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.miniLabel}
              >
                NOM DE L&apos;ÉVÉNEMENT
              </ThemedText>
              <TextInput
                style={[
                  styles.heroInput,
                  { color: theme.textMain, borderBottomColor: theme.border },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Titre de la pièce..."
                placeholderTextColor="#BCBCBC"
                selectionColor={theme.accent}
              />
            </View>

            {/* DATE STYLE SIGNATURE */}
            <View style={styles.inputSection}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.miniLabel}
              >
                DATE DE CÉLÉBRATION
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.dateSelector,
                  { borderBottomColor: theme.border },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDatePickerVisibility(true);
                }}
              >
                <ThemedText
                  type="defaultBold"
                  style={[styles.dateValue, !date && { color: "#BCBCBC" }]}
                >
                  {date
                    ? date
                        .toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        .toUpperCase()
                    : "DÉFINIR UNE ÉCHÉANCE"}
                </ThemedText>
                <ThemedIcon
                  name="calendar-outline"
                  size={18}
                  colorName="accent"
                />
              </TouchableOpacity>
            </View>

            {/* DESCRIPTION STYLE MANUSCRIT */}
            <View style={styles.inputSection}>
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
                value={description}
                onChangeText={setDescription}
                placeholder="Ajoutez vos précisions ici..."
                placeholderTextColor="#BCBCBC"
                multiline
                selectionColor={theme.accent}
              />
            </View>

            {/* VISIBILITÉ STYLE REGISTRE */}
            <View style={styles.settingsSection}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.miniLabel}
              >
                PARAMÈTRES D&apos;ACCÈS
              </ThemedText>
              <View style={styles.registryList}>
                {VISIBILITY_OPTIONS.map((option) => {
                  const isSelected = visibility === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.registryRow,
                        { borderBottomColor: theme.border },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setVisibility(option.id);
                      }}
                    >
                      <View style={styles.rowLeft}>
                        <ThemedIcon
                          name={option.icon as any}
                          size={18}
                          colorName={isSelected ? "accent" : "textSecondary"}
                        />
                        <View style={{ marginLeft: 15 }}>
                          <ThemedText
                            type="subtitle"
                            style={[
                              styles.rowTitle,
                              isSelected
                                ? { color: theme.textMain }
                                : { color: theme.textSecondary },
                            ]}
                          >
                            {option.label}
                          </ThemedText>
                          <ThemedText
                            type="caption"
                            colorName="textSecondary"
                            style={styles.rowSub}
                          >
                            {option.description}
                          </ThemedText>
                        </View>
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

          {/* FOOTER AUTHORITY */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: theme.textMain },
                !title.trim() && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!title.trim()}
              activeOpacity={0.9}
            >
              <ThemedText
                type="label"
                style={[styles.saveBtnText, { color: theme.background }]}
              >
                ENREGISTRER LES MODIFICATIONS
              </ThemedText>
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
  },
  navTitle: {
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
    letterSpacing: 1.5,
    marginBottom: 15,
  },

  heroInput: {
    fontSize: 28,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },

  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  dateValue: {
    letterSpacing: 0.5,
  },

  descInput: {
    fontSize: 16,
    minHeight: 60,
    borderBottomWidth: 1,
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
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  rowTitle: {},
  rowSub: {
    marginTop: 3,
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    letterSpacing: 1.5,
  },
});
