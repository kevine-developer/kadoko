import { StyleSheet,View,TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '@/hooks/custom/use-app-theme'
import { ThemedText } from '@/components/themed-text'


interface BtnValidateProps {
    hasChanges: boolean;
    isSaving: boolean;
    handleSave: () => void;
    text?: string;
}

const BtnValidate = ({ hasChanges, isSaving, handleSave, text="ENREGISTRER LE PROFIL" }: BtnValidateProps) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
               <TouchableOpacity
                 style={[
                   styles.primaryBtn,
                   { backgroundColor: theme.primary },
                   (!hasChanges || isSaving) && { opacity: 0.5 },
                 ]}
                 onPress={handleSave}
                 disabled={!hasChanges || isSaving}
                 activeOpacity={0.9}
               >
                 {isSaving ? (
                   <ActivityIndicator color={theme.background} size="small" />
                 ) : (
                   <ThemedText type="label" lightColor="#FFF" darkColor="#000">
                    {text}
                   </ThemedText>
                 )}
               </TouchableOpacity>
             </View>
  )
}

export default BtnValidate

const styles = StyleSheet.create({  footer: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },})