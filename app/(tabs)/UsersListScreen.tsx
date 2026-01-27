import { useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
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
import { UserListItemSkeleton } from "@/components/ui/SkeletonGroup";
import UserRowCard from "@/components/UserList/UserRowCard";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";
import EmptyContent from "@/components/EmptyContent";

export default function UsersListScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
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

    const previousSent = [...sentRequests];
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

  const dataFiltered = useMemo(() => {
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ paddingTop: insets.top + 60, paddingHorizontal: 30 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <UserListItemSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top + 10, backgroundColor: theme.background },
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={styles.miniLabel}
          >
            VOTRE RÉPERTOIRE
          </ThemedText>
          <ThemedText type="hero" style={styles.heroTitle}>
            Mes Cercles.
          </ThemedText>
        </MotiView>

        <View
          style={[
            styles.searchSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <ThemedIcon name="search-outline" size={18} colorName="accent" />
          <TextInput
            placeholder="Rechercher un membre..."
            placeholderTextColor="#BCBCBC"
            style={[styles.searchInput, { color: theme.textMain }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={theme.accent}
          />
          {isLoadingSearch ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <ThemedIcon name="close-circle" size={18} colorName="border" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {dataFiltered.mode === "SEARCH" ? (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.sectionLabel}
            >
              RÉSULTATS DE RECHERCHE
            </ThemedText>
            {dataFiltered.items?.map((user) => (
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
            {dataFiltered.requests && dataFiltered.requests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ThemedText
                    type="label"
                    colorName="textSecondary"
                    style={styles.sectionLabel}
                  >
                    INVITATIONS REÇUES
                  </ThemedText>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: theme.accent },
                    ]}
                  >
                    <ThemedText type="label" style={styles.countText}>
                      {dataFiltered.requests.length}
                    </ThemedText>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.requestsContainer}
                >
                  {dataFiltered.requests.map((req, index) => (
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

            <View style={styles.section}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.sectionLabel}
              >
                MON CERCLE PROCHE
              </ThemedText>
              {dataFiltered.friends && dataFiltered.friends.length > 0 ? (
                dataFiltered.friends.map((friend, index) => (
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
                <EmptyContent
                  title="Aucun ami"
                  subtitle="Vous n'avez pas d'ami"
                  icon="person-outline"
                />
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
  },
  headerContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  miniLabel: {
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    letterSpacing: -1,
    marginBottom: 25,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderRadius: 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
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
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  countBadge: {
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
  },
  requestsContainer: {
    paddingRight: 30,
    gap: 15,
  },
});
