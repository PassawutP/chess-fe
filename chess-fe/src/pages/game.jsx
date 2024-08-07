import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import SockJS from "sockjs-client";
import { over } from "stompjs";

const stompClientInstance = {};

export default function Game() {
  const [game, setGame] = useState(new Chess());
  const [move, setMove] = useState(null);
  const [turn, setTurn] = useState("white");

  useEffect(() => {
    const startUp = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/getUser/${localStorage.getItem("userId")}`);
        localStorage.setItem("gameId", response.data.game.gameId);
      } catch (error) {
        console.log(error);
      }

      if (!stompClientInstance.client) {
        const Sock = new SockJS('http://localhost:8080/ws');
        stompClientInstance.client = over(Sock);
        stompClientInstance.client.connect({}, onConnected, onError);
      }
    };
    startUp();
    return () => {
      if (stompClientInstance.client) {
        stompClientInstance.client.disconnect();
        stompClientInstance.client = null;
      }
    };
  }, []);

  useEffect(() => {
    if (move) {
      axios.post(`http://localhost:8080/api/game`, {
        moveFrom: move.from,
        moveTo: move.to,
        userId: localStorage.getItem("userId")
      })
     .then(response => {
        console.log(response);
        if ( turn === "white" ){
          setTurn("black")
        }
        else if ( turn === "black" ){
          setTurn("white")
        }
      })
     .catch(error => {
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      });
      localStorage.setItem("game", game);
    }
  }, [move]);

  const onConnected = () => {
    stompClientInstance.client.subscribe(`/game/${localStorage.getItem("gameId")}`, onReceived);
  };

  const onReceived = (payload) => {
    console.log("Received message:", payload);
    const payloadData = JSON.parse(payload.body);
    console.log("Payload data:", payloadData);
    setTurn(payloadData.turn.toLowerCase());
    const gameCopy = {...game };
    const move = makeAMove({
      from: payloadData.moveFrom,
      to: payloadData.moveTo,
      promotion: "q"
    });
    gameCopy.move(move);
    setGame(gameCopy);
  };
  
  const onError = (error) => {
    console.error("Error subscribing to topic:", error);
  };

  function makeAMove(move) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    // setGame(gameCopy);
    return result;
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    if (move === null || turn !== localStorage.getItem("side").toLowerCase()) return false;
    setMove({ from: sourceSquare, to: targetSquare });
    return true;
  }

  return (
    <Chessboard
      position={game.fen()}
      onPieceDrop={onDrop}
      boardOrientation={localStorage.getItem("side")}
      boardWidth={500}
    />
  );
}