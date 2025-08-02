import React, { useContext } from "react";
import { VideoCallContext } from "../lib/VideocallHandler";

const Controlbar = () => {
  const vcContext = useContext(VideoCallContext);
  return (
    <div>
      <button
        className="p-4 bg-gray-600"
        onClick={() => {
          vcContext.videocallconnector.updateLocalVideo(
            vcContext.video,
            !vcContext.audio
          );
          vcContext.setAudio(!vcContext.audio);
        }}
      >
        Mic
      </button>
      <button
        className="p-4 bg-gray-600"
        onClick={() => {
          vcContext.videocallconnector.updateLocalVideo(
            !vcContext.video,
            vcContext.audio
          );
          vcContext.setVideo(!vcContext.video);
        }}
      >
        Camera
      </button>
      <button
        className="p-4 bg-gray-600"
        onClick={() => {
          if (vcContext.screen) {
            vcContext.videocallconnector.stopSendingScreen("screen");
          } else {
            vcContext.videocallconnector.startSendingScreen("screen");
          }
          vcContext.setScreen(!vcContext.screen);
        }}
      >
        Screen share
      </button>
      <button className="p-4 bg-gray-600">End call</button>
      {/* <button>Show users</button> */}
    </div>
  );
};

export default Controlbar;
