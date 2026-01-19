import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import WebView from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';


// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  primary: "#111827",
  inputBg: "#FFFFFF",
};

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const LegalModal = ({
  visible,
  onClose,
  url,
  title,
}: LegalModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // Donne l'effet "carte empilée" sur iOS
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header Modal */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={THEME.textMain} />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          source={{ uri: url }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          )}
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
};

export default LegalModal

const styles = StyleSheet.create({
  /* MODAL STYLES */
  modalContainer: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
})