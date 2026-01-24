import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  surface: "#FFFFFF",
  primary: "#1A1A1A", // Noir profond
  accent: "#AF9062", // Or brossé
  textSecondary: "#8E8E93",
  border: "rgba(0,0,0,0.06)",
};

interface FloatingDockProps {
  handleAdd: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
  shareUrl?: string;
  shareTitle?: string;
}

const FloatingDockActions = ({
  handleAdd,
  handleEdit,
  handleDelete,
  shareUrl,
  shareTitle,
}: FloatingDockProps) => {
  const insets = useSafeAreaInsets();

  const handlePress = (
    callback: () => void,
    type: "light" | "medium" = "light",
  ) => {
    if (type === "medium") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    callback();
  };

  const onShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Découvrez ma liste d'envies : ${shareTitle || ""}`,
        url: shareUrl || "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 15 }}
      style={[
        styles.container,
        { marginBottom: insets.bottom > 0 ? insets.bottom : 20 },
      ]}
    >
      <View style={styles.dockSurface}>
        {/* PARTAGER */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={onShare}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.hairlineDivider} />

        {/* MODIFIER */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={() => handlePress(handleEdit)}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>

        {/* AJOUTER (POINT FOCAL) */}
        <TouchableOpacity
          style={styles.mainActionBtn}
          activeOpacity={0.8}
          onPress={() => handlePress(handleAdd, "medium")}
        >
          <View style={styles.mainActionInner}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* SUPPRIMER */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={() => handlePress(handleDelete)}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.hairlineDivider} />

        {/* INFO / ANALYTICS (OU AUTRE) */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={() => Haptics.selectionAsync()}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

export default FloatingDockActions;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  dockSurface: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    paddingHorizontal: 12,
    height: 64,
    borderRadius: 0, // Look rectangulaire luxe
    borderWidth: 1,
    borderColor: THEME.border,

    // Ombre "Glace" ultra légère
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  /* ITEMS */
  dockItem: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  /* SÉPARATEUR ÉDITORIAL */
  hairlineDivider: {
    width: 1,
    height: 20,
    backgroundColor: THEME.border,
    marginHorizontal: 4,
  },

  /* BOUTON D'AUTORITÉ (ADD) */
  mainActionBtn: {
    marginHorizontal: 15,
    // On retire le décalage vertical agressif pour plus d'élégance
  },
  mainActionInner: {
    width: 50,
    height: 50,
    backgroundColor: THEME.primary,
    borderRadius: 0, // Carré pour matcher le reste de l'UI luxe
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
