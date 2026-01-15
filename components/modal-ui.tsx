import React from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { eventType } from "@/types/interface";

interface ModalUIProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  type: string;
  setType: (type: string) => void;
  eventTypes: eventType[];
}

const ModalUI = ({
  modalVisible,
  setModalVisible,
  type,
  setType,
  eventTypes,
}: ModalUIProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <ThemedView style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>TOUS LES TYPES</ThemedText>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
                ✕
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <FlatList
            data={eventTypes}
            numColumns={3}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ padding: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.gridItem,
                  type === item.value && styles.gridItemSelected,
                ]}
                onPress={() => {
                  setType(item.value);
                  setModalVisible(false);
                }}
              >
                <ThemedText style={{ fontSize: 32 }}>{item.emoji}</ThemedText>
                <ThemedText style={styles.gridLabel}>{item.label}</ThemedText>
              </TouchableOpacity>
            )}
          />
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

export default ModalUI;

const styles = StyleSheet.create({
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderRadius: 24,
    maxHeight: "80%",
    borderWidth: 4,
    borderColor: "#1E293B",
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 2,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1E293B" },
  closeBtn: {
    backgroundColor: "#7244efff",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  gridItem: {
    flex: 1,
    margin: 8,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  gridItemSelected: { borderColor: "#7C3AED", backgroundColor: "#F5F3FF" },
  gridLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },
});
