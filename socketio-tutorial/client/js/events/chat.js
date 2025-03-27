export async function sendMessage(socket, messages, nickname, counter) {
  const messageForm = document.getElementById("message-form");
  const input = document.getElementById("message-input");

  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (input.value) {
      const selectedOption = document.getElementById("chat-user-select");
      if (selectedOption.value !== "all") {
        socket.emit(
          "chat message private",
          input.value,
          nickname,
          selectedOption.value
        );

        const selectedUser =
          selectedOption.options[selectedOption.selectedIndex];

        const item = document.createElement("li");
        item.style.backgroundColor = "#D6FB84";

        const name = document.createElement("span");
        name.textContent = nickname;
        name.id = "nickname-chat-display-private";
        item.appendChild(name);

        const receiverName = document.createElement("span");
        receiverName.textContent = selectedUser.textContent;
        receiverName.id = "nickname-chat-display-private";
        item.appendChild(receiverName);

        const message = document.createElement("span");
        message.textContent = input.value;
        item.appendChild(message);
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
        input.value = "";
      } else {
        // compute a unique offset
        const clientOffset = `${socket.id}-${counter.value++}`;
        socket.emit(
          "chat message",
          input.value,
          clientOffset,
          (err, response) => {
            console.log(response.status);
          }
        );
        const item = document.createElement("li");
        const name = document.createElement("span");
        name.textContent = nickname;
        name.id = "nickname-chat-display";
        item.appendChild(name);
        const message = document.createElement("span");
        message.textContent = input.value;
        item.appendChild(message);
        socket.auth.serverOffset += 1;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
        input.value = "";
      }
    }
  });
}

export function chatMessage(socket, messages) {
  socket.on("chat message", (msg, serverOffset, nicknameData) => {
    console.log(msg);
    const item = document.createElement("li");

    if (serverOffset === null) {
      item.textContent = msg;
      item.style.backgroundColor = "#FFD89B";
    } else {
      const name = document.createElement("span");
      name.textContent = nicknameData || nickname;
      name.id = "nickname-chat-display";

      item.appendChild(name);

      const message = document.createElement("span");
      message.textContent = msg;
      item.appendChild(message);
      socket.auth.serverOffset = serverOffset;
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
}

export function chatMessagePrivate(socket, messages) {
  socket.on("chat message private", (msg, senderNickname) => {
    console.log("senderNickname:", senderNickname);

    const item = document.createElement("li");
    item.style.backgroundColor = "#D6FB84";

    const name = document.createElement("span");
    name.textContent = senderNickname;
    name.id = "nickname-chat-display-private";
    item.appendChild(name);

    const receiverName = document.createElement("span");
    receiverName.textContent = nickname;
    receiverName.id = "nickname-chat-display-private";
    item.appendChild(receiverName);

    const message = document.createElement("span");
    message.textContent = msg;
    item.appendChild(message);
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    input.value = "";
  });
}

// export function handleSelectChatUser() {
//   const chatUserSelect = document.getElementById("chat-user-select");
//   chatUserSelect.addEventListener("change", (e) => {
//     const selectedValue = e.targer.value;
//   });
// }
