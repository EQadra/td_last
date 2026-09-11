import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const videoSource = require("../assets/animacion-intro.mp4");

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      router.replace("/intro/v1");
    });

    const timer = setTimeout(() => {
      router.replace("/intro/v1");
    }, 10000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});