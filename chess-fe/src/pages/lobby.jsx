import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { over } from "stompjs";

const stompClientInstance = {};

export default function Lobby() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(null);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");

  const play = async () => {
    if (!stompClientInstance.client) {
      const Sock = new SockJS('http://localhost:8080/ws');
      stompClientInstance.client = over(Sock);
    }
    await stompClientInstance.client.connect({}, onConnected, onError);
    axios.get(`http://localhost:8080/api/queue/${userId}`)
      .then(response => setReady(response.data.status))
      .catch(error => console.log(error));
  };

  const onConnected = () => {
    stompClientInstance.client.subscribe(`/queue/${userId}`, onReceived);
  };

  const onReceived = (payload) => {
    const changePage = async () => {
      const payloadData = JSON.parse(payload.body);
      await localStorage.setItem("side", payloadData.side.toLowerCase());
      setReady(payloadData.status);
    }
    changePage();
  };

  const onError = (payload) => {
    console.log("Error");
  };

  useEffect(() => {
    return () => {
      if (stompClientInstance.client) {
        stompClientInstance.client.disconnect();
        stompClientInstance.client = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkReady = async () => {
      if (ready === "READY") {
        await stompClientInstance.client.disconnect();
        navigate('/game');
      } else if (!ready) {
        setUsername(localStorage.getItem("username"));
        if (username) {
          axios.get(`http://localhost:8080/api/users/getUserId/${username}`)
            .then(response => {
              setUserId(response.data);
              localStorage.setItem("userId", response.data);
            })
            .catch(error => console.log(error));
        }
      };
    }
    checkReady();
  }, [ready, username]);

  return (
    <>
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