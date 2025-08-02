"use client";
import React, { useContext, useEffect } from "react";
import Controlbar from "./Controlbar";
import { VideoCallContext } from "../lib/VideocallHandler";
import { predictEmotion, loadModels } from "../lib/emotionDetection";

const VideocallComponent = () => {
  const vcContext = useContext(VideoCallContext);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (vcContext.videocallconnector) {
      const interval = setInterval(async () => {
        const videoElement = document.getElementById(
          "user-video"
        ) as HTMLVideoElement;

        if (videoElement) {
          const predictedEmotion = await predictEmotion(videoElement);
          if (predictedEmotion) {
            vcContext.videocallconnector.sendEmotion(predictedEmotion);
            console.log(predictedEmotion);
            document.getElementById("self-emotion-span").innerHTML =
              predictedEmotion;
            console.log(vcContext.videocallconnector);
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [vcContext.videocallconnector]);

  return (
    <div className="flex justify-center flex-col items-center">
      <div className="flex gap-4 flex-wrap">
        <div>
          <div className="w-100 h-100">
            {Array.from(vcContext.localVideos.entries()).map(
              ([key, localUser]) => {
                return (
                  <div key={key}>
                    <video
                      ref={(videoElement) => {
                        if (videoElement) {
                          videoElement.srcObject = localUser;
                        }
                        console.log(vcContext.remoteVideos);
                      }}
                      id={`user-${key}`}
                      autoPlay
                    ></video>
                    <span>Self Media Emotion: </span>
                    <span id="self-emotion-span"></span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div id="remote-videos">
          <div className="w-100 h-100">
            {Array.from(vcContext.remoteVideos.entries()).map(
              ([key, remoteUser]) => {
                return (
                  <div key={key}>
                    <video
                      ref={(videoElement) => {
                        if (videoElement) {
                          videoElement.srcObject = remoteUser.stream;
                        }
                        console.log(vcContext.remoteVideos);
                      }}
                      autoPlay
                    ></video>
                    <span>{remoteUser.userData.username}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
      <div>
        <button
          className="p-4 bg-gray-600"
          onClick={(e) => {
            console.log("start");
            vcContext.setStartCall(!vcContext.startCall);
            e.currentTarget.disabled = true;
          }}
        >
          Join meeting
        </button>
        <Controlbar />
      </div>
    </div>
  );
};

export default VideocallComponent;
