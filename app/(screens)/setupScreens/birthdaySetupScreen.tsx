import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Haptics from "expo-haptics";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import BtnValidate from "@/components/Settings/BtnValidate";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";
import NavBar from "@/features/setting/components/navBar";

export default function BirthdaySetupScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const initialDate = user?.birthday
    ? new Date(user.birthday)
    : new Date(2000, 0, 1);

  const [date, setDate] = useState<Date>(initialDate);
  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const hasChanges = user?.birthday
    ? new Date(user.birthday).toDateString() !== date.toDateString()
    : true;

  const showDatePicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await userService.updateProfile({
        birthday: date.toISOString(),
      } as any);

      if (res.success) {
        showSuccessToast("Profil mis à jour");
        await refetch();
        router.back();
      } else {
        showErrorToast(res.message || "Erreur");
      }
    } catch {
      showErrorToast("Erreur serveur");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavBar title="ANNIVERSAIRE" />

      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 700 }}
          style={styles.heroSection}
        >
          <ThemedText type="hero" style={styles.heroTitle}>
            Votre date{"\n"}de naissance.
          </ThemedText>

          <View
            style={[styles.titleDivider, { backgroundColor: theme.accent }]}
          />

          <ThemedText type="subtitle" colorName="textSecondary">
            Cette information permet à votre cercle de célébrer votre journée
            spéciale et de préparer vos attentions.
          </ThemedText>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300 }}
          style={styles.registrySection}
        >
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={{ marginBottom: 12 }}
          >
            MOMENT DE CÉLÉBRATION
          </ThemedText>

          <TouchableOpacity
            onPress={showDatePicker}
            activeOpacity={0.7}
            style={[styles.dateSelector, { borderBottomColor: theme.border }]}
          >
            <ThemedText type="title" style={{ fontSize: 22 }}>
              {formatDate(date)}
            </ThemedText>

            <ThemedText type="label" colorName="accent">
              MODIFIER
            </ThemedText>
          </TouchableOpacity>
        </MotiView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={date}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          confirmTextIOS="Confirmer"
          cancelTextIOS="Annuler"
          locale="fr_FR"
          maximumDate={new Date()}
        />
      </View>

      <BtnValidate
        hasChanges={hasChanges}
        isSaving={isSaving}
        handleSave={handleSave}
        text="ENREGISTRER LA DATE"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 30 },
  heroSection: { marginBottom: 50 },
  heroTitle: { marginBottom: 10 },
  titleDivider: { width: 35, height: 2, marginVertical: 25 },
  registrySection: { marginTop: 10 },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
});
