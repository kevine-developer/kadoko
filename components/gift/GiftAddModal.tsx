import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  primary: "#111827",
};

interface GiftAddModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (giftData: any) => void;
}

const PRIORITIES = [
  { label: "Indispensable", value: "HIGH" },
  { label: "Plaisir", value: "MEDIUM" },
  { label: "Optionnel", value: "LOW" },
];

export default function GiftAddModal({
  visible,
  onClose,
  onAdd,
}: GiftAddModalProps) {
  const insets = useSafeAreaInsets();

  // Form States
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!title.trim()) return;
    
    onAdd({
      title,
      productUrl: url,
      estimatedPrice: price ? parseFloat(price) : null,
      priority,
      description,
      // Ici on pourrait ajouter une logique pour l'image
    });
    
    // Reset & Close
    setTitle("");
    setUrl("");
    setPrice("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // Style natif iOS agréable
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ajouter une envie</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={THEME.textMain} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* SECTION LIEN (SCRAper) */}
            <View style={styles.urlSection}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="link-outline" size={20} color={THEME.textSecondary} />
                <TextInput
                  placeholder="Coller un lien (URL produit)..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputNoBorder}
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                />
              </View>
              {/* Bouton simulant un scrape auto */}
              {url.length > 0 && (
                <TouchableOpacity style={styles.autoFillBtn}>
                  <Text style={styles.autoFillText}>Auto-remplir</Text>
                  <Ionicons name="flash" size={12} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            {/* TITRE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titre du cadeau</Text>
              <TextInput
                placeholder="Ex: Casque Sony XM5"
                placeholderTextColor="#D1D5DB"
                style={styles.mainInput}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* PRIX & PRIORITÉ */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Prix (€)</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#D1D5DB"
                  style={styles.input}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Priorité</Text>
                <View style={styles.priorityRow}>
                  {PRIORITIES.map((p) => {
                    const isActive = priority === p.value;
                    return (
                      <TouchableOpacity
                        key={p.value}
                        style={[
                          styles.priorityPill,
                          isActive && styles.priorityPillActive,
                        ]}
                        onPress={() => setPriority(p.value)}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            isActive && styles.priorityTextActive,
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* DESCRIPTION */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes / Taille / Couleur</Text>
              <TextInput
                placeholder="Ex: Taille 42, couleur noir mat..."
                placeholderTextColor="#D1D5DB"
                style={[styles.input, styles.textArea]}
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* ACTION FOOTER */}
            <View style={styles.footerSpace} />
            <TouchableOpacity
              style={[
                styles.submitBtn,
                !title && styles.submitBtnDisabled
              ]}
              onPress={handleSave}
              disabled={!title}
            >
              <Text style={styles.submitText}>Ajouter à la liste</Text>
              <Ionicons name="arrow-up-circle" size={24} color="#FFF" />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: THEME.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  scrollContent: {
    padding: 24,
  },
  
  /* URL SECTION */
  urlSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 6,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 24,
  },
  inputIconWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputNoBorder: {
    flex: 1,
    fontSize: 15,
    color: THEME.textMain,
    height: 44,
  },
  autoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  autoFillText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 24,
  },

  /* FORM FIELDS */
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainInput: {
    fontSize: 24,
    fontWeight: "500",
    color: THEME.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  input: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: THEME.textMain,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },

  /* PRIORITY PILLS */
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  priorityPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  priorityPillActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textSecondary,
  },
  priorityTextActive: {
    color: "#FFFFFF",
  },

  /* FOOTER */
  footerSpace: {
    height: 20,
  },
  submitBtn: {
    backgroundColor: THEME.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});