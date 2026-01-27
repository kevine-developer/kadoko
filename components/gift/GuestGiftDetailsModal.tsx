import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import React, { useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
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
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();
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
        backgroundStyle={[
          styles.sheetBackground,
          { backgroundColor: theme.background },
        ]}
        handleIndicatorStyle={[
          styles.handle,
          { backgroundColor: theme.border },
        ]}
      >
        <BottomSheetView style={styles.container}>
          <View
            style={[styles.imageWrapper, { backgroundColor: theme.surface }]}
          >
            {localGift.imageUrl ? (
              <Image
                source={{ uri: localGift.imageUrl }}
                style={styles.image}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <ThemedIcon name="image-outline" size={40} colorName="border" />
              </View>
            )}

            {isTaken && (
              <View
                style={[
                  styles.takenOverlay,
                  {
                    backgroundColor:
                      theme.background === "#FFFFFF"
                        ? "rgba(253, 251, 247, 0.4)"
                        : "rgba(0,0,0,0.6)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.takenLabel,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <ThemedText
                    type="label"
                    colorName="accent"
                    style={styles.takenLabelText}
                  >
                    {isReceived
                      ? "PIÈCE REÇUE"
                      : isPurchased
                        ? "PIÈCE ACQUISE"
                        : "RÉSERVÉE"}
                  </ThemedText>
                </View>
              </View>
            )}

            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <ThemedIcon name="share-outline" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
                <ThemedIcon name="close-outline" size={22} color="#1A1A1A" />
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
                      backgroundColor: isTaken ? theme.accent : theme.success,
                    },
                  ]}
                />
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.miniLabel}
                >
                  {isTaken ? "INDISPONIBLE" : "DISPONIBLE"}
                </ThemedText>
              </View>

              <ThemedText type="title" style={styles.title}>
                {localGift.title}
              </ThemedText>

              <View style={styles.registryData}>
                {localGift.estimatedPrice && (
                  <ThemedText type="defaultBold" style={styles.price}>
                    {localGift.estimatedPrice} €
                  </ThemedText>
                )}
                {localGift.estimatedPrice && (
                  <View
                    style={[
                      styles.dataDivider,
                      { backgroundColor: theme.border },
                    ]}
                  />
                )}
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.dataText}
                >
                  REF. {localGift.id.slice(-6).toUpperCase()}
                </ThemedText>
              </View>

              {isTaken && (localGift.reservedBy || localGift.purchasedBy) && (
                <View
                  style={[
                    styles.attributionBox,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        isReceived || isPurchased
                          ? localGift.purchasedBy?.image
                          : localGift.reservedBy?.image,
                    }}
                    style={[
                      styles.attrAvatar,
                      { backgroundColor: theme.border },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="default" style={styles.attrText}>
                      {isReceived
                        ? "Déjà offert par "
                        : isPurchased
                          ? "Déjà offert par "
                          : "Réservé par "}
                      <ThemedText type="defaultBold" colorName="accent">
                        {isReservedByMe
                          ? "VOUS"
                          : (isReceived || isPurchased
                              ? localGift.purchasedBy?.name
                              : localGift.reservedBy?.name
                            )?.toUpperCase()}
                      </ThemedText>
                    </ThemedText>
                    {isReceived && (
                      <ThemedText
                        type="caption"
                        style={{ color: theme.success, marginTop: 4 }}
                      >
                        ✓ Le propriétaire a confirmé avoir reçu ce cadeau
                      </ThemedText>
                    )}
                  </View>
                </View>
              )}
            </View>

            <View
              style={[styles.hairline, { backgroundColor: theme.border }]}
            />

            {localGift.productUrl && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={handleOpenLink}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.linkIconBg,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <ThemedIcon
                    name="link-outline"
                    size={20}
                    colorName="accent"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="label" colorName="textSecondary">
                    SOURCE EXTERNE
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
                    style={styles.linkValue}
                    numberOfLines={1}
                  >
                    Consulter sur le site marchand
                  </ThemedText>
                </View>
                <ThemedIcon
                  name="chevron-forward"
                  size={14}
                  colorName="border"
                />
              </TouchableOpacity>
            )}

            <View style={styles.descriptionSection}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.miniLabel}
              >
                NOTES DE RÉDACTION
              </ThemedText>
              <ThemedText type="subtitle" style={styles.descriptionText}>
                {localGift.description ||
                  "Aucune note additionnelle n'a été rédigée pour cette pièce."}
              </ThemedText>
            </View>

            <View style={styles.footer}>
              {(localGift.status === "AVAILABLE" || isReservedByMe) &&
              !isReceived ? (
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: theme.textMain },
                    isReservedByMe && {
                      backgroundColor: "transparent",
                      borderWidth: 1,
                      borderColor: theme.textMain,
                    },
                  ]}
                  onPress={handleVisitorAction}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <ActivityIndicator size="small" color={theme.background} />
                  ) : (
                    <ThemedText
                      type="label"
                      style={[
                        styles.primaryBtnText,
                        { color: theme.background },
                        isReservedByMe && { color: theme.textMain },
                      ]}
                    >
                      {isReservedByMe ? "ANNULER MA RÉSERVATION" : "RÉSERVER"}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.statusLockBox,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  <ThemedIcon
                    name="lock-closed-outline"
                    size={16}
                    colorName="textSecondary"
                  />
                  <ThemedText type="label" colorName="textSecondary">
                    CETTE PIÈCE N&apos;EST PLUS DISPONIBLE
                  </ThemedText>
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
  sheetBackground: { borderRadius: 0 },
  handle: { width: 40, height: 4, borderRadius: 2, marginTop: 10 },
  container: { flex: 1 },
  imageWrapper: { height: 320, width: "100%" },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  takenLabel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  takenLabelText: { fontSize: 12 },
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
  miniLabel: { letterSpacing: 1.5 },
  title: { fontSize: 34, lineHeight: 40, letterSpacing: -1, marginBottom: 15 },
  registryData: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  price: { fontSize: 20, marginRight: 12 },
  dataDivider: { width: 1, height: 14, marginRight: 12 },
  dataText: { fontSize: 12 },
  attributionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderLeftWidth: 2,
  },
  attrAvatar: { width: 24, height: 24, borderRadius: 12 },
  attrText: { fontSize: 12 },
  hairline: { height: 1, marginBottom: 30 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 35,
  },
  linkIconBg: {
    width: 44,
    height: 44,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  linkValue: { fontSize: 14 },
  descriptionSection: { marginBottom: 40 },
  descriptionText: { marginTop: 10 },
  footer: { flexDirection: "row", gap: 15 },
  primaryBtn: {
    flex: 1,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: { letterSpacing: 1.5 },
  statusLockBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 15,
  },
});
