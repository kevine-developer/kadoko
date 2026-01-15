import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { GiftWishlist, WishlistVisibility } from "@/types/gift";

// --- THEME ---
const THEME = {
  background: "#FDFBF7", // Blanc cassé "Bone"
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "rgba(0,0,0,0.06)",
  danger: "#EF4444",
};

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
  
  // SnapPoints : 90% pour avoir de la place pour le clavier
  const snapPoints = useMemo(() => ["85%"], []);

  // --- STATE ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<WishlistVisibility>(WishlistVisibility.PUBLIC);
  // (Pour la date, on pourrait ajouter un DateTimePicker, ici simulé par un texte)
  const [dateStr, setDateStr] = useState("");

  // Hydrater le formulaire à l'ouverture
  useEffect(() => {
    if (visible && wishlist) {
      setTitle(wishlist.title);
      setDescription(wishlist.description || "");
      setVisibility(wishlist.visibility);
      setDateStr(wishlist.eventDate ? new Date(wishlist.eventDate).toLocaleDateString('fr-FR') : "");
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
    [onClose]
  );

  const handleSave = () => {
    onSave({
      title,
      description,
      visibility,
      // eventDate: ... logique de date
    });
    onClose();
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    // PointerEvents box-none permet de cliquer au travers si le sheet est fermé
    <GestureHandlerRootView style={[StyleSheet.absoluteFill, { zIndex: visible ? 100 : -1 }]} pointerEvents={visible ? "auto" : "none"}>
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
        <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
          <BottomSheetView style={styles.contentContainer}>
            
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Modifier la collection</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={THEME.textMain} />
              </TouchableOpacity>
            </View>

            {/* FORMULAIRE */}
            <View style={styles.form}>
              
              {/* TITRE */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>TITRE</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nom de la liste..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* DESCRIPTION */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ajoutez une note ou une description..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* VISIBILITÉ (Custom Toggle) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>VISIBILITÉ</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, visibility === WishlistVisibility.PUBLIC && styles.toggleBtnActive]}
                    onPress={() => setVisibility(WishlistVisibility.PUBLIC)}
                  >
                    <Ionicons 
                      name="earth" 
                      size={16} 
                      color={visibility === WishlistVisibility.PUBLIC ? "#FFF" : THEME.textMain} 
                    />
                    <Text style={[styles.toggleText, visibility === WishlistVisibility.PUBLIC && styles.toggleTextActive]}>Public</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.toggleBtn, visibility === WishlistVisibility.PRIVATE && styles.toggleBtnActive]}
                    onPress={() => setVisibility(WishlistVisibility.PRIVATE)}
                  >
                     <Ionicons 
                      name="lock-closed" 
                      size={16} 
                      color={visibility === WishlistVisibility.PRIVATE ? "#FFF" : THEME.textMain} 
                    />
                    <Text style={[styles.toggleText, visibility === WishlistVisibility.PRIVATE && styles.toggleTextActive]}>Privé</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
               {/* DATE (Mock) */}
               <View style={styles.inputGroup}>
                <Text style={styles.label}>DATE DE L&apos;ÉVÉNEMENT</Text>
                <TouchableOpacity style={styles.dateInput}>
                    <Text style={styles.dateText}>{dateStr || "Sélectionner une date"}</Text>
                    <Ionicons name="calendar-outline" size={20} color={THEME.textMain} />
                </TouchableOpacity>
              </View>

            </View>

            {/* ACTIONS FOOTER */}
            <View style={styles.footer}>
      
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Enregistrer</Text>
                <Ionicons name="checkmark" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

          </BottomSheetView>
        </TouchableWithoutFeedback>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    backgroundColor: "#D1D5DB",
    width: 40,
    marginTop: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: THEME.textMain,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
  },

  /* FORM */
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  input: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textMain,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  textArea: {
    height: 100,
  },
  
  /* DATE INPUT STYLE */
  dateInput: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: THEME.surface,
      borderWidth: 1,
      borderColor: THEME.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
  },
  dateText: {
      fontSize: 16,
      color: THEME.textMain,
  },

  /* TOGGLE VISIBILITY */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: THEME.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },

  /* FOOTER ACTIONS */
  footer: {
    marginTop: "auto", // Pousse en bas
    marginBottom: 40,
    flexDirection: 'row',
    gap: 16,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    gap: 8,
  },
  deleteText: {
    color: THEME.danger,
    fontWeight: "700",
    fontSize: 15,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary,
    gap: 8,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});