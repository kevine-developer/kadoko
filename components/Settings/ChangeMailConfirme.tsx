import { StyleSheet, View } from "react-native";
import React from "react";
import { ThemedText } from "../themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import Icon from "../themed-icon";
import { MotiView } from "moti";

interface ChangeMailConfirmeProps {
  newEmail: string;
}

const ChangeMailConfirme = ({ newEmail }: ChangeMailConfirmeProps) => {
  const theme = useAppTheme();
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.successCard}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.surface,
            borderColor: theme.accent,
          },
        ]}
      >
        <Icon name="mail-unread-outline" size={40} colorName="accent" />
      </View>

      <ThemedText type="title" style={styles.successTitle}>
        Lien envoyé !
      </ThemedText>

      <ThemedText
        type="subtitle"
        colorName="textSecondary"
        style={styles.successText}
      >
        Un email de confirmation a été expédié à{"\n"}
        <ThemedText type="default" style={{ color: theme.textMain }} bold>
          {newEmail}
        </ThemedText>
        .
      </ThemedText>

      <ThemedText
        type="caption"
        colorName="textSecondary"
        style={styles.successHint}
      >
        Veuillez cliquer sur le lien dans l&apos;email pour valider le
        changement. Votre adresse actuelle restera active tant que la
        vérification n&apos;est pas terminée.
      </ThemedText>
    </MotiView>
  );
};

export default ChangeMailConfirme;

const styles = StyleSheet.create({
  successCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 25,
  },
  successTitle: {
    marginBottom: 15,
  },
  successText: {
    textAlign: "center",
    marginBottom: 20,
  },
  successHint: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});
