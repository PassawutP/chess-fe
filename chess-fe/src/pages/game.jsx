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
  const [turn, setTurn] = useState("WHITE");
  const [status, setStatus] = useState("READY");

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
    const gameId = localStorage.getItem("gameId");
    if (gameId) {
      stompClientInstance.client.subscribe(`/game/${gameId}`, onReceived);
    }
  };

  const onReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    const gameCopy = {...game };
    gameCopy.move({
      from: payloadData.moveFrom,
      to: payloadData.moveTo,
      promotion: "q"
    });
    setGame(gameCopy);
    if (payloadData.status === "ENDING") {
      setStatus("ENDING");
    }
    setTurn(payloadData.turn);
  };

  const onError = (error) => {
    console.error("Error subscribing to topic:", error);
  };

  function makeAMove(move) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    return result;
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    console.log(turn)
    console.log(localStorage.getItem("side"))
    if (move === null || turn.toLowerCase() !== localStorage.getItem("side")) return false;
    setMove({ from: sourceSquare, to: targetSquare });
    return true;
  }

  return (
    <div>
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={localStorage.getItem("side").toLocaleLowerCase()}
        boardWidth={500}
      />
      { (status === "ENDING") && 
        <div>
          {turn === "BLACK" ? "WHITE" : "BLACK"} WINS!
        </div>
      }
    </div>
  );
}
