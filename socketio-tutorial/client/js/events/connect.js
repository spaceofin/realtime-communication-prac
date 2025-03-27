export function connect(socket) {
  socket.on("connect", () => {
    console.log("recovered?", socket.recovered);
  });
}

export function handleConnectionToggle(socket) {
  const toggleButton = document.getElementById("connection-toggle-btn");

  toggleButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (socket.connected) {
      toggleButton.innerText = "Connect";
      // if (socket.io.engine) {
      //   socket.io.engine.close();
      // }
      const username = document.getElementById(`${nickname}-online`);
      username.remove();
      const onlineList = document.getElementById("online-list");
      onlineList.innerHTML = "";

      const userSelect = document.getElementById("chat-user-select");
      for (let i = userSelect.options.length - 1; i >= 0; i--) {
        const option = userSelect.options[i];
        if (option.id !== "chat-user-all") {
          userSelect.remove(i);
        }
      }
      socket.disconnect();
    } else {
      toggleButton.innerText = "Disconnect";
      socket.connect();
    }
  });
}

export function setOnline(socket, nickname) {
  socket.on("set online", (newUserNickname, newUserSocketID) => {
    console.log("setonline received:", nickname);

    if (!nickname) return;

    console.log("set online");
    const username = document.createElement("li");
    username.innerText = newUserNickname;
    username.id = `${newUserNickname}-online`;
    const onlineList = document.getElementById("online-list");
    onlineList.appendChild(username);
    // console.log("new user's socketId:", newUserSocketID);
    socket.emit("set online list", newUserSocketID);

    const userOption = document.createElement("option");
    userOption.innerText = newUserNickname;
    userOption.id = `chat-user-${newUserNickname}`;
    userOption.value = newUserSocketID;
    const userSelect = document.getElementById("chat-user-select");
    userSelect.appendChild(userOption);
  });
}

export function setOffline(socket) {
  socket.on("set offline", (nickname) => {
    // console.log("set offline:", nickname);
    const username = document.getElementById(`${nickname}-online`);
    if (username) username.remove();

    const userOption = document.getElementById(`chat-user-${nickname}`);
    if (userOption) userOption.remove();
  });

  socket.on("set online list", (nickname, userSocketID) => {
    // console.log(`set online list:`, nickname);
    const username = document.createElement("li");
    username.innerText = nickname;
    username.id = `${nickname}-online`;
    const onlineList = document.getElementById("online-list");
    onlineList.appendChild(username);

    const userOption = document.createElement("option");
    userOption.innerText = nickname;
    userOption.id = `chat-user-${nickname}`;
    userOption.value = userSocketID;
    const userSelect = document.getElementById("chat-user-select");
    userSelect.appendChild(userOption);
  });
}
