import * as Mediasoup from "mediasoup-client";
import { Transport } from "mediasoup-client/lib/types";
import { animateUserEmotion } from "../UIcopy/Videocall";
import { appendMessage, appendSelfMessage } from "../UIcopy/Chatbox";
const WebSocketBaseURL = process.env.NEXT_PUBLIC_SERVER_URL;
const WSURL = (uuid: string, roomId: string) => {
  return `${WebSocketBaseURL}?uuid=${uuid}&roomId=${roomId}`;
};

export const send = (ws: WebSocket, type: string, message: any) => {
  const msg = {
    type,
    data: message,
  };

  const resp = JSON.stringify(msg);
  ws.send(resp);
};

export class VideoCallConnector {
  public roomId: string;
  public userData: any;
  public producer: Mediasoup.types.Producer;
  public producerTransports: Map<string, Mediasoup.types.Transport> = new Map();
  public consumerTransports: Map<string, Mediasoup.types.Transport>;
  public socket: WebSocket;
  public device: Mediasoup.Device;
  public addRemoteVideo: (
    producerId: string,
    videoStream: MediaStream,
    userrData: any
  ) => void;
  public removeRemoteVideo: (producerId: string) => void;
  public localVideos: Map<string, MediaStream> = new Map();
  public setLocalVideos: (videos: Map<string, MediaStream>) => void;

  subscribe = () => {
    send(this.socket, "getUsers", "");
    this.socket.addEventListener("message", async (event: MessageEvent) => {
      if (!this.isJson(event.data)) {
        return;
      }
      const data = JSON.parse(event.data);
      console.log(data);

      switch (data.type) {
        case "newProducer":
          await this.onNewProducer(data);
          break;
        case "userDisconnected":
          await this.onUserDisconnected(data);
          break;
        case "userMessage":
          if (data.data.username == this.userData.username) {
            appendSelfMessage(data.data.message, data.data.username);
          } else {
            appendMessage(data.data);
          }
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
      if (data.type === "getUsers") {
        console.log("sucscribing");
        console.log(data.data);

        Object.values(data.data).forEach((value: any) => {
          if (value.uuid !== this.userData.pk) {
            try {
              const msg = {
                type: "createConsumerTransport",
                forceTcp: false,
                userId: value.uuid,
              };
              this.socket.send(JSON.stringify(msg));
            } catch {}
          }
        });
      }
    });
  };

  constructor(
    addRemoteVideoParam: (
      producerId: string,
      videoStream: MediaStream,
      userData: any
    ) => void,
    removeRemoteVideo: (producerId: string) => void,
    setLocalVideo: (videos: Map<string, MediaStream>) => void,
    userData: any,
    roomId: string
  ) {
    this.roomId = roomId;
    const url = WSURL(userData.pk, roomId);
    console.log(url);
    const newSocket = new WebSocket(url);
    this.socket = newSocket;
    this.addRemoteVideo = addRemoteVideoParam;
    this.removeRemoteVideo = removeRemoteVideo;
    this.setLocalVideos = setLocalVideo;
    this.userData = userData;
    this.consumerTransports = new Map();

    newSocket.onopen = () => {
      console.log("connected");
      send(this.socket, "getRouterRtpCapabilities", userData);
    };

    newSocket.onmessage = async (e: MessageEvent) => {
      if (!this.isJson(e.data)) {
        return;
      }
      const data = JSON.parse(e.data);
      console.log(data);

      switch (data.type) {
        case "routerCapabilities":
          await this.onRouterCapabilities(data);
          break;
        case "producerTransportCreated":
          await this.onProducerTransportCreated(data);
          break;
        case "subtransportCreated":
          await this.onsubtransportCreated(data);
          break;
        case "resumed":
          console.log(data.data);
          break;
        case "subscribed":
          await this.onSubscribed(data);
          break;
        case "emotionUpdate":
          animateUserEmotion(data.data.userId, data.data.emotion);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    };
  }

  isJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  };

  updateLocalVideo = (video: boolean, audio: boolean) => {
    if (this.localVideos.get("video")) {
      this.localVideos
        .get("video")
        .getTracks()
        .find((track) => track.kind === "video").enabled = video;
      this.localVideos
        .get("video")
        .getTracks()
        .find((track) => track.kind === "audio").enabled = audio;
    }
  };

  sendMessage = (message: string) => {
    send(this.socket, "userMessage", {
      userId: this.userData.id,
      username: this.userData.username,
      message: message,
    });
  };

  startSending = async (type: string, video: boolean, audio: boolean) => {
    try {
      console.log("transport: ", this.producerTransports.get(type));
      const stream: MediaStream = await this.getUserMedia((type = "video"));
      this.localVideos.set(type, stream);
      this.setLocalVideos(new Map(this.localVideos));
      const track = stream.getVideoTracks()[0];
      this.subscribe();
      this.updateLocalVideo(video, audio);

      this.producer = await this.producerTransports
        .get(type)
        .produce({ track });
    } catch (error) {
      console.error(error);
    }
  };

  startSendingScreen = async (type: string) => {
    try {
      this.publish(this.device, this.socket, type);
      this.socket.addEventListener("message", async (e: MessageEvent) => {
        if (!this.isJson(e.data)) {
          return;
        }
        const data = JSON.parse(e.data);
        console.log(data);

        if (data.type == "producerTransportCreated") {
          console.log("transport: ", this.producerTransports.get(type));
          const stream: MediaStream = await this.getUserMedia(type == type);
          this.localVideos.set(type, stream);
          this.setLocalVideos(this.localVideos);
          const track = stream.getVideoTracks()[0];
          this.producer = await this.producerTransports
            .get(type)
            .produce({ track });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  stopSendingScreen = async (type: string) => {
    this.producerTransports.delete(type);
    this.localVideos.delete(type);
    send(this.socket, "stopProducer", { producerType: type });
  };

  sendEmotion = async (emotion: string) => {
    send(this.socket, "emotionUpdate", {
      userId: this.userData.pk,
      emotion: emotion,
    });
  };

  onNewProducer = async (event: any) => {
    if (event.data.id !== this.userData.pk) {
      const msg = {
        type: "createConsumerTransport",
        forceTcp: false,
        userId: event.data.id,
      };
      this.socket.send(JSON.stringify(msg));
    }
  };

  onUserDisconnected = async (event) => {
    console.log("Event: ", event);
    event.data.map((id) => this.removeRemoteVideo(id));
  };

  getUserMedia = async (type) => {
    if (!this.device.canProduce("video")) {
      console.error("Cannot produce video");
      return;
    }

    let stream: MediaStream;
    try {
      stream =
        type === "video"
          ? await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            })
          : await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
    return stream;
  };

  loadDevice = async (routerRtpCapabilities) => {
    try {
      const newDevice = new Mediasoup.Device();
      await newDevice.load({ routerRtpCapabilities });
      this.device = newDevice;
      return newDevice;
    } catch (error) {
      console.log("error: ", error);
    }
  };

  onRouterCapabilities = async (data) => {
    const newDevice = await this.loadDevice(data.data);
    console.log("Device loaded");
    if (this.socket && newDevice) {
      this.publish(newDevice, this.socket, "video");
    }
  };

  onSubscribed = async (event: any) => {
    if (event.data) {
      for (let [producerType, streamData] of Object.entries(event.data)) {
        const {
          producerId,
          id,
          kind,
          rtpParameters,
          type,
          producerPaused,
          transportId,
          userData,
        }: any = streamData;

        console.log(
          "onSubscribeEvent data: ",
          {
            id,
            producerId,
            kind,
            rtpParameters,
          },
          "consumer Transport: ",
          this.consumerTransports
        );

        let codecOptions = {};
        const consumer = await this.consumerTransports
          .get(transportId)
          .consume({
            id,
            producerId,
            kind,
            rtpParameters,
          });

        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        this.addRemoteVideo(producerId, stream, userData);
      }
    }
  };

  onProducerTransportCreated = async (data) => {
    if (data.error) {
      console.error("Producer Transport create error!");
      return;
    }

    console.log("PRODUCER: ", data);

    const iceServerDomain =
      process.env.NEXT_PUBLIC_ICE_SERVER_DOMAIN || "localhost";
    const iceServerUsername =
      process.env.NEXT_PUBLIC_ICE_SERVER_USERNAME || "expresso_user";
    const iceServerPassword =
      process.env.NEXT_PUBLIC_ICE_SERVER_PASSWORD || "expresso_password";

    // Validate ICE server configuration
    if (!iceServerDomain || iceServerDomain === "localhost") {
      console.warn(
        "ICE server domain not configured properly. Using fallback STUN servers."
      );
    }

    const iceServers = [
      {
        urls: `stun:${iceServerDomain}:3478`,
      },
      {
        urls: `turn:${iceServerDomain}:3478?transport=udp`,
        credential: iceServerPassword,
        username: iceServerUsername,
      },
      {
        urls: `turn:${iceServerDomain}:3478?transport=tcp`,
        credential: iceServerPassword,
        username: iceServerUsername,
      },
    ];

    console.log("ICE Servers configuration:", iceServers);

    try {
      this.producerTransports.set(
        data.data.producerType,
        this.device.createSendTransport({
          id: data.data.id,
          iceParameters: data.data.iceParameters,
          iceCandidates: data.data.iceCandidates,
          dtlsParameters: data.data.dtlsParameters,
          iceServers,
        })
      );
    } catch (error) {
      console.error("Failed to create producer transport:", error);
      return;
    }

    console.log(
      "PRODUCER2: ",
      this.producerTransports.get(data.data.producerType)
    );

    this.producerTransports
      .get(data.data.producerType)
      .on("connect", async ({ dtlsParameters }, callback, errback) => {
        this.socket.send(
          JSON.stringify({
            type: "connectProducerTransport",
            dtlsParameters,
            transportId: this.producerTransports.get(data.data.producerType).id,
            producerType: data.data.producerType,
          })
        );
        this.socket.addEventListener("message", (event: MessageEvent) => {
          if (!this.isJson(event.data)) {
            return;
          }
          let resp = JSON.parse(event.data);
          if (resp.type === "producerConnected") {
            callback();
          }
        });
      });

    this.producerTransports
      .get(data.data.producerType)
      .on("produce", async ({ kind, rtpParameters }, callback, errback) => {
        this.socket.send(
          JSON.stringify({
            type: "produce",
            transportId: this.producerTransports.get(data.data.producerType).id,
            kind,
            rtpParameters,
            producerType: data.data.producerType,
          })
        );
        this.socket.addEventListener("published", (event: MessageEvent) => {
          console.log("produced: ", event.data);
          if (!this.isJson(event.data)) {
            return;
          }
          let resp = JSON.parse(event.data);
          if (this.isJson(event.data) && resp.type === "produced") {
            callback(resp.data.id);
          }
        });
      });

    this.producerTransports
      .get(data.data.producerType)
      .on("connectionstatechange", (state) => {
        switch (state) {
          case "connecting":
            console.log("publishing state");
            break;
          case "connected":
            console.log("published state");
            break;
          case "failed":
            console.error("failed state");
            // this.producerTransports.get(data.data.producerType).close();
            break;
          default:
            console.log("default state:", state);
            break;
        }
      });
  };

  onsubtransportCreated = (event: any) => {
    if (event.error) {
      console.error("On subtransport create error: ", event.errback);
    }

    const processedData = event.data;

    const iceServerDomain =
      process.env.NEXT_PUBLIC_ICE_SERVER_DOMAIN || "localhost";
    const iceServerUsername =
      process.env.NEXT_PUBLIC_ICE_SERVER_USERNAME || "expresso_user";
    const iceServerPassword =
      process.env.NEXT_PUBLIC_ICE_SERVER_PASSWORD || "expresso_password";

    processedData["iceServers"] = [
      {
        urls: `stun:${iceServerDomain}:3478`,
      },
      {
        urls: `turn:${iceServerDomain}:3478?transport=udp`,
        credential: iceServerPassword,
        username: iceServerUsername,
      },
      {
        urls: `turn:${iceServerDomain}:3478?transport=tcp`,
        credential: iceServerPassword,
        username: iceServerUsername,
      },
    ];

    const transport = this.device.createRecvTransport(processedData);
    // console.log("Consumer Transport: ", transport);
    this.consumerTransports.set(transport.id, transport);
    // console.log(this.consumerTransports);

    const { rtpCapabilities } = this.device;

    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      console.log("trasnport toconnect");
      const msg = {
        type: "connectConsumerTransport",
        transportId: transport.id,
        dtlsParameters,
        rtpCapabilities,
      };

      this.socket.send(JSON.stringify(msg));

      // subConnected
      this.socket.addEventListener("message", async (event: MessageEvent) => {
        if (!this.isJson(event.data)) {
          return;
        }
        let resp = JSON.parse(event.data);
        if (resp.type === "subConnected") {
          console.log("consumer Transport connected and callback made");

          callback();
        }
      });
    });

    transport.on("connectionstatechange", async (state) => {
      switch (state) {
        case "connecting":
          console.log("connecting");
          break;
        case "connected":
          console.log("connected");
          this.resumeVideos();
          break;
        case "failed":
          // transport.close();
          console.error("connection failed");
      }
    });
    const stream = this.consume(transport);
  };

  consume = async (transport: Transport) => {
    const { rtpCapabilities } = this.device;
    const msg = {
      type: "consume",
      rtpCapabilities,
      transportId: transport.id,
      userId: transport.appData.userId,
    };
    this.socket.send(JSON.stringify(msg));
  };

  resumeVideos = async () => {
    const msg = {
      type: "resume",
    };
    this.socket.send(JSON.stringify(msg));
  };

  publish = (device: Mediasoup.Device, socket, type: string) => {
    if (device && socket) {
      socket.send(
        JSON.stringify({
          type: "createProducerTransport",
          forceTcp: false,
          routerRtpCapabilities: device.rtpCapabilities,
          producerType: type,
        })
      );
    } else {
      console.error("Device or socket is not available");
    }
  };
}
