import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";

import * as Linking from "expo-linking";

interface ShareProfileModalProps {
  visible: boolean;
  onClose: () => void;
  username: string;
}

const ShareProfileModal = ({
  visible,
  onClose,
  username,
}: ShareProfileModalProps) => {
  const profileLink = Linking.createURL(`user/${username}`);
  // Utilisation d'une API publique pour le QR Code pour éviter d'ajouter des dépendances lourdes
  // On encode l'URL du deep link
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    profileLink,
  )}&bgcolor=FFFFFF&color=000000&margin=10`;

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(profileLink);
    alert("Lien copié dans le presse-papier !");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvre mon profil et mes listes de cadeaux sur Wishly ! ${profileLink}`,
        url: profileLink, // iOS support
        title: "Mon profil Wishly",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Partager mon profil</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrImage}
                contentFit="contain"
                transition={200}
              />
            </View>
            <Text style={styles.username}>@{username}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopyLink}>
              <View style={[styles.iconBox, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="link-outline" size={24} color="#111827" />
              </View>
              <Text style={styles.actionText}>Copier le lien</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <View style={[styles.iconBox, { backgroundColor: "#111827" }]}>
                <Ionicons name="share-social-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionText}>Partager</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 340,
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 16,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
});

export default ShareProfileModal;
