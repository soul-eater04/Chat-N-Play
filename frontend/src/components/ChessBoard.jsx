import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import io from "socket.io-client";
const socket = io("http://localhost:3000");
function ChessboardComponent() {
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState("white to move");
  const [position, setPosition] = useState("start");

  useEffect(() => {
    socket.on("newPosition", (data) => {
      const currentGame = new Chess();
      currentGame.load(data.position);
      setGame(currentGame);
      setPosition(data.position);
    });
  }, []);

  const onPieceDrop = (sourceSquare, targetSquare, piece) => {
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    let newStatus;
    if (gameCopy.isCheckmate()) {
      newStatus = `player ${gameCopy.turn()} wins by checkmate!`;
    } else if (gameCopy.inCheck()) {
      newStatus = `player ${gameCopy.turn()} is in check!`;
    } else {
      newStatus = `${gameCopy.turn() === "w" ? "white" : "black"} to move`;
    }

    socket.emit("playerMove", move);
    setGame(gameCopy);
    setPosition(gameCopy.fen());
    setStatus(newStatus);
    return true;
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="max-w-[60vh] w-[60vw]">
        <Chessboard
          id="ConfigurableBoard"
          position={position}
          arePiecesDraggable={true}
          onPieceDrop={onPieceDrop}
          allowDragOutsideBoard={false}
          animationDuration={300}
          areArrowsAllowed={true}
          arePremovesAllowed={false}
          autoPromoteToQueen={true}
          boardOrientation="white"
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
      <div>{status}</div>
    </div>
  );
}

export default ChessboardComponent;
