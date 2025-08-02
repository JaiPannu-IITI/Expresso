"use client";
import {
  VideoCallContext,
  VideoCallProvider,
} from "@/components/VideoCall/lib/VideocallHandler";
import { getMeetDetails } from "@/helpers/api";
import dynamic from "next/dynamic";
import React, { useContext, useEffect } from "react";

const VideocallComponent = dynamic(
  () => import("@/components/VideoCall/UIcopy/Videocall"),
  {
    ssr: false,
  }
);

const CallPage = ({ params }: { params: { callId: string } }) => {
  return (
    <VideoCallProvider meetId={params.callId}>
      <VideocallComponent />
    </VideoCallProvider>
  );
};

export default CallPage;
