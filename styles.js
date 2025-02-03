import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  containerButtons: {
    padding: 16,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(189, 189, 189, 0.43)",
    justifyContent: "center",
  },
  containerContent: {
    padding: 16,
    flex: 1,
    backgroundColor: "rgba(189, 189, 189, 0.43)",
    justifyContent: "center",
  },
  mapContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: "rgba(189, 189, 189, 0.43)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
    textShadowColor: "rgba(144, 144, 144, 0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 20,
    textShadowColor: "rgba(144, 144, 144, 0.7)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flag: {
    width: 50,
    height: 30,
    marginRight: 16, // Add spacing between flag and text
    borderRadius: 4,
  },
  flagCountryDetails: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 16,
    borderRadius: 4,
  },
  detailsCountryDetails: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  buttonContainerCountryDetails: {
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1, // Takes the remaining space
  },
  countryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  capitalText: {
    fontSize: 14,
    color: "#666666",
  },
  button: {
    backgroundColor: "#3d0094",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    width: 150,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
