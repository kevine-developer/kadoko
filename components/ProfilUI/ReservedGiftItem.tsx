import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- THEME LUXE ---
const THEME = {
  white: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827", // Noir Profond
  border: "rgba(0,0,0,0.06)",
  danger: "#EF4444",
  dangerBg: "#FEF2F2",
  success: "#10B981", // Vert Émeraude
  successBg: "#ECFDF5",
  surface: "#F9FAFB",
};

export default function ReservedGiftItem({
  gift,
  ownerName,
  onPurchased, // Callback quand on passe de Réservé -> Acheté
  onUnreserve, // Callback pour annuler la réservation
  eventDate,
}: any) {
  // --- DÉTECTION DU STATUT ---
  // On suppose que gift.status contient 'RESERVED' ou 'PURCHASED'
  // Ou on vérifie la présence d'un objet purchase
  const isPurchased = gift.status === "PURCHASED" || !!gift.purchasedAt;
  const purchaseDate = gift.purchasedAt;

  // --- ÉTATS LOCAUX ---
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  // États Confirmation (Seulement pour le flux d'achat)
  const [isConfirming, setIsConfirming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<any>(null);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const hasLinks = gift.productUrl && gift.productUrl.length > 0;

  // --- LOGIQUE DATE (Uniquement si pas encore acheté) ---
  useEffect(() => {
    if (!eventDate || isPurchased) return;

    const calculateTime = () => {
      const now = new Date();
      const event = new Date(eventDate);
      const diff = event.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (diff <= 0) {
        setTimeRemaining("Terminé");
        setIsUrgent(false);
      } else if (days <= 3) {
        setIsUrgent(true);
        setTimeRemaining(days === 1 ? "Demain" : `J-${days}`);
      } else {
        setIsUrgent(false);
        setTimeRemaining(`${days} jours`);
      }
    };
    calculateTime();
  }, [eventDate, isPurchased]);

  // --- LOGIQUE ACHAT (Flux de confirmation) ---
  const startPurchaseFlow = () => {
    if (isPurchased) return; // Pas d'action si déjà acheté
    setIsConfirming(true);
    setCountdown(5);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();
  };

  const cancelPurchase = () => {
    setIsConfirming(false);
    setCountdown(0);
    progressAnim.setValue(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (isConfirming && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isConfirming && countdown === 0) {
      setIsConfirming(false);
      onPurchased(); // Déclenche l'action parent
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isConfirming, countdown, onPurchased]);

  // --- NAVIGATION ---
  const navigateToGift = () => {
    if (isConfirming) return;
    router.push({ pathname: "/gifts/[giftId]", params: { giftId: gift.id } });
  };

  const handleOpenLink = () => {
    if (gift.productUrl) {
      Linking.openURL(gift.productUrl).catch(() =>
        Alert.alert("Erreur", "Lien invalide"),
      );
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={navigateToGift}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.cardInner, isPurchased && styles.cardInnerPurchased]}
      >
        {/* GAUCHE : IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={gift.imageUrl}
            style={[styles.image, isPurchased && styles.imageDimmed]}
            contentFit="cover"
            transition={400}
          />
          {/* Badge Prix */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{gift.estimatedPrice}€</Text>
          </View>

          {/* Overlay si Acheté */}
          {isPurchased && (
            <View style={styles.purchasedOverlay}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            </View>
          )}
        </View>

        {/* DROITE : CONTENU */}
        <View style={styles.contentContainer}>
          {/* HEADER : Avatar & Info Contextuelle */}
          <View style={styles.topRow}>
            <View style={styles.userInfo}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {ownerName?.charAt(0) || "?"}
                </Text>
              </View>
              <Text style={styles.userName}>{ownerName}</Text>
            </View>

            {/* CAS 1 : ACHETÉ -> Date d'achat */}
            {isPurchased ? (
              <View style={[styles.datePill, styles.datePillSuccess]}>
                <Text style={[styles.dateText, styles.dateTextSuccess]}>
                  Offert le {new Date(purchaseDate || Date.now()).getDate()}/
                  {new Date(purchaseDate || Date.now()).getMonth() + 1}
                </Text>
              </View>
            ) : // CAS 2 : RÉSERVÉ -> Compte à rebours
            timeRemaining ? (
              <View
                style={[styles.datePill, isUrgent && styles.datePillUrgent]}
              >
                <Ionicons
                  name="time-outline"
                  size={10}
                  color={isUrgent ? THEME.danger : THEME.textSecondary}
                />
                <Text
                  style={[styles.dateText, isUrgent && styles.dateTextUrgent]}
                >
                  {timeRemaining}
                </Text>
              </View>
            ) : null}
          </View>

          {/* TITRE SERIF */}
          <Text
            style={[styles.title, isPurchased && styles.titlePurchased]}
            numberOfLines={2}
          >
            {gift.title}
          </Text>

          {/* FOOTER ACTIONS */}
          <View style={styles.bottomRow}>
            {isConfirming ? (
              // --- MODE 1 : CONFIRMATION D'ACHAT ---
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={cancelPurchase}
                activeOpacity={0.9}
              >
                <View style={styles.cancelContent}>
                  <Text style={styles.cancelText}>Annuler ({countdown}s)</Text>
                  <Ionicons name="close" size={16} color="#FFF" />
                </View>
                <Animated.View
                  style={[styles.progressBar, { width: progressWidth }]}
                />
              </TouchableOpacity>
            ) : isPurchased ? (
              // --- MODE 2 : DÉJÀ ACHETÉ (Statut Statique) ---
              <View style={styles.actionsWrapper}>
                <TouchableOpacity style={[styles.iconBtn, styles.disabledBtn]}>
                  <Ionicons
                    name="link-outline"
                    size={16}
                    color={THEME.textSecondary}
                  />
                </TouchableOpacity>

                {/* Bouton Statut Vert */}
                <View style={styles.successBtn}>
                  <Text style={styles.successBtnText}>Cadeau Offert</Text>
                  <Ionicons
                    name="gift-outline"
                    size={14}
                    color={THEME.success}
                  />
                </View>
              </View>
            ) : (
              // --- MODE 3 : RÉSERVÉ (Action requise) ---
              <View style={styles.actionsWrapper}>
                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={[styles.iconBtn, !hasLinks && styles.disabledBtn]}
                    onPress={hasLinks ? handleOpenLink : undefined}
                  >
                    <Ionicons
                      name="link-outline"
                      size={16}
                      color={THEME.textMain}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.iconBtn, styles.trashBtn]}
                    onPress={onUnreserve}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={THEME.danger}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={startPurchaseFlow}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>Marquer acheté</Text>
                  <Ionicons name="bag-check-outline" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: THEME.white,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  cardInner: {
    flexDirection: "row",
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardInnerPurchased: {
    backgroundColor: "#FAFAFA", // Fond très légèrement grisé
    borderColor: "rgba(0,0,0,0.03)",
  },

  /* IMAGE */
  imageContainer: {
    width: 110,
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
  },
  imageDimmed: {
    opacity: 0.8, // Image un peu plus terne si acheté
  },
  priceBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textMain,
  },
  purchasedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 185, 129, 0.4)", // Overlay Vert transparent
    alignItems: "center",
    justifyContent: "center",
  },

  /* CONTENU DROITE */
  contentContainer: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* USER INFO */
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "700",
  },
  userName: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* DATE PILLS */
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  datePillUrgent: {
    backgroundColor: THEME.dangerBg,
  },
  datePillSuccess: {
    backgroundColor: THEME.successBg,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.textSecondary,
  },
  dateTextUrgent: {
    color: THEME.danger,
    fontWeight: "700",
  },
  dateTextSuccess: {
    color: THEME.success,
    fontWeight: "700",
  },

  /* TITRE */
  title: {
    fontSize: 17,
    fontWeight: "500",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 22,
    marginTop: 4,
  },
  titlePurchased: {
    color: "#9CA3AF", // Titre grisé
    textDecorationLine: "line-through", // Optionnel : barré
  },

  /* ACTIONS */
  bottomRow: {
    marginTop: "auto",
  },
  actionsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  disabledBtn: {
    opacity: 0.4,
    backgroundColor: "#F9FAFB",
  },
  trashBtn: {
    borderColor: THEME.dangerBg,
    backgroundColor: "#FFF",
  },

  /* PRIMARY BUTTONS */
  primaryBtn: {
    flex: 1,
    height: 36,
    backgroundColor: THEME.primary,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  /* SUCCESS BUTTON (STATIC) */
  successBtn: {
    flex: 1,
    height: 36,
    backgroundColor: "#FFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.success,
  },
  successBtnText: {
    color: THEME.success,
    fontSize: 12,
    fontWeight: "700",
  },

  /* CANCEL MODE */
  cancelBtn: {
    height: 36,
    backgroundColor: "#374151",
    borderRadius: 18,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  cancelContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    zIndex: 2,
  },
  cancelText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: "#EF4444",
  },
});
