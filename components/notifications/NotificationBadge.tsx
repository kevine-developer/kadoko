import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import { useNotifications } from "../../hooks/useNotifications";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

export const NotificationBadge = () => {
  const theme = useAppTheme();
  const { unreadCount } = useNotifications();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: unreadCount > 0 ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount]);

  if (unreadCount === 0) return null;

  return (
    <Animated.View
      style={[
        styles.badge,
        { transform: [{ scale: scaleAnim }], borderColor: theme.background },
      ]}
    >
      <ThemedText type="caption" style={styles.text}>
        {unreadCount > 9 ? "9+" : unreadCount}
      </ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -2,
    right: 35,
    backgroundColor: "#D3A40A",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    zIndex: 10,
  },
  text: {
    color: "white",
    fontSize: 8,
    fontWeight: "900",
    textAlign: "center",
  },
});
