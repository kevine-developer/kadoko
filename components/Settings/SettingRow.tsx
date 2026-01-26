import { StyleSheet, TouchableOpacity, View, Switch } from "react-native";
import React from "react";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { Ionicons } from "@expo/vector-icons";

interface SettingRowProps {
  label: string;
  value?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isDanger?: boolean;
  isLast?: boolean;
  subLabel?: string;
  badge?: string;
  badgeColor?: string;
  isComingSoon?: boolean;
}

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
}: SettingRowProps) => {
  const theme = useAppTheme();
  const isDisabled = isComingSoon;

  // Logique de couleur pour l'icône
  const getIconColorName = () => {
    if (isDanger) return "danger";
    if (isDisabled) return "textSecondary";
    return "accent";
  };

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.6}
      onPress={
        isDisabled
          ? undefined
          : isSwitch
            ? () => onSwitchChange?.(!switchValue)
            : onPress
      }
      style={[
        styles.rowContainer,
        { borderBottomColor: theme.border },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={[styles.rowLeft, isDisabled && { opacity: 0.4 }]}>
        <View style={styles.iconWrapper}>
          <Icon name={icon} size={18} colorName={getIconColorName()} />
        </View>

        <View style={styles.labelContainer}>
          <View style={styles.labelHeader}>
            <ThemedText
              type="defaultBold"
              colorName={isDanger ? "danger" : "textMain"}
              style={styles.rowLabel}
            >
              {label}
            </ThemedText>

            {badge && !isComingSoon && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeColor || theme.accent },
                ]}
              >
                <ThemedText
                  type="label"
                  colorName="surface"
                  style={styles.badgeText}
                >
                  {badge}
                </ThemedText>
              </View>
            )}
          </View>

          {subLabel && (
            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.rowSubLabel}
            >
              {subLabel}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.rowRight}>
        {isComingSoon ? (
          <View
            style={[styles.comingSoonBadge, { backgroundColor: theme.surface }]}
          >
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.comingSoonText}
            >
              Bientôt
            </ThemedText>
          </View>
        ) : isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFF"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        ) : (
          <View style={styles.valueGroup}>
            {value && (
              <ThemedText
                type="default"
                colorName="textSecondary"
                style={styles.rowValue}
              >
                {value}
              </ThemedText>
            )}
            <Icon name="chevron-forward" size={14} colorName="accent" />
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
    paddingVertical: 10,
    borderBottomWidth: 0.5,
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
    letterSpacing: -0.2,
  },
  rowSubLabel: {
    fontSize: 12,
    marginTop: 2,
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
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.05)",
  },
  comingSoonText: {
    fontSize: 9,
  },
});
