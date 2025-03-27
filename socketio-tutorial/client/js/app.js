import { chatMessage, chatMessagePrivate, sendMessage } from "./events/chat.js";
import {
  connect,
  handleConnectionToggle,
  setOffline,
  setOnline,
} from "./events/connect.js";
import { setNickname } from "./events/nickname.js";
import { endTyping, handleTyping, onTyping } from "./events/typing.js";

const counter = { value: 0 };
let nickname = "";
const socket = io({
  ackTimeout: 10000,
  retries: 3,
  auth: {
    serverOffset: 0,
  },
});

connect(socket);
handleConnectionToggle(socket);

const messages = document.getElementById("messages");

onTyping(socket, messages);
endTyping(socket);

chatMessage(socket, messages);
chatMessagePrivate(socket, messages);

nickname = await setNickname(socket);

setOnline(socket, nickname);
setOffline(socket);

handleTyping(socket, nickname);

sendMessage(socket, messages, nickname, counter);
