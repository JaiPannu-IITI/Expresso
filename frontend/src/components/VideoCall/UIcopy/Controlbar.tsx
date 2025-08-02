import React, { useContext } from "react";
import { VideoCallContext } from "../lib/VideocallHandler";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

import Link from 'next/link';
import PhonePausedIcon from '@mui/icons-material/PhonePaused';
import {Button} from "@nextui-org/react";

const Controlbar = () => {
  const vcContext = useContext(VideoCallContext);
  return (
    <div className=" flex gap-3 absolute bottom-5">
      <Button isIconOnly
        className="rounded-[50%] sm:w-[4rem] sm:h-[4rem] w-[3rem] h-[3rem] bg-[rgba(50,50,50,0.3)] flex justify-center items-center"
        onClick={() => {
          vcContext.videocallconnector.updateLocalVideo(
            vcContext.video,
            !vcContext.audio
          );
          vcContext.setAudio(!vcContext.audio);
        }}
      >
        {vcContext.audio ? <MicIcon className="text-[1.6rem] text-white" /> : <MicOffIcon className=" text-[1.6rem] text-white" />}
        
      </Button>
      <Button isIconOnly
        className="rounded-[50%] box-border sm:w-[4rem] sm:h-[4rem] w-[3rem] h-[3rem] bg-[rgba(50,50,50,0.3)] flex justify-center items-center"
        onClick={() => {
          if (vcContext.startCall) {
          vcContext.videocallconnector.updateLocalVideo(
            !vcContext.video,
            vcContext.audio
          );
        }else{
          
        }
        vcContext.video = !vcContext.video;
          vcContext.setVideo(vcContext.video);
        }}
      >
        {vcContext.video ? <VideocamIcon className=" text-[1.6rem] text-white" /> : <VideocamOffIcon className=" text-[1.6rem] text-white" />}
      </Button>
     

      {vcContext.startCall? 
         <Button isIconOnly
         className="rounded-[50%] sm:w-[4rem] sm:h-[4rem] w-[3rem] h-[3rem] bg-[rgba(50,50,50,0.3)] flex justify-center items-center"
         onClick={() => {
           if (vcContext.screen) {
             vcContext.videocallconnector.stopSendingScreen("screen");
           } else {
             vcContext.videocallconnector.startSendingScreen("screen");
           }
           vcContext.setScreen(!vcContext.screen);
         }}
       >
         <PresentToAllIcon className=" text-[1.6rem] text-white" />
       </Button >
         : null }

      
      
      
        {vcContext.startCall? 
        <Link href="/dashboard">
        <Button isIconOnly className="rounded-[50%] sm:w-[4rem] sm:h-[4rem] w-[3rem] h-[3rem]  hover:bg-[rgb(220,81,0)] border-[2px] border-[rgb(220,81,0)] bg-[rgba(220,81,0,0.2)] transition-all duration-100   flex justify-center items-center">
          <CallEndIcon className=" text-[1.6rem] text-white" />
          </Button>
          </Link>
         : null }
     
    </div>
  );
};

export default Controlbar;