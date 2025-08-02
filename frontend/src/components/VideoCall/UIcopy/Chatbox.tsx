import React, { useContext } from "react";
import { VideoCallContext } from "../lib/VideocallHandler";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ReactDOM from "react-dom";

export const appendSelfMessage = (message: string, username: string) => {
  // Create elements for the message
  const messageContainer = document.createElement("div");
  if (messageContainer) {
  } else {
    return;
  }
  messageContainer.className =
    "flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end";

  const messageContent = document.createElement("div");

  const messageBubble = document.createElement("div");
  messageBubble.className =
    "bg-customorange-600 text-white p-3 rounded-bl-lg rounded-tl-2xl rounded-br-2xl";
  const messageText = document.createElement("p");
  messageText.className = "text-sm";
  messageText.textContent = message;
  messageBubble.appendChild(messageText);

  const messageMeta = document.createElement("span");
  messageMeta.className = "text-xs text-white leading-none";
  messageMeta.textContent = username;

  messageContent.appendChild(messageBubble);
  messageContent.appendChild(messageMeta);

  const avatarContainer = document.createElement("div");
  avatarContainer.className =
    "flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center";

  const avatar = React.createElement(AccountCircleIcon, {
    style: { fontSize: 40 },
  });

  const avatarWrapper = document.createElement("div");
  avatarWrapper.appendChild(avatarContainer);
  messageContainer.appendChild(messageContent);
  messageContainer.appendChild(avatarWrapper);

  // Append the new message to the messages container
  document.getElementById("messages-list-div").appendChild(messageContainer);

  // Use ReactDOM to render the icon
  import("react-dom").then((ReactDOM) => {
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(avatar, avatarContainer);
  });
};

export const appendMessage = (data) => {
  const mDiv = document.getElementById("messages-list-div");
  if (mDiv) {
  } else {
    return;
  }

  const messageContainer = document.createElement("div");
  messageContainer.className = "flex w-full mt-2 space-x-3 max-w-xs";

  const avatarDiv = document.createElement("div");
  avatarDiv.className =
    "flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center";

  const messageContentDiv = document.createElement("div");

  const messageTextDiv = document.createElement("div");
  messageTextDiv.className = "bg-gray-300 p-3 rounded-r-lg rounded-bl-lg";

  const messageText = document.createElement("p");
  messageText.className = "text-sm";
  messageText.textContent = data.message;

  messageTextDiv.appendChild(messageText);

  const usernameSpan = document.createElement("span");
  usernameSpan.className = "text-xs text-white leading-none";
  usernameSpan.textContent = data.username;

  messageContentDiv.appendChild(messageTextDiv);
  messageContentDiv.appendChild(usernameSpan);

  messageContainer.appendChild(avatarDiv);
  messageContainer.appendChild(messageContentDiv);

  mDiv.appendChild(messageContainer);

  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(<AccountCircleIcon style={{ fontSize: 40 }} />, avatarDiv);
};

const Chatbox = () => {
  const vcContext = useContext(VideoCallContext);
  const sendMessage = () => {
    const msgInput = document.getElementById("msg-input") as HTMLInputElement;
    const message = msgInput.value;
    console.log("Message sent:", message);
    vcContext.videocallconnector.sendMessage(message);
    msgInput.value = "";
  };

  return (
    <div
      id="chat-box"
      className="absolute invisible bottom-[7.5rem]  left-0 rounded-3xl flex flex-col items-center justify-center w-[320px] sm:w-[500px] h-[70vh] bg-[rgba(20,20,20,0.1)] border-[2px] border-[#f8630085] text-gray-800 p-2"
    >
      <div className="flex flex-col flex-grow w-full max-w-xl rounded-lg overflow-hidden">
        <div
          id="messages-list-div"
          className="flex flex-col flex-grow h-0 p-4 overflow-auto"
        ></div>

        <div className="  p-4">
          <input
            id="msg-input"
            className="flex items-center h-10 w-full rounded px-3 bg-[rgba(20,20,20,0.3)] text-white  text-sm"
            type="text"
            placeholder="Type your message…"
          />
          <button
            className="bg-[rgba(20,20,20,0.3)] text-white hover:bg-customorange-700 transition-all duration-300  rounded-lg p-4 py-2 mt-2 w-full"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
