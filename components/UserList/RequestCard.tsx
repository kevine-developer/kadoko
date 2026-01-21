import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';



// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  accent: "#111827",
  border: "rgba(0,0,0,0.06)",
  success: "#10B981",
};


interface RequestCardProps {
  user: any;
  handleAcceptFriend: () => void;
  handleRemoveFriend: () => void;
}
 const RequestCard = ({ user, handleAcceptFriend, handleRemoveFriend }: RequestCardProps) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Image
          source={{ uri: user.avatarUrl || user.image }}
          style={styles.requestAvatar}
        />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{user.name}</Text>
          <Text style={styles.requestMeta}>
            Souhaite rejoindre votre cercle
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={handleAcceptFriend}
        >
          <Text style={styles.acceptText}>Accepter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ignoreBtn}
          onPress={handleRemoveFriend}
        >
          <Ionicons name="close" size={18} color={THEME.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

export default RequestCard

const styles = StyleSheet.create({  requestCard: {
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
  },
  requestInfo: { flex: 1 },
  requestName: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textMain,
    marginBottom: 2,
  },
  requestMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: THEME.textMain,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  ignoreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
})