import { StyleSheet, Text, TouchableOpacity, View, Switch, Platform } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.06)",
  danger: "#C34A4A",
  disabled: "rgba(0,0,0,0.03)",
};

const SettingRow = ({
  label,
  value,
  icon,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  isDanger,
  isLast,
  subLabel,
  badge,
  badgeColor,
  isComingSoon = false,
}: any) => {
  const isDisabled = isComingSoon;

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.6}
      onPress={isDisabled ? undefined : isSwitch ? () => onSwitchChange(!switchValue) : onPress}
      style={[styles.rowContainer, isLast && { borderBottomWidth: 0 }]}
    >
      <View style={[styles.rowLeft, isDisabled && { opacity: 0.4 }]}>
        <View style={styles.iconWrapper}>
          <Ionicons
            name={icon}
            size={18}
            color={isDanger ? THEME.danger : (isDisabled ? THEME.textSecondary : THEME.accent)}
          />
        </View>
        
        <View style={styles.labelContainer}>
          <View style={styles.labelHeader}>
            <Text style={[styles.rowLabel, isDanger && { color: THEME.danger }]}>
              {label}
            </Text>
            {badge && !isComingSoon && (
              <View style={[styles.badge, badgeColor && { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subLabel && <Text style={styles.rowSubLabel}>{subLabel}</Text>}
        </View>
      </View>

      <View style={styles.rowRight}>
        {isComingSoon ? (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Bientôt</Text>
          </View>
        ) : isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E9E9EB", true: THEME.primary }}
            thumbColor="#FFF"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} // Plus discret
          />
        ) : (
          <View style={styles.valueGroup}>
            {value && <Text style={styles.rowValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SettingRow;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconWrapper: {
    width: 20,
    alignItems: "center",
  },
  labelContainer: {
    flex: 1,
  },
  labelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.textMain,
    letterSpacing: -0.2,
  },
  rowSubLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  comingSoonBadge: {
    backgroundColor: THEME.disabled,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});