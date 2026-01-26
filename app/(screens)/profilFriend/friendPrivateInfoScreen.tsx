import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { userService } from "@/lib/services/user-service";
import { showErrorToast } from "@/lib/toast";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

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

export default function FriendPrivateInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { friendId, name } = useLocalSearchParams<{
    friendId: string;
    name: string;
  }>();
  const [friendInfo, setFriendInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await userService.getPrivateInfo(friendId);
        if (res.success) {
          setFriendInfo((res as any).user);
        } else {
          showErrorToast("Accès restreint aux données");
        }
      } catch {
        showErrorToast("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [friendId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="small" color={THEME.accent} />
      </View>
    );
  }

  const p = friendInfo?.privateInfo || {};

  const renderInfoRow = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.dotSeparator} />
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    );
  };

  const SectionRegistry = ({ title, icon, children }: any) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={THEME.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* NAV BAR MINIMALISTE */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>PRÉFÉRENCES</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 700 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>
            Notes sur{"\n"}
            {name}.
          </Text>
          <View style={styles.titleDivider} />
          <Text style={styles.heroSubtitle}>
            Ces détails précieux vous guideront pour choisir le présent parfait.
          </Text>
        </MotiView>

        {/* CONTENU REGISTRE */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 300 }}
        >
          <SectionRegistry title="GARDE-ROBE" icon="shirt-outline">
            {renderInfoRow("HAUT", p.clothing?.topSize)}
            {renderInfoRow("BAS", p.clothing?.bottomSize)}
            {renderInfoRow("POINTURE", p.clothing?.shoeSize)}
            {!p.clothing?.topSize &&
              !p.clothing?.bottomSize &&
              !p.clothing?.shoeSize && (
                <Text style={styles.emptyNote}>Aucune mesure enregistrée.</Text>
              )}
          </SectionRegistry>

          <SectionRegistry title="JOAILLERIE" icon="diamond-outline">
            {renderInfoRow("TOUR DE DOIGT", p.jewelry?.ringSize)}
            {renderInfoRow("MÉTAL PRÉFÉRÉ", p.jewelry?.preference)}
            {!p.jewelry?.ringSize && !p.jewelry?.preference && (
              <Text style={styles.emptyNote}>Aucune préférence notée.</Text>
            )}
          </SectionRegistry>

          <SectionRegistry title="GOÛTS & DIÈTE" icon="restaurant-outline">
            {p.diet?.allergies?.length > 0 && (
              <View style={styles.noteBlock}>
                <Text style={styles.blockLabel}>ALLERGIES SIGNALEES</Text>
                <Text style={styles.blockValue}>
                  {p.diet.allergies.join(", ")}
                </Text>
              </View>
            )}
            {p.diet?.preferences?.length > 0 && (
              <View style={[styles.noteBlock, { marginTop: 15 }]}>
                <Text style={styles.blockLabel}>RÉGIMES ALIMENTAIRES</Text>
                <Text style={styles.blockValue}>
                  {p.diet.preferences.join(", ")}
                </Text>
              </View>
            )}
            {!p.diet?.allergies?.length && !p.diet?.preferences?.length && (
              <Text style={styles.emptyNote}>Aucune restriction connue.</Text>
            )}
          </SectionRegistry>

          <SectionRegistry title="LOGISTIQUE" icon="cube-outline">
            {p.delivery?.address ? (
              <View style={styles.noteBlock}>
                <Text style={styles.blockLabel}>ADRESSE DE LIVRAISON</Text>
                <Text style={styles.addressValue}>
                  {[
                    p.delivery.address.street,
                    p.delivery.address.postalCode,
                    p.delivery.address.city,
                    p.delivery.address.country,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                </Text>
              </View>
            ) : (
              <Text style={styles.emptyNote}>Adresse non communiquée.</Text>
            )}
          </SectionRegistry>
        </MotiView>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
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
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  heroSection: {
    marginBottom: 40,
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

  /* SECTIONS */
  sectionContainer: {
    marginBottom: 35,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1.5,
  },
  sectionContent: {
    paddingLeft: 28, // Alignement sous le texte du titre
  },

  /* ROW ITEM */
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textSecondary,
    letterSpacing: 1,
  },
  dotSeparator: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    marginHorizontal: 10,
    borderStyle: "dotted", // Si supporté, sinon solid fin
    opacity: 0.5,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* BLOCKS (TEXTE LONG) */
  noteBlock: {
    marginBottom: 5,
  },
  blockLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    marginBottom: 6,
    letterSpacing: 1,
  },
  blockValue: {
    fontSize: 14,
    color: THEME.textMain,
    lineHeight: 20,
  },
  addressValue: {
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 24,
    fontStyle: "italic",
  },

  emptyNote: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontStyle: "italic",
    opacity: 0.7,
  },
});
