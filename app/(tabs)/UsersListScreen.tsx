import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

import { userService } from "@/lib/services/user-service";
import { friendshipService } from "@/lib/services/friendship-service";
import RequestCard from "@/components/UserList/RequestCard";
import EmptyFriend from "@/components/UserList/EmptyFriend";
import { UserListItemSkeleton } from "@/components/ui/SkeletonGroup";
import UserRowCard from "@/components/UserList/UserRowCard";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741",
};

export default function UsersListScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoadingSearch(true);
        const res = await userService.searchUsers(searchQuery);
        if (res.success) {
          setSearchResults(res.users);
        }
        setIsLoadingSearch(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadFriendships = useCallback(async () => {
    setLoading(true);
    const res = await friendshipService.getMyFriendships();
    if (res.success) {
      setFriends(res.friends);
      setRequests(res.requestsReceived);
      setSentRequests(res.requestsSent || []);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFriendships();
    }, [loadFriendships]),
  );

  const handleAddFriend = async (userId: string) => {
    if (processingIds.has(userId)) return;

    // --- OPTIMISTIC UI ---
    const previousSent = [...sentRequests];
    // Ajouter à sentRequests pour que isPendingAdd devienne vrai immédiatement
    setSentRequests((prev) => [
      ...prev,
      { id: userId, receiverId: userId, status: "PENDING" },
    ]);

    setProcessingIds((prev) => new Set(prev).add(userId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const res = await friendshipService.sendRequest(userId);
      if (!res.success) {
        setSentRequests(previousSent);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      // Re-fetch pour synchroniser parfaitement (id réels, etc.)
      loadFriendships();
    } catch {
      setSentRequests(previousSent);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleCancelRequest = async (userId: string) => {
    if (processingIds.has(userId)) return;

    // --- OPTIMISTIC UI ---
    const previousSent = [...sentRequests];
    setSentRequests((prev) =>
      prev.filter((r) => r.receiverId !== userId && r.id !== userId),
    );

    setProcessingIds((prev) => new Set(prev).add(userId));
    try {
      const res = await friendshipService.cancelRequest(userId);
      if (!res.success) {
        setSentRequests(previousSent);
      }
      loadFriendships();
    } catch {
      setSentRequests(previousSent);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    if (processingIds.has(friendshipId)) return;

    // --- OPTIMISTIC UI ---
    const previousReqs = [...requests];
    const previousFriends = [...friends];
    const acceptedUser = requests.find((r) => r.friendshipId === friendshipId);

    if (acceptedUser) {
      setRequests((prev) =>
        prev.filter((r) => r.friendshipId !== friendshipId),
      );
      setFriends((prev) => [...prev, acceptedUser]);
    }

    setProcessingIds((prev) => new Set(prev).add(friendshipId));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const res = await friendshipService.acceptRequest(friendshipId);
      if (!res.success) {
        setRequests(previousReqs);
        setFriends(previousFriends);
      }
      loadFriendships();
    } catch {
      setRequests(previousReqs);
      setFriends(previousFriends);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(friendshipId);
        return next;
      });
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (processingIds.has(friendshipId)) return;

    // --- OPTIMISTIC UI ---
    const previousFriends = [...friends];
    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));

    setProcessingIds((prev) => new Set(prev).add(friendshipId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await friendshipService.removeFriendship(friendshipId);
      if (!res.success) {
        setFriends(previousFriends);
      }
      loadFriendships();
    } catch {
      setFriends(previousFriends);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(friendshipId);
        return next;
      });
    }
  };

  const data = useMemo(() => {
    if (searchQuery.length > 0) return { mode: "SEARCH", items: searchResults };
    return { mode: "FRIENDS", friends, requests };
  }, [searchQuery, searchResults, friends, requests]);

  const myFriendIds = useMemo(() => friends.map((f) => f.id), [friends]);
  const pendingRequestIds = useMemo(
    () => sentRequests.map((r) => r.receiverId || r.id),
    [sentRequests],
  );

  if (loading && friends.length === 0 && requests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ paddingTop: insets.top + 60, paddingHorizontal: 30 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <UserListItemSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER ÉDITORIAL */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text style={styles.miniLabel}>VOTRE RÉPERTOIRE</Text>
          <Text style={styles.heroTitle}>Mes Cercles.</Text>
        </MotiView>

        {/* SEARCH BAR STYLE "REGISTRE" */}
        <View style={styles.searchSection}>
          <Ionicons name="search-outline" size={18} color={THEME.accent} />
          <TextInput
            placeholder="Rechercher un membre..."
            placeholderTextColor="#BCBCBC"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={THEME.accent}
          />
          {isLoadingSearch ? (
            <ActivityIndicator size="small" color={THEME.accent} />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={THEME.border} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data.mode === "SEARCH" ? (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Text style={styles.sectionLabel}>RÉSULTATS DE RECHERCHE</Text>
            {data.items?.map((user) => (
              <UserRowCard
                key={user.id}
                user={user}
                isFriend={myFriendIds?.includes(user.id)}
                isPendingAdd={pendingRequestIds?.includes(user.id)}
                loading={processingIds.has(user.id)}
                handleAddFriend={() => handleAddFriend(user.id)}
                handleCancelRequest={() => handleCancelRequest(user.id)}
              />
            ))}
          </MotiView>
        ) : (
          <>
            {/* DEMANDES EN ATTENTE - STYLE CARTES D'INVITATION */}
            {data.requests && data.requests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>INVITATIONS REÇUES</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{data.requests.length}</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.requestsContainer}
                >
                  {data.requests.map((req, index) => (
                    <MotiView
                      key={req.id}
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 100 }}
                    >
                      <RequestCard
                        user={req}
                        loading={processingIds.has(req.friendshipId)}
                        handleAcceptFriend={() =>
                          handleAcceptFriend(req.friendshipId)
                        }
                        handleRemoveFriend={() =>
                          handleRemoveFriend(req.friendshipId)
                        }
                      />
                    </MotiView>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* LISTE D'AMIS - STYLE REGISTRE */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>MON CERCLE PROCHE</Text>
              {data.friends && data.friends.length > 0 ? (
                data.friends.map((friend, index) => (
                  <MotiView
                    key={friend.id}
                    from={{ opacity: 0, translateX: -10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: index * 50 }}
                  >
                    <UserRowCard
                      user={friend}
                      isFriend={true}
                      loading={processingIds.has(friend.friendshipId)}
                      handleRemoveFriend={() =>
                        handleRemoveFriend(friend.friendshipId)
                      }
                      handleAddFriend={() => handleAddFriend(friend.id)}
                      handleCancelRequest={() => handleCancelRequest(friend.id)}
                    />
                  </MotiView>
                ))
              ) : (
                <EmptyFriend />
              )}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerContainer: {
    paddingHorizontal: 30,
    backgroundColor: THEME.background,
    paddingBottom: 20,
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    letterSpacing: -1,
    marginBottom: 25,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 0, // Carré pour le look luxe
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  scrollContent: {
    paddingHorizontal: 30,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  countBadge: {
    backgroundColor: THEME.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 12,
  },
  countText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  requestsContainer: {
    paddingRight: 30,
    gap: 15,
  },
});
