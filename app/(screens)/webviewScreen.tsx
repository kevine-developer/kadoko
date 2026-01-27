import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

export default function WebviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  const webViewRef = useRef<WebView>(null);

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <ThemedIcon name="close-outline" size={26} colorName="textMain" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={styles.headerLabel}
          >
            SOURCE EXTERNE
          </ThemedText>
          <ThemedText
            type="defaultBold"
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {title || "Navigation"}
          </ThemedText>
        </View>

        <TouchableOpacity
          onPress={handleOpenExternal}
          style={styles.externalBtn}
        >
          <ThemedIcon name="share-outline" size={20} colorName="textMain" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        {progress < 1 && (
          <MotiView
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "timing", duration: 250 }}
            style={[styles.progressBar, { backgroundColor: theme.accent }]}
          />
        )}
      </View>

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
            <View
              style={[
                styles.loadingOverlay,
                { backgroundColor: theme.background },
              ]}
            >
              <ActivityIndicator size="small" color={theme.accent} />
            </View>
          )}
        />
      </View>

      <View
        style={[
          styles.toolbar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 25,
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
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
            <ThemedIcon name="chevron-back" size={24} colorName="textMain" />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canGoForward}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              webViewRef.current?.goForward();
            }}
            style={[styles.toolbarBtn, !canGoForward && styles.btnDisabled]}
          >
            <ThemedIcon name="chevron-forward" size={24} colorName="textMain" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            webViewRef.current?.reload();
          }}
          style={styles.refreshBtn}
        >
          <ThemedIcon
            name="refresh-outline"
            size={20}
            colorName="textSecondary"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 15,
  },
  headerLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
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
  progressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "transparent",
    zIndex: 20,
  },
  progressBar: {
    height: "100%",
  },
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
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 15,
    borderTopWidth: 1,
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
