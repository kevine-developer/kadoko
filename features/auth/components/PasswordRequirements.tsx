import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

interface PasswordRequirementsProps {
  password?: string;
  visible: boolean;
}

export const PasswordRequirements = ({
  password = "",
  visible,
}: PasswordRequirementsProps) => {
  const theme = useAppTheme();

  if (!visible) return null;

  const checks = [
    {
      label: "8 caractères minimum",
      isValid: password.length >= 8,
    },
    {
      label: "Une majuscule",
      isValid: /[A-Z]/.test(password),
    },
    {
      label: "Une minuscule",
      isValid: /[a-z]/.test(password),
    },
    {
      label: "Un chiffre",
      isValid: /\d/.test(password),
    },
  ];

  // Calcul du score global pour la couleur de progression (optionnel, pour l'instant simple liste)
  // const score = checks.filter((c) => c.isValid).length;

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 10 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.container}
        >
          <ThemedText type="caption" style={styles.title}>
            Le mot de passe doit contenir :
          </ThemedText>
          <View style={styles.grid}>
            {checks.map((check, index) => (
              <RequirementItem
                key={index}
                label={check.label}
                isValid={check.isValid}
                theme={theme}
              />
            ))}
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const RequirementItem = ({
  label,
  isValid,
  theme,
}: {
  label: string;
  isValid: boolean;
  theme: any;
}) => {
  return (
    <View style={styles.item}>
      <MotiView
        animate={{
          backgroundColor: isValid ? theme.success : theme.border,
          scale: isValid ? 1.1 : 1,
        }}
        style={styles.dot}
      />
      <ThemedText
        type="caption"
        style={[
          styles.label,
          {
            color: isValid ? theme.textMain : theme.textSecondary,
            textDecorationLine: isValid ? "line-through" : "none",
            opacity: isValid ? 0.6 : 1,
          },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 11,
    marginBottom: 8,
    opacity: 0.7,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "45%", // Pour faire 2 colonnes
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
  },
});
