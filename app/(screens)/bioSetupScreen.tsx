import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { MotiView } from "moti";

export default function BioSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const [bio, setBio] = useState(user?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const MAX_CHARS = 160;
  const hasChanges =
    bio.trim() !== (user?.description || "") && bio.length <= MAX_CHARS;

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      const res = await userService.updateProfile({ description: bio.trim() });
      if (res.success) {
        showSuccessToast("Biographie mise à jour !");
        await refetch();
        router.back();
      } else {
        showErrorToast(res.message || "Une erreur est survenue");
      }
    } catch (error) {
      showErrorToast("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Biographie</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
            style={styles.inner}
          >
            <View style={styles.infoBox}>
              <Text style={styles.title}>Parlez-nous de vous</Text>
              <Text style={styles.subtitle}>
                Une bio courte aide vos amis à mieux vous connaître et à trouver
                les cadeaux parfaits.
              </Text>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={bio}
                onChangeText={setBio}
                placeholder="Ex: Passionné de cuisine et de voyages..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={MAX_CHARS}
                autoFocus
              />
              <View style={styles.charCounter}>
                <Text
                  style={[
                    styles.charText,
                    bio.length >= MAX_CHARS && { color: "#EF4444" },
                  ]}
                >
                  {bio.length}/{MAX_CHARS}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!hasChanges || isSaving) && styles.saveBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Enregistrer ma bio</Text>
                )}
              </TouchableOpacity>
            </View>
          </MotiView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  content: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  infoBox: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  inputWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 16,
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    height: 100,
    textAlignVertical: "top",
  },
  charCounter: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  charText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  saveBtn: {
    backgroundColor: "#111827",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
