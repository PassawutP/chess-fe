import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import SockJS from "sockjs-client";
import { over } from "stompjs";

import MenuAppBar from "../components/navbar";

const stompClientInstance = {};

export default function Lobby() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(null);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  // After clicking play
  const play = async () => {
    if (!stompClientInstance.client) {
      const Sock = new SockJS('http://localhost:8080/ws');
      stompClientInstance.client = over(Sock);
    }
    
    stompClientInstance.client.connect({}, onConnected, onError);

    await axios.get(`http://localhost:8080/api/queue/${userId}`)
      .then(response => setReady(response.data.status))
      .catch(error => console.log(error));
  };

  // After connecting with the socket
  const onConnected = () => {
    stompClientInstance.client.subscribe(`/queue/${userId}`, onReceived);
  };

  const onReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    localStorage.setItem("side", payloadData.side);
    setReady(payloadData.status)
  };

  const onError = (payload) => {
    console.log("Error", payload);
  };

  // Initialize the page and disconnect WebSocket if still connected
  useEffect(() => {
    const initializePage = async () => {
      if (stompClientInstance.client) {
        stompClientInstance.client.disconnect();
        stompClientInstance.client = null;
      }

      // Fetch username from localStorage and set it
      const storedUsername = localStorage.getItem("username");
      setUsername(storedUsername);

      // Fetch userId from API based on username
      await axios.get(`http://localhost:8080/api/users/getUserId/${storedUsername}`)
        .then(response => {
          setUserId(response.data);
          localStorage.setItem("userId", response.data);
        })
        .catch(error => console.log(error));
    };

    initializePage();
  }, []);

  // When ready status changes
  useEffect(() => {
    if (ready === "READY") {
      stompClientInstance.client.disconnect();
      navigate('/game');
    }
  }, [ready, navigate]);

  return (
    <>
      <MenuAppBar />
      <div>
        <h3>Lobby</h3>
        <button type="submit" onClick={play}>Play</button>
      </div>
      <div>
        <h3>username: {username}</h3>
      </div>
      <div>
        userId: {userId}
      </div>
      <div>ready: {ready}</div>
    </>
  );
}
