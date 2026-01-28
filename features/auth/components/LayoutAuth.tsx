import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Image } from "expo-image";
import { MotiView } from "moti";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LayoutAuth = ({ children }: { children: React.ReactNode }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. BACKGROUND IMMERSIF FIXE (Ne bouge pas avec le clavier) */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={{
            uri: "https://plus.unsplash.com/premium_photo-1672233867062-64af815416dd?q=80&w=627&auto=format&fit=crop",
          }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={1000}
        />
        {/* Overlay Dégradé/Sombre pour lisibilité */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.4)" },
          ]}
        />
      </View>

      {/* 2. CONTENU SCROLLABLE & CLAVIER */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              {/* ESPACE SUPERIEUR FLEXIBLE */}
              <View style={{ flex: 1, minHeight: 100 }} />

              {/* LOGO ANIMÉ */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 1000, delay: 300 }}
                style={[styles.brandSection, { marginTop: insets.top }]}
              >
                <ThemedText style={styles.brandText}>
                  GIFT<ThemedText style={styles.brandItalic}>FLOW</ThemedText>
                </ThemedText>
                <View style={styles.logoDivider} />
                <ThemedText style={styles.tagline}>
                  L&apos;ART D&apos;OFFRIR
                </ThemedText>
              </MotiView>

              {/* FORMULAIRE TYPE 'SHEET' */}
              <MotiView
                from={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                style={[
                  styles.formSheet,
                  { backgroundColor: theme.background },
                ]}
              >
                {children}
                <View style={{ height: 40 }} />
              </MotiView>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LayoutAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Fallback
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 40,
    zIndex: 10,
  },
  brandText: {
    fontSize: 32,
    fontWeight: "300",
    letterSpacing: 6,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandItalic: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontWeight: "400",
  },
  logoDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginVertical: 12,
  },
  tagline: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 3,
    fontWeight: "600",
  },
  formSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 32,
    paddingTop: 40,
    minHeight: SCREEN_HEIGHT * 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
});
