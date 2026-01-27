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
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();

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
      <View
        style={[
          styles.dockSurface,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={onShare}
        >
          <ThemedIcon
            name="share-social-outline"
            size={20}
            colorName="textSecondary"
          />
        </TouchableOpacity>

        <View
          style={[styles.hairlineDivider, { backgroundColor: theme.border }]}
        />

        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={() => handlePress(handleEdit)}
        >
          <ThemedIcon
            name="create-outline"
            size={20}
            colorName="textSecondary"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainActionBtn}
          activeOpacity={0.8}
          onPress={() => handlePress(handleAdd, "medium")}
        >
          <View
            style={[
              styles.mainActionInner,
              { backgroundColor: theme.textMain },
            ]}
          >
            <ThemedIcon name="add" size={28} color={theme.background} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={() => handlePress(handleDelete)}
        >
          <ThemedIcon
            name="trash-outline"
            size={20}
            colorName="textSecondary"
          />
        </TouchableOpacity>

        <View
          style={[styles.hairlineDivider, { backgroundColor: theme.border }]}
        />

        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.6}
          onPress={() => Haptics.selectionAsync()}
        >
          <ThemedIcon
            name="ellipsis-horizontal"
            size={20}
            colorName="textSecondary"
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
    paddingHorizontal: 12,
    height: 64,
    borderRadius: 0,
    borderWidth: 1,
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
  dockItem: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  hairlineDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  mainActionBtn: {
    marginHorizontal: 15,
  },
  mainActionInner: {
    width: 50,
    height: 50,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
