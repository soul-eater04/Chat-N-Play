import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import io from "socket.io-client";
import Swal from "sweetalert2";

const socket = io("http://localhost:3000");

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-right',
  iconColor: 'black',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
});

function ChessboardComponent() {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState("start");
  const [assignedMessage, setAssignedMessage] = useState("");
  const [turnMessage, setTurnMessage] = useState("White to move");
  const [color, setColor] = useState(null);

  useEffect(() => {
    socket.on("assignColor", (assignedColor) => {
      setColor(assignedColor);
      setAssignedMessage(
        `You have been assigned ${assignedColor === "w" ? "White" : "Black"}`
      );
    });

    socket.on("newPosition", (data) => {
      const currentGame = new Chess();
      currentGame.load(data.position);
      setGame(currentGame);
      console.log(game.isGameOver());
      if(game.isGameOver()){
        Toast.fire({
          icon: 'success',
          title: 'GAME OVER!',
        })
      }
      setPosition(data.position);
      setTurnMessage(`${data.color === "w" ? "Black" : "White"} to move`);
    });

    socket.emit("requestColor");
  }, []);

  const onPieceDrop = (sourceSquare, targetSquare) => {
    if (game.turn() === color) {
      const gameCopy = new Chess();
      gameCopy.load(game.fen());
      try {
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (move !== null) {
          socket.emit("move", move);
          return true;
        }
      } catch (err) {
        console.log(err);
      }
    }
    else {
      Toast.fire({
        icon: 'error',
        title: 'NOT YOU TURN!',
      })
      return false;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div>
        <Chessboard
          id="ConfigurableBoard"
          position={position}
          arePiecesDraggable={true}
          onPieceDrop={onPieceDrop}
          allowDragOutsideBoard={true}
          animationDuration={300}
          areArrowsAllowed={true}
          arePremovesAllowed={false}
          autoPromoteToQueen={true}
          boardOrientation={color === "w" ? "white" : "black"}
          boardWidth={600}
          clearPremovesOnRightClick={true}
          customArrowColor="rgb(255,170,0)"
          customBoardStyle={{
            borderRadius: "5px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
          }}
          customDarkSquareStyle={{ backgroundColor: "#B58863" }}
          customLightSquareStyle={{ backgroundColor: "#F0D9B5" }}
          dropOffBoardAction="snapback"
          getPositionObject={(currentPosition) => {
            console.log(currentPosition);
          }}
          showBoardNotation={true}
          showPromotionDialog={true}
          snapToCursor={true}
        />
      </div>
      <div className="mt-4 p-4 border rounded bg-gray-100 text-center">
        {assignedMessage}
      </div>
      <div className="mt-2 p-4 border rounded bg-gray-100 text-center">
        {turnMessage}
      </div>
    </div>
  );
}

export default ChessboardComponent;
