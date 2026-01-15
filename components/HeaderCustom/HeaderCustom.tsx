import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface CustomHeaderProps {
  title: string | string[];
  backgroundColor?: string;
  textColor?: string;
  rightAction?: () => void;
  rightActionIcon?: React.ReactNode;
  hideBackButton?: boolean;
  blurIntensity?: number;
  largeTitle?: boolean;
}

const HeaderCustom: React.FC<CustomHeaderProps> = ({
  title,
  backgroundColor = "rgba(255, 255, 255, 0)",
  textColor = "#ffffffff",
  rightAction,
  rightActionIcon,
  hideBackButton = false,
  blurIntensity = 0,
  largeTitle = false,
}) => {
  const navigation = useNavigation();
  const HeaderComponent = blurIntensity > 0 ? BlurView : View;

  return (
    <HeaderComponent
      style={[
        styles.headerBase,
        largeTitle ? styles.headerLarge : styles.headerStandard,
        { backgroundColor },
      ]}
    >
      {/*        <StatusBar style="light" /> */}
      <View
        style={[
          styles.contentContainer,
          largeTitle && styles.contentContainerLarge,
        ]}
      >
        {/* Bouton retour */}
        <View style={styles.leftContainer}>
          {!hideBackButton && !largeTitle && (
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.iconWrapper,
                pressed && styles.iconPressed,
              ]}
              android_ripple={{ color: "rgba(0,0,0,0.05)", borderless: true }}
            >
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </Pressable>
          )}
        </View>

        {/* Titre */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.titleBase,
              largeTitle ? styles.titleLarge : styles.titleStandard,
              { color: textColor },
            ]}
            numberOfLines={largeTitle ? 2 : 1}
          >
            {title}
          </Text>
        </View>

        {/* Action à droite */}
        <View style={styles.rightContainer}>
          {rightAction && !largeTitle && (
            <Pressable
              onPress={rightAction}
              style={({ pressed }) => [
                styles.iconWrapper,
                pressed && styles.iconPressed,
              ]}
              android_ripple={{
                color: "rgba(202, 9, 9, 0.05)",
                borderless: true,
              }}
            >
              {rightActionIcon || (
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color={textColor}
                />
              )}
            </Pressable>
          )}
        </View>
      
      </View>
    </HeaderComponent>
  );
};

export default HeaderCustom;

const styles = StyleSheet.create({
  headerBase: {
    width: "100%",
    zIndex: 10,
  },
  headerStandard: {
    marginTop: Platform.OS === "ios" ? 0 : 0,
    paddingTop: Platform.OS === "ios" ? 44 : 0,
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  headerLarge: {
    minHeight: 110,
    justifyContent: "flex-end",
  },

  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contentContainerLarge: {
    alignItems: "flex-end",
    paddingBottom: 12,
  },

  leftContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  rightContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  titleContainer: {
    flex: Platform.OS === "ios" ? 2 : 3,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBase: {
    fontWeight: "600",
    textAlign: "center",
  },
  titleStandard: {
    fontSize: 18,
  },
  titleLarge: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 24,
    overflow: "hidden",
  },
  iconPressed: {
    opacity: 0.6,
  },
});
