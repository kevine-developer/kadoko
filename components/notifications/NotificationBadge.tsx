import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated, Platform } from "react-native";
import { useNotifications } from "../../hooks/useNotifications";

export const NotificationBadge = () => {
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
      style={[styles.badge, { transform: [{ scale: scaleAnim }] }]}
    >
      <Text style={styles.text}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -2,
    right: 35,
    backgroundColor: "#d3a40adc", // Noir profond Luxe
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FDFBF7", // Bone Silk
    zIndex: 10,
  },
  text: {
    color: "white",
    fontSize: 8,
    fontWeight: "900",
    textAlign: "center",
    ...Platform.select({
      ios: { lineHeight: 0 }, // Centre mieux sur iOS
    }),
  },
});
