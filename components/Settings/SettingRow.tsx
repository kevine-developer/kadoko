import { StyleSheet, Text, TouchableOpacity, View, Switch } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "rgba(0,0,0,0.06)",
  danger: "#EF4444",
  disabled: "#F3F4F6", // Gris très clair pour le fond badge
  disabledText: "#9CA3AF", // Gris moyen pour le texte
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
  isComingSoon = false, // ✅ NOUVELLE PROP
}: any) => {
  // Si "Bientôt", on désactive le bouton
  const isDisabled = isComingSoon;

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.7}
      onPress={
        isDisabled
          ? undefined
          : isSwitch
            ? () => onSwitchChange(!switchValue)
            : onPress
      }
      style={[
        styles.rowContainer,
        isLast && { borderBottomWidth: 0 },
        isDisabled && { opacity: 0.6 }, // ✅ Feedback visuel global
      ]}
    >
      <View style={styles.rowLeft}>
        <View
          style={[styles.iconBox, isDanger && { backgroundColor: "#FEF2F2" }]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={isDanger ? THEME.danger : THEME.textMain}
          />
        </View>
        <View style={styles.labelContainer}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={[styles.rowLabel, isDanger && { color: THEME.danger }]}
            >
              {label}
            </Text>

            {/* Badge existant (ex: "Action requise") */}
            {badge && !isComingSoon && (
              <View
                style={[
                  styles.badge,
                  badgeColor && { backgroundColor: badgeColor },
                ]}
              >
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subLabel && <Text style={styles.rowSubLabel}>{subLabel}</Text>}
        </View>
      </View>

      <View style={styles.rowRight}>
        {/* ✅ LOGIQUE D'AFFICHAGE MODIFIÉE */}
        {isComingSoon ? (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Bientôt</Text>
          </View>
        ) : isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E5E7EB", true: THEME.primary }}
            thumbColor="#FFF"
          />
        ) : (
          <>
            {value && <Text style={styles.rowValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SettingRow;

const styles = StyleSheet.create({
  /* ROW ITEM */
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  labelContainer: {
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.textMain,
  },
  rowSubLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    color: THEME.textSecondary,
  },

  /* BADGE CLASSIQUE */
  badge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
  },

  /* ✅ BADGE "BIENTÔT" (Style discret) */
  comingSoonBadge: {
    backgroundColor: THEME.disabled,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.disabledText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
