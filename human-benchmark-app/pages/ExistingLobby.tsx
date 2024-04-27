import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import * as API from "../api";
import { BASE_PATH } from "../api/base";
import { Stomp } from "@stomp/stompjs";

export type JoinedDTO = {
  joined: boolean;
  deviceName: string;
  sessionCode: string;
};

const ExistingLobby = ({ navigation, route }: any) => {
  const { username, isHost, sessionCode } = route.params;
  const [players, setPlayers] = useState<API.Device[]>([]);
  const [lobbyCode, setLobbyCode] = useState<string>("");

  const sessionClient = new API.LobbyControllerApi();
  const deviceClient = new API.DeviceControllerApi();

  useEffect(() => {
    const ws = new WebSocket(`ws://${BASE_PATH.slice(7)}/lobby`);

    const stompClient = Stomp.over(ws);
    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/players", (message) => {
        console.log("received Message {}", JSON.parse(message.body));
      });

      let dto = { joined: true, sessionCode: lobbyCode, deviceName: username };
      stompClient.send("/app/players", {}, JSON.stringify(dto));
    });

    return () => {
      stompClient.disconnect();
    };
  }, []);

  useEffect(() => {
    const initLobby = async () => {
      // Creating session (host)
      if (isHost) {
        setPlayers([
          {
            id: 0,
            userName: username.trim() + " 🎖️",
            donePlaying: false,
            score: 0,
          },
        ]);

        await sessionClient.createLobby(username.trim()).then((res) => {
          if (res.status !== 200) {
            alert("Something went wrong. \nTry again later.");
            return;
          }

          setLobbyCode(res.data);
        });
      }

      // Fetching Existing Lobby Data
      else {
        await sessionClient.getLobby(sessionCode).then((res) => {
          if (res.status === 404) {
            navigation.navigate("SessionManagement", { username });
            alert("The entered session code is invalid...\n 404");
            return;
          }

          if (res.status !== 200) {
            alert("Something went wrong. \nTry again later.\n ERROR");
            return;
          }

          setPlayers([
            { donePlaying: false, score: 0, userName: username },
            ...res.data,
          ]);
          setLobbyCode(sessionCode);
        });
      }
    };

    initLobby();
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        console.log("GOING BACK");
        return true; // Return true to prevent default back behavior (closing the app)
      };

      // Add event listener for hardware back button press
      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      // Clean up function
      return () => {
        // Remove event listener when the screen is unfocused or unmounted
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  const handleLeave = () => {
    navigation.navigate("SessionManagement", { username });
    // send close log

    let dto: JoinedDTO = {
      joined: false,
      sessionCode: lobbyCode,
      deviceName: username.trim(),
    };
  };

  const handleSubmit = () => {
    console.log("Joining lobby with code:");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
        <Text style={styles.leaveButtonText}>Leave</Text>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="w-3 h-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
          />
        </svg>
      </TouchableOpacity>
      <Text style={styles.title}>Join Existing Lobby</Text>
      <View style={styles.codeContainer}>
        <Text style={styles.codeText}>Code: {lobbyCode}</Text>
      </View>
      <View style={styles.playerList}>
        <ScrollView contentContainerStyle={styles.tableContainer}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Lobby</Text>
            </View>
            {players.map((player: any) => (
              <View key={player.id} style={styles.tableRow}>
                <Text style={styles.cell}>{player.userName}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#34C759",
  },
  codeContainer: {
    backgroundColor: "#EAF6E9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#34C759",
  },
  codeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34C759",
  },
  playerList: {
    width: "100%",
    marginBottom: 20,
  },
  playerListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#34C759",
  },
  tableContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#34C759",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    width: "80%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#34C759",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    color: "#34C759",
    fontSize: 18,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  leaveButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 1,
  },
  leaveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ExistingLobby;
