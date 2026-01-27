import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import ImageHeader from "./ImageHeader";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LayoutAuth = ({ children }: { children: React.ReactNode }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <ImageHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[styles.formSheet, { backgroundColor: theme.background }]}
          >
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LayoutAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formSheet: {
    borderRadius: 0,
    paddingHorizontal: 32,
    paddingTop: 5,
    minHeight: SCREEN_HEIGHT * 0.6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
});
