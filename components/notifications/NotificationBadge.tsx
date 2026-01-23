import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useNotifications } from "../../hooks/useNotifications";

export const NotificationBadge = () => {
  const { unreadCount } = useNotifications();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [unreadCount]);

  if (unreadCount === 0) return null;

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.text}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "white",
    zIndex: 10,
  },
  text: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
