import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { authClient } from "@/features/auth";
import SettingHero from "@/components/Settings/SettingHero";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";
import NavBar from "@/features/setting/components/navBar";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasPassword = user?.hasPassword ?? true;

  const handleDelete = async () => {
    if (hasPassword && !password) {
      showErrorToast("Mot de passe requis");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setLoading(true);
    try {
      const res = await userService.deleteAccount({ password });
      if (res.success) {
        showSuccessToast("Compte clôturé");
        await authClient.signOut();
        router.replace("/(auth)/sign-in");
      } else {
        showErrorToast(res.message);
      }
    } catch {
      showErrorToast("Erreur système");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <NavBar title="Suppression" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SettingHero
              title={`Est-ce\nun adieu ?`}
              subtitle="La clôture de votre compte est une action définitive. Toutes vos collections précieuses seront effacées de nos registres."
            />

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 300 }}
              style={styles.infoSection}
            >
              <View style={styles.infoItem}>
                <ThemedText
                  type="label"
                  colorName="accent"
                  style={styles.infoNumber}
                >
                  01
                </ThemedText>
                <View>
                  <ThemedText type="label" style={styles.infoLabel}>
                    RÉINSCRIPTION
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
                    colorName="textSecondary"
                    style={styles.infoValue}
                  >
                    Possible dans 30 jours uniquement
                  </ThemedText>
                </View>
              </View>

              <View style={styles.infoItem}>
                <ThemedText
                  type="label"
                  colorName="accent"
                  style={styles.infoNumber}
                >
                  02
                </ThemedText>
                <View>
                  <ThemedText type="label" style={styles.infoLabel}>
                    CONFIDENTIALITÉ
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
                    colorName="textSecondary"
                    style={styles.infoValue}
                  >
                    Profil masqué instantanément
                  </ThemedText>
                </View>
              </View>
            </MotiView>

            {hasPassword && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 500 }}
                style={styles.formSection}
              >
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.inputLabel}
                >
                  MOT DE PASSE DE SÉCURITÉ
                </ThemedText>
                <View
                  style={[
                    styles.inputUnderline,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.textMain }]}
                    placeholder="Votre signature numérique"
                    placeholderTextColor="#BCBCBC"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    selectionColor={theme.accent}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <ThemedText type="label" style={styles.showText}>
                      {showPassword ? "MASQUER" : "VOIR"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </MotiView>
            )}

            <View style={{ flex: 1, minHeight: 60 }} />

            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
                activeOpacity={0.9}
              >
                <ThemedText type="label" style={{ color: theme.background }}>
                  Conserver mon compte
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={styles.ghostBtn}
                disabled={loading || (hasPassword && !password)}
              >
                {loading ? (
                  <ActivityIndicator color={theme.textSecondary} size="small" />
                ) : (
                  <ThemedText
                    type="default"
                    colorName="textSecondary"
                    style={styles.ghostBtnText}
                  >
                    Je confirme la clôture définitive
                  </ThemedText>
                )}
              </TouchableOpacity>

              <ThemedText type="caption" style={styles.disclaimer}>
                En confirmant, vous acceptez les conditions de résiliation.
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25 },
  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  scrollContent: { paddingHorizontal: 32, flexGrow: 1 },
  infoSection: { gap: 24, marginBottom: 40 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  infoNumber: { marginTop: 4 },
  infoLabel: { letterSpacing: 1.5, marginBottom: 4 },
  infoValue: {},
  formSection: { marginBottom: 20 },
  inputLabel: { letterSpacing: 2, marginBottom: 15 },
  inputUnderline: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    height: 50,
  },
  input: { flex: 1, fontSize: 16 },
  showText: { letterSpacing: 1 },
  footer: { marginTop: "auto", alignItems: "center", gap: 20 },
  primaryBtn: {
    width: "100%",
    height: 60,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  ghostBtn: { paddingVertical: 10 },
  ghostBtnText: { textDecorationLine: "underline", opacity: 0.8 },
  disclaimer: { color: "#BCBCBC", textAlign: "center", marginTop: 10 },
});
