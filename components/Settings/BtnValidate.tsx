import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Loader } from "@/components/ui/Loader";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { ThemedText } from "@/components/themed-text";

interface BtnValidateProps {
  hasChanges: boolean;
  isSaving: boolean;
  handleSave: () => void;
  text?: string;
  isAvailable?: boolean | null;
}

const BtnValidate = ({
  hasChanges,
  isSaving,
  handleSave,
  text = "ENREGISTRER LE PROFIL",
  isAvailable = true,
}: BtnValidateProps) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: theme.primary },
          (!hasChanges || !isAvailable || isSaving) && { opacity: 0.5 },
        ]}
        onPress={handleSave}
        disabled={!hasChanges || !isAvailable || isSaving}
        activeOpacity={0.9}
      >
        {isSaving ? (
          <Loader size="small" />
        ) : (
          <ThemedText type="label" lightColor="#FFF" darkColor="#000">
            {text}
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BtnValidate;

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
