import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  parallaxHeaderHeight?: number;
  enableParallax?: boolean;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  parallaxHeaderHeight = 250,
  enableParallax = true,
}: Props) {
  const backgroundColor = useThemeColor({}, "backgroundPrimary");
  const colorScheme = useColorScheme() ?? "light";

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (!enableParallax) {
      return {
        transform: [{ translateY: 0 }, { scale: 1 }],
      };
    }

    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-parallaxHeaderHeight, 0, parallaxHeaderHeight],
            [-parallaxHeaderHeight / 2, 0, parallaxHeaderHeight * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-parallaxHeaderHeight, 0, parallaxHeaderHeight],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        style={{ backgroundColor }}
        contentContainerStyle={styles.scrollContent} // 👈 clé ici
      >
        <Animated.View
          style={[
            styles.header,
            {
              height: parallaxHeaderHeight,
              backgroundColor: headerBackgroundColor[colorScheme],
            },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>

        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    overflow: "visible",
  },

  content: {
    flex: 1,
    padding: 14,
    gap: 16,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
