
import React from "react";
import { StyleSheet, View } from "react-native";

interface LayoutPagerViewProps {
  pageNumber: number;
  children: React.ReactNode;
}


const LayoutPagerView = ({ pageNumber, children }: LayoutPagerViewProps) => {
  return (
    <View key={pageNumber} style={styles.pageContent}>
        {children}
    </View>
  );
};

export default LayoutPagerView;

const styles = StyleSheet.create({
  pageContent: {
    paddingHorizontal: 20,
  },
});
