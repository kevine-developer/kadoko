import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { giftService } from "@/lib/services/gift-service";
import { authClient } from "@/features/auth";
import { Gift } from "@/types/gift";
import { socketService } from "@/lib/services/socket";
import { shareGift } from "@/lib/share";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  danger: "#C34A4A",
  success: "#4A6741", // Vert forêt luxe
};

interface GuestGiftDetailsModalProps {
  gift: Gift | null;
  visible: boolean;
  onClose: () => void;
  onActionSuccess?: () => void;
}

export default function GuestGiftDetailsModal({
  gift,
  visible,
  onClose,
  onActionSuccess,
}: GuestGiftDetailsModalProps) {
  const { data: session } = authClient.useSession();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%", "92%"], []);

  const [localGift, setLocalGift] = React.useState<Gift | null>(gift);
  const [loadingAction, setLoadingAction] = React.useState(false);

  useEffect(() => {
    setLocalGift(gift);
  }, [gift]);

  useEffect(() => {
    if (!gift) return;
    socketService.connect();
    const handleGiftUpdate = (updatedGift: Gift) => {
      if (updatedGift.id === gift.id) setLocalGift(updatedGift);
    };
    socketService.on("gift:updated", handleGiftUpdate);
    return () => socketService.off("gift:updated", handleGiftUpdate);
  }, [gift]);

  useEffect(() => {
    if (visible) bottomSheetRef.current?.expand();
    else bottomSheetRef.current?.close();
  }, [visible]);

  const handleOpenLink = () => {
    if (localGift?.productUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(localGift.productUrl).catch(console.error);
    }
  };

  const handleShare = async () => {
    if (!localGift) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await shareGift(localGift.id, localGift.title);
  };

  const handleVisitorAction = async () => {
    if (!localGift || loadingAction) return;

    const previousState = { ...localGift };
    const isCurrentlyReservedByMe =
      localGift.reservedById === session?.user?.id;

    // Simuler le nouvel état localement
    setLocalGift((prev) => {
      if (!prev) return null;
      if (isCurrentlyReservedByMe) {
        return {
          ...prev,
          status: "AVAILABLE" as any,
          reservedById: undefined,
          reservedBy: undefined,
        };
      } else {
        return {
          ...prev,
          status: "RESERVED" as any,
          reservedById: session?.user?.id,
          reservedBy: session?.user as any,
        };
      }
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingAction(true);

    try {
      const res = isCurrentlyReservedByMe
        ? await giftService.releaseGift(localGift.id)
        : await giftService.reserveGift(localGift.id);

      if (res.success) {
        if ("gift" in res) setLocalGift((res as any).gift);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onActionSuccess?.();
      } else {
        setLocalGift(previousState);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setLocalGift(previousState);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoadingAction(false);
    }
  };

  if (!localGift) return null;

  const isReceived = localGift.status === "RECEIVED";
  const isPurchased =
    (localGift.status === "PURCHASED" || !!localGift.purchasedById) &&
    !isReceived;
  const isReserved =
    localGift.status === "RESERVED" || !!localGift.reservedById;
  const isReservedByMe = localGift.reservedById === session?.user?.id;
  const isTaken = isReserved || isPurchased || isReceived;

  return (
    <GestureHandlerRootView
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
    >
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={(index) => index === -1 && onClose()}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.imageWrapper}>
            {localGift.imageUrl ? (
              <Image
                source={{ uri: localGift.imageUrl }}
                style={styles.image}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={40} color={THEME.border} />
              </View>
            )}

            {isTaken && (
              <View style={styles.takenOverlay}>
                <View style={styles.takenLabel}>
                  <Text style={styles.takenLabelText}>
                    {isReceived
                      ? "PIÈCE REÇUE"
                      : isPurchased
                        ? "PIÈCE ACQUISE"
                        : "RÉSERVÉE"}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={THEME.textMain}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
                <Ionicons
                  name="close-outline"
                  size={22}
                  color={THEME.textMain}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.headerInfo}>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isTaken ? THEME.accent : THEME.success,
                    },
                  ]}
                />
                <Text style={styles.miniLabel}>
                  {isTaken ? "INDISPONIBLE" : "DISPONIBLE"}
                </Text>
              </View>

              <Text style={styles.title}>{localGift.title}</Text>

              <View style={styles.registryData}>
                {localGift.estimatedPrice && (
                  <Text style={styles.price}>{localGift.estimatedPrice} €</Text>
                )}
                {localGift.estimatedPrice && (
                  <View style={styles.dataDivider} />
                )}
                <Text style={styles.dataText}>
                  REF. {localGift.id.slice(-6).toUpperCase()}
                </Text>
              </View>

              {isTaken && (localGift.reservedBy || localGift.purchasedBy) && (
                <View style={styles.attributionBox}>
                  <Image
                    source={{
                      uri:
                        isReceived || isPurchased
                          ? localGift.purchasedBy?.image
                          : localGift.reservedBy?.image,
                    }}
                    style={styles.attrAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attrText}>
                      {isReceived
                        ? "Déjà offert par "
                        : isPurchased
                          ? "Déjà offert par "
                          : "Réservé par "}
                      <Text style={styles.attrName}>
                        {isReservedByMe
                          ? "VOUS"
                          : (isReceived || isPurchased
                              ? localGift.purchasedBy?.name
                              : localGift.reservedBy?.name
                            )?.toUpperCase()}
                      </Text>
                    </Text>
                    {isReceived && (
                      <Text style={styles.receivedNote}>
                        ✓ Le propriétaire a confirmé avoir reçu ce cadeau
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.hairline} />

            {localGift.productUrl && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={handleOpenLink}
                activeOpacity={0.6}
              >
                <View style={styles.linkIconBg}>
                  <Ionicons
                    name="link-outline"
                    size={20}
                    color={THEME.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkLabel}>SOURCE EXTERNE</Text>
                  <Text style={styles.linkValue} numberOfLines={1}>
                    Consulter sur le site marchand
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={THEME.border}
                />
              </TouchableOpacity>
            )}

            <View style={styles.descriptionSection}>
              <Text style={styles.miniLabel}>NOTES DE RÉDACTION</Text>
              <Text style={styles.descriptionText}>
                {localGift.description ||
                  "Aucune note additionnelle n'a été rédigée pour cette pièce."}
              </Text>
            </View>

            <View style={styles.footer}>
              {(localGift.status === "AVAILABLE" || isReservedByMe) &&
              !isReceived ? (
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    isReservedByMe && styles.removeAction,
                  ]}
                  onPress={handleVisitorAction}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.primaryBtnText,
                        isReservedByMe && { color: THEME.textMain },
                      ]}
                    >
                      {isReservedByMe ? "ANNULER MA RÉSERVATION" : "RÉSERVER"}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.statusLockBox}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={THEME.textSecondary}
                  />
                  <Text style={styles.statusLockText}>
                    CETTE PIÈCE N&apos;EST PLUS DISPONIBLE
                  </Text>
                </View>
              )}
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: THEME.background, borderRadius: 0 },
  handle: {
    backgroundColor: THEME.border,
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  container: { flex: 1 },
  imageWrapper: { height: 320, width: "100%", backgroundColor: "#F2F2F7" },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253, 251, 247, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  takenLabel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  takenLabelText: {
    color: THEME.accent,
    fontWeight: "800",
    letterSpacing: 2,
    fontSize: 12,
  },
  topActions: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 32, paddingTop: 30 },
  headerInfo: { marginBottom: 30 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 34,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 40,
    letterSpacing: -1,
    marginBottom: 15,
  },
  registryData: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.textMain,
    marginRight: 12,
  },
  dataDivider: {
    width: 1,
    height: 14,
    backgroundColor: THEME.border,
    marginRight: 12,
  },
  dataText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textSecondary,
    letterSpacing: 0.5,
  },
  attributionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: THEME.accent,
  },
  attrAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.border,
  },
  attrText: { fontSize: 12, color: THEME.textMain, fontWeight: "500" },
  attrName: { fontWeight: "800", color: THEME.accent },
  hairline: { height: 1, backgroundColor: THEME.border, marginBottom: 30 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 35,
  },
  linkIconBg: {
    width: 44,
    height: 44,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  linkLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  linkValue: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    color: THEME.textMain,
  },
  descriptionSection: { marginBottom: 40 },
  descriptionText: {
    fontSize: 15,
    color: THEME.textMain,
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginTop: 10,
  },
  footer: { flexDirection: "row", gap: 15 },
  primaryBtn: {
    flex: 1,
    height: 60,
    backgroundColor: THEME.textMain,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1.5,
  },
  removeAction: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: THEME.textMain,
  },
  statusLockBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  statusLockText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1,
  },
  receivedNote: {
    fontSize: 11,
    color: THEME.success,
    marginTop: 4,
    fontWeight: "600",
  },
});
