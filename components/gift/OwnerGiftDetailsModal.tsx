import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";

import { giftService } from "@/lib/services/gift-service";
import { Gift } from "@/types/gift";
import { socketService } from "@/lib/services/socket";
import { ThemedText } from "@/components/themed-text";
import ThemedIcon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface OwnerGiftDetailsModalProps {
  gift: Gift | null;
  visible: boolean;
  onClose: () => void;
  onActionSuccess?: () => void;
}

export default function OwnerGiftDetailsModal({
  gift,
  visible,
  onClose,
  onActionSuccess,
}: OwnerGiftDetailsModalProps) {
  const theme = useAppTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%", "92%"], []);

  const [localGift, setLocalGift] = useState<Gift | null>(gift);
  const [loadingAction, setLoadingAction] = useState(false);

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

  const handleTogglePublish = async () => {
    if (!localGift || loadingAction) return;

    const previousState = { ...localGift };
    const optimisticIsPublished = !localGift.isPublished;

    setLocalGift((prev) =>
      prev ? { ...prev, isPublished: optimisticIsPublished } : null,
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingAction(true);

    try {
      const res = optimisticIsPublished
        ? await giftService.publishGift(localGift.id)
        : await giftService.unpublishGift(localGift.id);

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

  const handleConfirmReceipt = async () => {
    if (!localGift || loadingAction) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingAction(true);

    try {
      const res = await giftService.confirmReceipt(localGift.id);
      if (res.success) {
        if ("gift" in res) setLocalGift((res as any).gift);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onActionSuccess?.();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEdit = () => {
    if (!localGift) return;
    onClose();
    setTimeout(() => {
      router.push({
        pathname: "/(screens)/gifts/addGift",
        params: { wishlistId: localGift.wishlistId, giftId: localGift.id },
      });
    }, 300);
  };

  if (!localGift) return null;

  const isReceived = localGift.status === "RECEIVED";
  const isPurchased =
    (localGift.status === "PURCHASED" || !!localGift.purchasedById) &&
    !isReceived;
  const isReserved =
    localGift.status === "RESERVED" || !!localGift.reservedById;
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
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
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
                <ThemedIcon name="image-outline" size={40} colorName="border" />
              </View>
            )}

            {isTaken && (
              <View style={styles.takenOverlay}>
                <View
                  style={[
                    styles.takenLabel,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <ThemedText type="label" colorName="accent">
                    {isPurchased ? "PIÈCE ACQUISE" : "RÉSERVÉE"}
                  </ThemedText>
                </View>
              </View>
            )}

            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
                <ThemedIcon
                  name="close-outline"
                  size={22}
                  colorName="textMain"
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
                      backgroundColor: isTaken
                        ? theme.accent
                        : localGift.isPublished
                          ? theme.success
                          : theme.textSecondary,
                    },
                  ]}
                />
                <ThemedText type="label" colorName="textSecondary">
                  {isTaken
                    ? "INDISPONIBLE"
                    : localGift.isPublished
                      ? "PUBLIÉ DANS LE FIL"
                      : "BROUILLON (SOLO)"}
                </ThemedText>
              </View>

              <ThemedText type="hero" style={styles.title}>
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
                    { borderLeftColor: theme.accent },
                  ]}
                >
                  <Image
                    source={{
                      uri: isPurchased
                        ? localGift.purchasedBy?.image
                        : localGift.reservedBy?.image,
                    }}
                    style={[
                      styles.attrAvatar,
                      { backgroundColor: theme.border },
                    ]}
                  />
                  <ThemedText type="caption" style={styles.attrText}>
                    {isPurchased ? "Offert par " : "Réservé par "}
                    <ThemedText
                      type="caption"
                      colorName="accent"
                      style={styles.attrName}
                    >
                      {(isPurchased
                        ? localGift.purchasedBy?.name
                        : localGift.reservedBy?.name
                      )?.toUpperCase()}
                    </ThemedText>
                  </ThemedText>
                </View>
              )}
            </View>

            <View
              style={[styles.hairline, { backgroundColor: theme.border }]}
            />

            <View style={styles.descriptionSection}>
              <ThemedText type="label" colorName="textSecondary">
                NOTES DE RÉDACTION
              </ThemedText>
              <ThemedText type="subtitle" style={styles.descriptionText}>
                {localGift.description ||
                  "Aucune note additionnelle n'a été rédigée pour cette pièce."}
              </ThemedText>
            </View>

            <View style={styles.footer}>
              {!isReceived && (
                <TouchableOpacity
                  style={[styles.secondaryBtn, { borderColor: theme.border }]}
                  activeOpacity={0.7}
                  onPress={handleEdit}
                >
                  <ThemedText type="label">MODIFIER</ThemedText>
                </TouchableOpacity>
              )}

              {isReceived ? (
                <View
                  style={[
                    styles.primaryBtn,
                    styles.receivedBox,
                    { borderColor: theme.success },
                  ]}
                >
                  <ThemedIcon
                    name="checkmark-circle"
                    size={18}
                    colorName="success"
                  />
                  <ThemedText
                    type="label"
                    colorName="success"
                    style={{ marginLeft: 8 }}
                  >
                    CADEAU RÉCEPTIONNÉ
                  </ThemedText>
                </View>
              ) : isPurchased ? (
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: theme.success },
                  ]}
                  activeOpacity={0.8}
                  onPress={handleConfirmReceipt}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <ThemedText type="label" style={{ color: "#FFF" }}>
                      CONFIRMER RÉCEPTION
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: theme.textMain },
                    localGift.isPublished && {
                      borderColor: theme.accent,
                      backgroundColor: "transparent",
                      borderWidth: 1,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={handleTogglePublish}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <ThemedText
                      type="label"
                      style={[
                        {
                          color: localGift.isPublished
                            ? theme.textMain
                            : theme.background,
                        },
                      ]}
                    >
                      {localGift.isPublished
                        ? "RETIRER DU FIL"
                        : "PUBLIER DANS LE FIL"}
                    </ThemedText>
                  )}
                </TouchableOpacity>
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
    borderWidth: 1,
  },
  topActions: {
    position: "absolute",
    top: 20,
    right: 20,
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
  title: {
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
    marginRight: 12,
  },
  dataDivider: {
    width: 1,
    height: 14,
    marginRight: 12,
  },
  dataText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  attributionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 12,
    borderLeftWidth: 2,
  },
  attrAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  attrText: { fontSize: 12, fontWeight: "500" },
  attrName: { fontWeight: "800" },
  hairline: { height: 1, marginBottom: 30 },
  descriptionSection: { marginBottom: 40 },
  descriptionText: {
    marginTop: 10,
  },
  footer: { flexDirection: "row", gap: 15 },
  secondaryBtn: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtn: {
    flex: 2,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  receivedBox: {
    backgroundColor: "rgba(74, 103, 65, 0.08)",
    flexDirection: "row",
    borderWidth: 1,
  },
});
