import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  ActivityIndicator,
} from "react-native";

interface SettingsRowProps {
  label: string;
  value?: string | boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  type?: "navigation" | "switch" | "value" | "danger";
  onValueChange?: (value: boolean) => void;
  loading?: boolean;
  last?: boolean;
  description?: string;
}

const SettingsRow = ({
  label,
  value,
  icon,
  onPress,
  type = "navigation",
  onValueChange,
  loading = false,
  last = false,
  description,
}: SettingsRowProps) => {
  const isSwitch = type === "switch";
  const isDanger = type === "danger";

  return (
    <TouchableOpacity
      style={[styles.container, last && styles.lastContainer]}
      onPress={onPress}
      disabled={isSwitch || loading || !onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, isDanger && styles.iconBoxDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={isDanger ? "#EF4444" : "#111827"}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.label, isDanger && styles.labelDanger]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#111827" />
      ) : (
        <View style={styles.rightContent}>
          {type === "value" && (
            <Text style={styles.valueText} numberOfLines={1}>
              {value}
            </Text>
          )}

          {isSwitch ? (
            <Switch
              value={!!value}
              onValueChange={onValueChange}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          ) : (
            !isSwitch &&
            type !== "value" && (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDanger ? "#EF4444" : "#D1D5DB"}
              />
            )
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SettingsRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  lastContainer: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconBoxDanger: {
    backgroundColor: "#FEF2F2",
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  description: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  labelDanger: {
    color: "#EF4444",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "50%",
  },
  valueText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginRight: 4,
  },
});
