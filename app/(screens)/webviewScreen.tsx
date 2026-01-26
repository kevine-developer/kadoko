import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Papier / Bone
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.06)",
  progressBar: "#AF9062",
};

export default function WebviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  const webViewRef = useRef<WebView>(null);

  // States pour la navigation
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleOpenExternal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (url) Linking.openURL(url);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* HEADER ÉDITORIAL */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close-outline" size={26} color={THEME.textMain} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerLabel}>SOURCE EXTERNE</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || "Navigation"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenExternal}
          style={styles.externalBtn}
        >
          <Ionicons name="share-outline" size={20} color={THEME.textMain} />
        </TouchableOpacity>
      </View>

      {/* PROGRESS BAR - FIL D'OR */}
      <View style={styles.progressTrack}>
        {progress < 1 && (
          <MotiView
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "timing", duration: 250 }}
            style={styles.progressBar}
          />
        )}
      </View>

      {/* WEBVIEW CONTAINER */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onLoadProgress={({ nativeEvent }) =>
            setProgress(nativeEvent.progress)
          }
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={THEME.accent} />
            </View>
          )}
        />
      </View>

      {/* TOOLBAR DE NAVIGATION BASSE */}
      <View
        style={[
          styles.toolbar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 25 },
        ]}
      >
        <View style={styles.controlsGroup}>
          <TouchableOpacity
            disabled={!canGoBack}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              webViewRef.current?.goBack();
            }}
            style={[styles.toolbarBtn, !canGoBack && styles.btnDisabled]}
          >
            <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canGoForward}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              webViewRef.current?.goForward();
            }}
            style={[styles.toolbarBtn, !canGoForward && styles.btnDisabled]}
          >
            <Ionicons name="chevron-forward" size={24} color={THEME.textMain} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            webViewRef.current?.reload();
          }}
          style={styles.refreshBtn}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: THEME.background,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 15,
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    textAlign: "center",
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  externalBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  /* PROGRESS BAR */
  progressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "transparent",
    zIndex: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: THEME.progressBar,
  },

  /* WEBVIEW */
  webviewContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },

  /* TOOLBAR BASSE */
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 15,
    backgroundColor: THEME.background,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  controlsGroup: {
    flexDirection: "row",
    gap: 30,
  },
  toolbarBtn: {
    padding: 5,
  },
  refreshBtn: {
    padding: 5,
  },
  btnDisabled: {
    opacity: 0.2,
  },
});
