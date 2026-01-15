import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Option {
  label: string;
  value: string;
  emoji?: string;
}

interface SelectUIProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
}

const SelectUI = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = "Sélectionner...",
  icon,
}: SelectUIProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const backgroundColor = useThemeColor({}, "backgroundPrimary");
  // Trouver l'option actuellement sélectionnée pour l'afficher sur le bouton
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>
        {icon ? `${icon} ` : ""}
        {label.toUpperCase()}
      </ThemedText>

      {/* LE BOUTON (TRIGGER) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[styles.trigger, { backgroundColor }]} 
      >
        <ThemedView style={styles.triggerContent}>
          {selectedOption ? (
            <ThemedText style={styles.selectedText}>
              {selectedOption.emoji} {selectedOption.label}
            </ThemedText>
          ) : (
            <ThemedText style={styles.placeholderText}>
              {placeholder}
            </ThemedText>
          )}
        </ThemedView>
        <IconSymbol name="chevron.down" size={20} color="#64748B" />
      </TouchableOpacity>

      {/* LA MODAL DE SÉLECTION */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        style={{ backgroundColor }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={[styles.modalContent, { backgroundColor }]}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {label.toUpperCase()}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <ThemedText style={styles.closeBtnText}>✕</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.listPadding}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === selectedValue && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <ThemedText style={styles.optionEmoji}>
                    {item.emoji}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      item.value === selectedValue &&
                        styles.optionLabelSelected,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  {item.value === selectedValue && (
                    <IconSymbol name="checkmark" size={20} color="#7C3AED" />
                  )}
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </Pressable>
      </Modal>
    </ThemedView>
  );
};

export default SelectUI;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 1,
  },
  trigger: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerContent: {
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "700",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    maxHeight: "70%",
    borderWidth: 4,
    borderColor: "#1E293B",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 2,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  closeBtn: {
    backgroundColor: "#EF4444",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listPadding: {
    padding: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: "#F5F3FF",
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  optionLabelSelected: {
    color: "#7C3AED",
  },
});
