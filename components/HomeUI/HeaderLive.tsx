import { Image } from "expo-image";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeaderLive = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      <View>
        <Text style={styles.headerDate}>
          {new Date()
            .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" })
            .toUpperCase()}
        </Text>
        <Text style={styles.headerTitle}>
          Gift<Text style={styles.headerTitleItalic}>Flow</Text>
        </Text>
      </View>
      <TouchableOpacity style={styles.headerAvatarBtn}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={styles.headerAvatar}
        />
      </TouchableOpacity>
    </View>
  );
};

export default HeaderLive;

const styles = StyleSheet.create({
  /* HEADER STYLE */
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#FDFBF7",
  },
  headerDate: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "300", // Light pour un look éditorial
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", // Typographie Serif
    letterSpacing: -0.5,
  },
  headerTitleItalic: {
    fontStyle: "italic",
    fontWeight: "500",
  },
  headerAvatarBtn: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFF",
  },

});
