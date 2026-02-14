import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import GlobalText from "../theme/GlobalText";
import { ArrowLeft, CheckCircle } from "lucide-react-native";
import Geolocation from "@react-native-community/geolocation";

export default function MapPickerScreen({ navigation, route }) {
  const [coords, setCoords] = useState({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [loading, setLoading] = useState(true);

  // Get current location on mount
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({
          lat: latitude,
          lng: longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.log("Location error:", error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, []);

  const confirmLocation = () => {
    if (!coords.lat || !coords.lng) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }

    navigation.navigate({
      name: "AddProperty",
      params: {
        selectedLocation: {
          lat: coords.lat,
          lng: coords.lng,
          link: `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}`,
        },
      },
      merge: true,
    });
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""
      />
      <script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""
      ></script>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        #map {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        const map = L.map('map').setView([${coords.lat}, ${coords.lng}], 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add draggable marker
        let marker = L.marker([${coords.lat}, ${coords.lng}], {
          draggable: true,
          autoPan: true,
        }).addTo(map);

        // Update coordinates on drag
        marker.on('dragend', function (e) {
          const pos = marker.getLatLng();
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              lat: pos.lat,
              lng: pos.lng,
            })
          );
        });

        // Update coordinates on map click
        map.on('click', function (e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            })
          );
        });

        // Send initial position
        setTimeout(() => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              lat: ${coords.lat},
              lng: ${coords.lng},
            })
          );
        }, 500);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <GlobalText bold style={styles.headerTitle}>
            Select Location
          </GlobalText>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Map */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#20A68B" />
          <GlobalText style={styles.loadingText}>Loading map...</GlobalText>
        </View>
      ) : (
        <WebView
          source={{ html: htmlContent }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.lat && data.lng) {
                setCoords({
                  lat: data.lat,
                  lng: data.lng,
                });
              }
            } catch (error) {
              console.error("Map message error:", error);
            }
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#20A68B" />
            </View>
          )}
        />
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <GlobalText style={styles.infoText}>
          📍 Tap or drag marker to select location
        </GlobalText>
        <GlobalText style={styles.coordsText}>
          Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
        </GlobalText>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmBtn} onPress={confirmLocation}>
        <CheckCircle size={20} color="#fff" />
        <GlobalText bold style={styles.confirmText}>
          Confirm Location
        </GlobalText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    paddingVertical: 12,
    elevation: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  infoBox: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 12,
    color: "#666",
  },
  confirmBtn: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#20A68B",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
});