import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import WebView from "react-native-webview";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { ThemedText } from "@/components/themed-text";
import ThemedIcon from "@/components/themed-icon";

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const LegalModal = ({ visible, onClose, url, title }: LegalModalProps) => {
  const theme = useAppTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.modalHeader,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <ThemedText type="defaultBold" style={{ color: theme.textMain }}>
            {title}
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <ThemedIcon name="close" size={24} colorName="textMain" />
          </TouchableOpacity>
        </View>

        <WebView
          source={{ uri: url }}
          startInLoadingState={true}
          renderLoading={() => (
            <View
              style={[
                styles.loadingContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <ActivityIndicator size="large" color={theme.textMain} />
            </View>
          )}
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
};

export default LegalModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
