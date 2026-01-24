import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Haptics from "expo-haptics";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

export default function BirthdaySetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      {/* NAV BAR MINIMALISTE */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>ANNIVERSAIRE</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* HERO SECTION */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 700 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Votre date{"\n"}de naissance.</Text>
          <View style={styles.titleDivider} />
          <Text style={styles.heroSubtitle}>
            Cette information permet à votre cercle de célébrer votre journée
            spéciale et de préparer vos attentions.
          </Text>
        </MotiView>

        {/* DATE DISPLAY - STYLE REGISTRE */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300 }}
          style={styles.registrySection}
        >
          <Text style={styles.miniLabel}>MOMENT DE CÉLÉBRATION</Text>
          <TouchableOpacity
            onPress={showDatePicker}
            activeOpacity={0.7}
            style={styles.dateSelector}
          >
            <Text style={styles.dateValue}>{formatDate(date)}</Text>
            <Text style={styles.modifyLink}>MODIFIER</Text>
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

      {/* FOOTER ACTION - BOUTON RECTANGULAIRE LUXE */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!hasChanges || isSaving) && styles.primaryBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
          activeOpacity={0.9}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>ENREGISTRER LA DATE</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },
  /* CONTENT */
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 30,
  },
  heroSection: {
    marginBottom: 50,
  },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 44,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    backgroundColor: THEME.accent,
    marginVertical: 25,
  },
  heroSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 24,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  /* REGISTRE DATE */
  registrySection: {
    marginTop: 10,
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 15,
  },
  dateValue: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  modifyLink: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
    marginBottom: 5,
  },
  /* FOOTER & BUTTON */
  footer: {
    paddingHorizontal: 32,
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0, // Rectangulaire luxe autoritaire
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
