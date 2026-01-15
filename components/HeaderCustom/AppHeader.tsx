// components/AppHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ButtonConfig {
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
}

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  RightComponent?: React.ReactNode;
  leftButton?: ButtonConfig; 
  rightButton?: ButtonConfig; 
  secondRightButton?: ButtonConfig; 
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  RightComponent,
  leftButton,
  rightButton,
  secondRightButton,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const renderLeftButton = () => {
    if (leftButton) {
      return (
        <TouchableOpacity
          onPress={leftButton.onPress}
          style={[styles.button, leftButton.style]}
          disabled={leftButton.disabled}
        >
          {leftButton.icon && (
            <Ionicons
              name={leftButton.icon}
              size={leftButton.iconSize || 26}
              color={
                leftButton.disabled ? "#ccc" : leftButton.iconColor || "#333"
              }
            />
          )}
          {leftButton.text && (
            <Text
              style={[
                styles.buttonText,
                leftButton.textStyle,
                leftButton.disabled && styles.disabledText,
              ]}
            >
              {leftButton.text}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    if (showBackButton) {
      return (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
      );
    }

    return <View style={styles.headerLeftPlaceholder} />;
  };

  // Rendu d'un bouton personnalisé
  const renderCustomButton = (buttonConfig: ButtonConfig, key: string) => {
    return (
      <TouchableOpacity
        key={key}
        onPress={buttonConfig.onPress}
        style={[styles.button, buttonConfig.style]}
        disabled={buttonConfig.disabled}
      >
        {buttonConfig.icon && (
          <Ionicons
            name={buttonConfig.icon}
            size={buttonConfig.iconSize || 24}
            color={
              buttonConfig.disabled ? "#ccc" : buttonConfig.iconColor || "#333"
            }
          />
        )}
        {buttonConfig.text && (
          <Text
            style={[
              styles.buttonText,
              buttonConfig.textStyle,
              buttonConfig.disabled && styles.disabledText,
            ]}
          >
            {buttonConfig.text}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Rendu de la partie droite
  const renderRightSection = () => {
    if (RightComponent) {
      return RightComponent;
    }

    const buttons = [];
    if (rightButton) {
      buttons.push(renderCustomButton(rightButton, "right"));
    }
    if (secondRightButton) {
      buttons.push(renderCustomButton(secondRightButton, "secondRight"));
    }

    if (buttons.length > 0) {
      return <View style={styles.rightButtonsContainer}>{buttons}</View>;
    }

    return <View style={styles.headerRightPlaceholder} />;
  };

  return (
    <View style={styles.header}>
      {renderLeftButton()}
      <Text style={styles.headerTitle}>{title}</Text>
      {renderRightSection()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 2,
  },
  button: {
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  disabledText: {
    color: "#ccc",
  },
  rightButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Espacement entre les boutons
  },
  headerLeftPlaceholder: {
    width: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    flex: 1,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 30,
  },
});

export default AppHeader;
