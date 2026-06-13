import React, { useCallback, useMemo, forwardRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useTheme } from '../design/theme';
import { spacing } from '../design/tokens';

export type PostBottomSheetRef = BottomSheet;

export const PostBottomSheet = forwardRef<PostBottomSheetRef>((_props, ref) => {
  const { colors, isDark } = useTheme();

  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={isDark ? 0.8 : 0.5}
      />
    ),
    [isDark]
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background.card }}
      handleIndicatorStyle={{ backgroundColor: colors.text.placeholder }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Post a Ride</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Where are you heading?
        </Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
});
