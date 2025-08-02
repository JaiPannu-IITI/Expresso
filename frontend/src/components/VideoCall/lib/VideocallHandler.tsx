import React, { createContext, useState, useEffect } from "react";
import { VideoCallConnector } from "./VideocallConnector";
import { getMeetDetails, getUserDetails } from "@/helpers/api";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

interface VideoCallContextProps {
  video: boolean;
  audio: boolean;
  startCall: boolean;
  screen: boolean;
  setVideo: (video: boolean) => void;
  setAudio: (audio: boolean) => void;
  setStartCall: (call: boolean) => void;
  setScreen: (screen: boolean) => void;
  localVideos: Map<string, MediaStream>;
  remoteVideos: Map<string, { userData: any; stream: MediaStream }>;
  videocallconnector: VideoCallConnector;
}

export const VideoCallContext = createContext<VideoCallContextProps>(null);

let VCConnector: VideoCallConnector;

export const VideoCallProvider = (props: {
  children: React.ReactNode;
  meetId: string;
}) => {
  const [userData, setUserData] = useState<any>();
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [localVideos, setLocalVideos] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [remoteVideos, setRemoteVideos] = useState<
    Map<string, { userData: any; stream: MediaStream }>
  >(new Map());
  const [startCall, setStartCall] = useState(false);
  const router = useRouter();

  const addRemoteVideo = (
    producerId: string,
    videoStream: MediaStream,
    userData: any
  ) => {
    // TODO Notify users that a user connected

    setRemoteVideos((prev) => {
      const newMap = new Map(prev);
      console.log(producerId);
      newMap.delete(producerId);
      newMap.set(producerId, { stream: videoStream, userData: userData });
      return newMap;
    });
  };

  const removeRemoteVideo = (producerId: string) => {
    // TODO Notify users that a user disconnected

    setRemoteVideos((prev) => {
      const newMap = new Map(prev);
      newMap.delete(producerId);
      return newMap;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const c1 = await getUserDetails();
      const meetDetails = await getMeetDetails(props.meetId);
      console.log(meetDetails);
      if (c1 && meetDetails && c1.username && meetDetails.id) {
        setUserData(c1);
      } else {
        router.push("/login");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (startCall) {
      const start = async () => {
        VCConnector.startSending("video", video, audio);
      };
      start();
    }
  }, [startCall]);

  useEffect(() => {
    try {
      if (userData.username) {
        VCConnector = new VideoCallConnector(
          addRemoteVideo,
          removeRemoteVideo,
          setLocalVideos,
          userData,
          props.meetId
        );
      }
    } catch (error) {
      return;
    }
  }, [userData, props.meetId]);

  return (
    <VideoCallContext.Provider
      value={{
        video,
        audio,
        setVideo,
        setAudio,
        localVideos,
        remoteVideos,
        startCall,
        setStartCall,
        screen,
        setScreen,
        videocallconnector: VCConnector,
      }}
    >
      {!userData && <CircularProgress />}
      {userData && props.children}
    </VideoCallContext.Provider>
  );
};
