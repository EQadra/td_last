import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { useAppContext } from "../../../context/AppContext";

const { width, height } = Dimensions.get("window");

export default function FirstView() {
  const router = useRouter();
  const { setActiveView } = useAppContext();

  useEffect(() => {
    setActiveView(0);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.skipBadge}
            onPress={() => router.push("/auth/auth-intro")}
          >
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={require("../../../../assets/1.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>App Exclusiva para Latam</Text>
        <Text style={styles.description}>
          tudealer App es la primera red social Cannábica de todo latinoamérica...
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.dotsContainer}>
            <TouchableOpacity onPress={() => router.push("/intro/v1")}>
              <View style={[styles.dot, styles.activeDot]} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/intro/v2")}>
              <View style={styles.dot} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/intro/v3")}>
              <View style={styles.dot} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => router.push("/intro/v2")}
          >
            <Svg width={20} height={20} viewBox="0 0 100 100">
              <Polygon points="40,30 70,50 40,70" fill="#fff" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: width * 0.9,
    height: height * 0.85,
    backgroundColor: "#1B4F37",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  skipBadge: {
    backgroundColor: "#c7c7c7",
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  skipText: {
    color: "#004d32",
    fontSize: 14,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: height * 0.5,
    marginVertical: 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#c7c7c7",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    color: "#5c7a70",
    paddingHorizontal: 12,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 20,
    paddingLeft: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#c7c7c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  dot: {
    width: 20,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#c7c7c7",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#5e5e5e",
  },
});