import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

const splashVid = require('../../assets/splash_vid.mp4');

// We use a massive view with a thick border to create a "hole".
// By animating ONLY the transform scale, we get 120fps hardware acceleration
// without triggering JS layout thrashing.
const HOLE_START = 10; 
const BORDER_SIZE = Math.max(width, height) * 1.5; 
const TOTAL_SIZE = HOLE_START + BORDER_SIZE * 2;
const MAX_SCALE = (Math.max(width, height) * 1.5) / HOLE_START;

export function BootScreen({ onAnimationDone, isReady }: { onAnimationDone: () => void, isReady?: boolean }) {
  const [isVideoDone, setIsVideoDone] = useState(false);
  const solidOpacity = useSharedValue(1);
  const videoOpacity = useSharedValue(1);

  // Scale of the expanding hole
  const holeScale = useSharedValue(1);

  const player = useVideoPlayer(splashVid, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      setIsVideoDone(true);
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

  useEffect(() => {
    if (isReady === false || !isVideoDone) return; // Wait until BOTH app is ready AND video is done

    // Explode the circle outwards using GPU scale
    // Add a tiny 200ms delay to allow React Native to decode the image texture to GPU
    const timer = setTimeout(() => {
      // Instantly hide the solid background to reveal the 10px hole
      solidOpacity.value = 0;
      // Fade out the video
      videoOpacity.value = withTiming(0, { duration: 150 });

      // Hardware-accelerated scale up!
      holeScale.value = withTiming(MAX_SCALE, {
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
      }, (finished) => {
        if (finished) {
          runOnJS(onAnimationDone)();
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [isReady, isVideoDone]);

  const holeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: holeScale.value }],
  }));

  const solidStyle = useAnimatedStyle(() => ({
    opacity: solidOpacity.value,
  }));

  const videoContainerStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="none" accessibilityElementsHidden>
      {/* The GPU Accelerated Expanding Hole */}
      <Animated.View style={[styles.expandingHole, holeStyle]} />

      {/* Solid background covering the initial 10px hole */}
      <Animated.View style={[styles.solidBg, solidStyle]} />

      {/* Centered splash video */}
      <Animated.View style={[styles.videoContainer, videoContainerStyle]} pointerEvents="none">
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          allowsFullscreen={false}
          contentFit="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Very top
  },
  solidBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  expandingHole: {
    position: 'absolute',
    top: height / 2 - TOTAL_SIZE / 2,
    left: width / 2 - TOTAL_SIZE / 2,
    width: TOTAL_SIZE,
    height: TOTAL_SIZE,
    borderRadius: TOTAL_SIZE / 2,
    borderWidth: BORDER_SIZE,
    borderColor: '#000000',
    backgroundColor: 'transparent',
  },
  videoContainer: {
    width,
    height,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  video: {
    width: '100%',
    height: '100%',
    // Zoom in slightly to crop out the corner watermark
    transform: [{ scale: 1.25 }],
  },
});


