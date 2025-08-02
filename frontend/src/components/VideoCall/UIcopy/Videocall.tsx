"use client";
import React, { useContext, useEffect, useState } from "react";
import Controlbar from "./Controlbar";
import { VideoCallContext } from "../lib/VideocallHandler";
import { predictEmotion, loadModels } from "../lib/emotionDetection";
import Logo from "../../../components/logo/logo";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@nextui-org/react";
import ChatIcon from "@mui/icons-material/Chat";
import Game from "@/components/game/game";
import SettingsIcon from "@mui/icons-material/Settings";
import Chatbox from "./Chatbox";

export const animateUserEmotion = (userId, predictedEmotion) => {
  const el1 = document.getElementById(`remote${userId}`);

  if (el1 === null) {
  } else {
    el1.innerHTML = `
<div class = " w-[75px] h-[75px]  animate-bounce"> 
<Image src="/data/emotions/${predictedEmotion}.png" width={500} height={500} alt="Expresso" />
 </div>
 `;
  }
};

const VideocallComponent = () => {
  const vcContext = useContext(VideoCallContext);
  const [game, setGame] = React.useState(false);
  const [view, setView] = React.useState("single");
  const [activeId, setActiveId] = React.useState<string>("video");
  const [chat, setChat] = useState<boolean>(false);

  function activeIdHandler(key) {
    setActiveId(key);
  }

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
            document.getElementById("self-emotion-span").innerHTML = `
             
              <div class = " w-[75px] h-[75px]  animate-bounce"> 
              <Image src="/data/emotions/${predictedEmotion}.png" width={500} height={500} alt="Expresso" />
               </div>
               
            
               `;
            console.log(vcContext.videocallconnector);
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [vcContext.videocallconnector]);

  return (
    <>
      {!vcContext.startCall ? (
        <div className=" absolute  top-2 left-2 z-10">
          <Image
            src="/data/logos/logo.png"
            width={200}
            height={70}
            alt="Expresso"
          ></Image>
        </div>
      ) : null}

      {!vcContext.startCall ? (
        <div className=" w-[100%] h-[100vh] flex justify-center items-center ">
          <div className=" z-10 flex gap-10 items-center flex-col sm:flex-row sm:-translate-y-20">
            <div className=" z-10">
              {vcContext.video ? (
                <div style={{display: game ? "none" : "flex"}} className=" flex justify-center items-center sm:h-[325px] sm:w-[460px] h-[225px] w-[330px] bg-[#0000003b] rounded-3xl  ">
                  <Webcam
                    mirrored
                    height={400}
                    width={400}
                    className=" rounded-lg"
                  />
                </div>
              ) : (
                <div className=" flex justify-center items-center h-[325px]  w-[460px] bg-[rgba(24,24,27)] rounded-3xl overflow-hidden">
                  <div className=" -translate-x-[30%] translate-y-[20%]  ">
                    <Logo width={400} />
                  </div>
                </div>
              )}
            </div>

            <div className="  transition-all duration-300 w-[100%]    flex gap-5 flex-col z-40 ">
              <div className=" flex flex-row sm:flex-col justi1fy-between items-center w-[100%] gap-5">
              <div className=" sm:text-[2rem] text-[1rem]"> Dive into Expresso World </div>
              <div className="w-[100%]">
                <Button
                  variant="ghost"
                  className="p-4 bg-[rgba(24,24,27)] w-[100%] light text-white rounded-3xl"
                  onClick={(e) => {
                    console.log("start");
                    vcContext.setStartCall(!vcContext.startCall);
                    e.currentTarget.disabled = true;
                  }}
                >
                  Join meeting
                </Button>
              </div>
              </div>

              {game ? (
                <div className=" w-[100%] gap-5 flex flex-col transition-all duration-300">
                  {" "}
                  <Button
                    variant="light"
                    color="danger"
                    className="p-4 bg-[rgba(24,24,27)] w-[100%] light text-white rounded-3xl"
                    onClick={(e) => {
                      setGame(false);
                    }}
                  >
                    Exit Game
                  </Button>{" "}
                  <Game />{" "}
                </div>
              ) : (
                <div className=" flex flex-col gap-5 ">
                  <div className="text-[1rem] opacity-50 sm:flex hidden">Getting Bored ?</div>
                  <Button
                    variant="light"
                    color="danger"
                    className="p-4 bg-[rgba(24,24,27)] light text-white rounded-3xl"
                    onClick={(e) => {
                      setGame(true);
                    }}
                  >
                    Play Memory Game
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {vcContext.startCall ? (
        <div className="relative z-10 appear w-[100%] h-[100vh] pb-[10vh] overflow-y-hidden  flex flex-col justify-around flex-wrap gap-5 p-5 overflow-x-auto">
          {/* {
            view === "double" ?
              <div>
                <div>
                </div>
                <div>
                </div>
              </div>
              :
              view === "quad" ?
                <div>
                  <div>
                  </div>
                  <div>
                  </div>
                  <div>
                  </div>
                  <div>
                  </div>
                </div>
                :
                <div className=" w-[67.5vw] h-[100%] flex relative rounded-3xl bg-[rgba(30,30,30,0.7)] overflow-y-hidden">

                  {Array.from(vcContext.localVideos.entries()).map(
                    ([key, localUser]) => {
                      console.log("key", key)
                      return (
                        <>
                          {vcContext.screen && key === "video" ?

                            <div key={key} className=" z-10 w-[460px] h-[265px] object-cover rounded-3xl overflow-hidden absolute left-5 bottom-5">

                              <video
                                ref={(videoElement) => {
                                  if (videoElement) {
                                    videoElement.srcObject = localUser;
                                  }
                                  console.log(vcContext.remoteVideos);
                                }}
                                id={`user-${key}`}
                                autoPlay
                                className="w-[100%] h-[100%] object-cover"
                              ></video>

                            </div>


                            :
                            <div key={key} className=" w-[100%] h-[100%] rounded-3xl overflow-hidden  relative">

                              <video
                                ref={(videoElement) => {
                                  if (videoElement) {
                                    videoElement.srcObject = localUser;
                                  }
                                  console.log(vcContext.remoteVideos);
                                }}
                                id={`user-${key}`}
                                autoPlay
                                className="w-[100%] h-[100%] "
                              ></video>

                            </div>
                          }

                        </>
                      );
                    }
                  )}

                </div>

          } */}

          {Array.from(vcContext.localVideos.entries()).map(
            ([key, localUser]) => {
              const id = key.toString();

              const containerClassName =
                id === activeId
                  ? "sm:w-[67.5vw] w-[90vw] sm:h-[90%] h-[90%] relative rounded-3xl bg-[rgba(30,30,30,0.7)] overflow-y-hidden transition-all duration-300"
                  : "sm:w-[460px] sm:h-[265px] w-[90vw] h-[45%] relative overflow-hidden rounded-3xl bg-[rgba(30,30,30,0.7)] transition-all duration-300";

              return (
                <div
                  id={id}
                  key={key}
                  onClick={() => setActiveId(id)}
                  className={containerClassName}
                >
                  <video
                    ref={(videoElement) => {
                      if (videoElement) {
                        videoElement.srcObject = localUser;
                      }
                    }}
                    id={`user-${key}`}
                    autoPlay
                    muted
                    className="w-[100%] h-[100%] object-cover"
                  ></video>

                  <span
                    id="self-emotion-span"
                    className="   absolute bottom-5 right-5 "
                  ></span>
                </div>
              );
            }
          )}

          {Array.from(vcContext.remoteVideos.entries()).map(
            ([key, remoteUser]) => {
              const id = remoteUser.userData.pk.toString();

              const containerClassName =
                id === activeId
                ? "sm:w-[67.5vw] w-[90vw] sm:h-[90%] h-[90%] relative rounded-3xl bg-[rgba(30,30,30,0.7)] overflow-y-hidden transition-all duration-300"
                : "sm:w-[460px] sm:h-[265px] w-[90vw] h-[45%] relative overflow-hidden rounded-3xl bg-[rgba(30,30,30,0.7)] transition-all duration-300";

              return (
                <div
                  id={remoteUser.userData.pk}
                  key={key}
                  onClick={() => setActiveId(id)}
                  className={containerClassName}
                >
                  <video
                    ref={(videoElement) => {
                      if (videoElement) {
                        videoElement.srcObject = remoteUser.stream;
                      }
                      console.log(vcContext.remoteVideos);
                    }}
                    autoPlay
                    className="w-[100%] h-[100%] object-cover"
                  ></video>
                  <div className=" revealname absolute bottom-0 w-[100%] p-5 leading-3 opacity-60  ">
                    @ {remoteUser.userData.username}
                  </div>

                  <span
                    id={`remote${id}`}
                    className="   absolute bottom-5 right-5 "
                  ></span>
                </div>
              );
            }
          )}
        </div>
      ) : null}

      {/*       
      <div className="flex justify-center flex-col items-center z-10  ">

        <div className="flex gap-4 flex-wrap w-[100%] h-[100%]  ">

          <div className="w-[100%] h-[100%]">
            <div className="w-[100%] h-[100%]">
              {Array.from(vcContext.localVideos.entries()).map(
                ([key, localUser]) => {
                  return (
                    <div key={key} className=" w-[100%] relative">
                      <video
                        ref={(videoElement) => {
                          if (videoElement) {
                            videoElement.srcObject = localUser;
                          }
                          console.log(vcContext.remoteVideos);
                        }}
                        id={`user-${key}`}
                        autoPlay
                        className="w-[100%] h-[100%]"
                      ></video>
                      <span id="self-emotion-span" className=" w-[100%]   absolute bottom-0 left-0 ">
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>


          <div id="remote-videos">
            <div className="w-[100%] h-[100%]">
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

      </div> */}

      <div className="   flex items-center flex-col z-40 ">
        {vcContext.startCall ? (
          <div className=" z-10 absolute sm:left-5 left-4 bottom-5  flex justify-center items-center">
            <Button
              isIconOnly
              className="rounded-[50%] sm:w-[4rem] sm:h-[4rem] w-[3rem] h-[3rem]  bg-[rgba(50,50,50,0.3)] flex justify-center items-center z-10"
              onClick={() => {
                document
                  .getElementById("chat-box")
                  .classList.toggle("invisible");
              }}
            >
              <ChatIcon className=" text-[1.6rem] text-white" />
            </Button>
            <Chatbox />
          </div>
        ) : null}

        <Controlbar />

        <div className=" z-10 absolute sm:right-5 right-4 bottom-5  flex justify-center items-center">
          <Button
            isIconOnly
            className="rounded-[50%] sm:w-[4rem] sm:h-[4rem] w-[3rem] h-[3rem]  bg-[rgba(50,50,50,0.3)] flex justify-center items-center"
            onClick={() => {
              if (vcContext.screen) {
                vcContext.videocallconnector.stopSendingScreen("screen");
              } else {
                vcContext.videocallconnector.startSendingScreen("screen");
              }
              vcContext.setScreen(!vcContext.screen);
            }}
          >
            <SettingsIcon className=" text-[1.6rem] text-white" />
          </Button>
        </div>
      </div>

      <div className="absolute left-[-10%] bottom-[-20%] opacity-5 ">
        <Logo width="1000" />
      </div>
    </>
  );
};

export default VideocallComponent;
