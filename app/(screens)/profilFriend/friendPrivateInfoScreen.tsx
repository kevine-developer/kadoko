import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { userService } from "@/lib/services/user-service";
import { showErrorToast } from "@/lib/toast";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

export default function FriendPrivateInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
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
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="small" color={theme.accent} />
      </View>
    );
  }

  const p = friendInfo?.privateInfo || {};

  const renderInfoRow = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <ThemedText
          type="label"
          colorName="textSecondary"
          style={styles.rowLabel}
        >
          {label}
        </ThemedText>
        <View
          style={[styles.dotSeparator, { borderBottomColor: theme.border }]}
        />
        <ThemedText type="default" bold style={styles.rowValue}>
          {value}
        </ThemedText>
      </View>
    );
  };

  const SectionRegistry = ({ title, icon, children }: any) => (
    <View style={styles.sectionContainer}>
      <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
        <ThemedIcon name={icon} size={18} colorName="accent" />
        <ThemedText type="label" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backBtn}
        >
          <ThemedIcon name="chevron-back" size={24} colorName="textMain" />
        </TouchableOpacity>
        <ThemedText type="label" style={styles.navTitle}>
          PRÉFÉRENCES
        </ThemedText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 700 }}
          style={styles.heroSection}
        >
          <ThemedText type="hero" style={styles.heroTitle}>
            Notes sur{"\n"}
            {name}.
          </ThemedText>
          <View
            style={[styles.titleDivider, { backgroundColor: theme.accent }]}
          />
          <ThemedText
            type="subtitle"
            colorName="textSecondary"
            style={styles.heroSubtitle}
          >
            Ces détails précieux vous guideront pour choisir le présent parfait.
          </ThemedText>
        </MotiView>

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
                <ThemedText
                  type="caption"
                  colorName="textSecondary"
                  style={styles.emptyNote}
                >
                  Aucune mesure enregistrée.
                </ThemedText>
              )}
          </SectionRegistry>

          <SectionRegistry title="JOAILLERIE" icon="diamond-outline">
            {renderInfoRow("TOUR DE DOIGT", p.jewelry?.ringSize)}
            {renderInfoRow("MÉTAL PRÉFÉRÉ", p.jewelry?.preference)}
            {!p.jewelry?.ringSize && !p.jewelry?.preference && (
              <ThemedText
                type="caption"
                colorName="textSecondary"
                style={styles.emptyNote}
              >
                Aucune préférence notée.
              </ThemedText>
            )}
          </SectionRegistry>

          <SectionRegistry title="GOÛTS & DIÈTE" icon="restaurant-outline">
            {p.diet?.allergies?.length > 0 && (
              <View style={styles.noteBlock}>
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.blockLabel}
                >
                  ALLERGIES SIGNALEES
                </ThemedText>
                <ThemedText type="subtitle" style={styles.blockValue}>
                  {p.diet.allergies.join(", ")}
                </ThemedText>
              </View>
            )}
            {p.diet?.preferences?.length > 0 && (
              <View style={[styles.noteBlock, { marginTop: 15 }]}>
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.blockLabel}
                >
                  RÉGIMES ALIMENTAIRES
                </ThemedText>
                <ThemedText type="subtitle" style={styles.blockValue}>
                  {p.diet.preferences.join(", ")}
                </ThemedText>
              </View>
            )}
            {!p.diet?.allergies?.length && !p.diet?.preferences?.length && (
              <ThemedText
                type="caption"
                colorName="textSecondary"
                style={styles.emptyNote}
              >
                Aucune restriction connue.
              </ThemedText>
            )}
          </SectionRegistry>

          <SectionRegistry title="LOGISTIQUE" icon="cube-outline">
            {p.delivery?.address ? (
              <View style={styles.noteBlock}>
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.blockLabel}
                >
                  ADRESSE DE LIVRAISON
                </ThemedText>
                <ThemedText type="subtitle" style={styles.addressValue}>
                  {[
                    p.delivery.address.street,
                    p.delivery.address.postalCode,
                    p.delivery.address.city,
                    p.delivery.address.country,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                </ThemedText>
              </View>
            ) : (
              <ThemedText
                type="caption"
                colorName="textSecondary"
                style={styles.emptyNote}
              >
                Adresse non communiquée.
              </ThemedText>
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
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
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
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  heroSection: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    marginVertical: 25,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 35,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  sectionTitle: {
    letterSpacing: 1.5,
  },
  sectionContent: {
    paddingLeft: 28,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  dotSeparator: {
    flex: 1,
    borderBottomWidth: 1,
    marginHorizontal: 10,
    borderStyle: "dotted",
    opacity: 0.5,
  },
  rowValue: {
    fontSize: 14,
  },
  noteBlock: {
    marginBottom: 5,
  },
  blockLabel: {
    fontSize: 9,
    marginBottom: 6,
    letterSpacing: 1,
  },
  blockValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressValue: {
    fontSize: 15,
    lineHeight: 24,
  },
  emptyNote: {
    fontSize: 13,
    opacity: 0.7,
  },
});
