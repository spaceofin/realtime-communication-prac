export function onTyping(socket, messages) {
  socket.on("typing", (user) => {
    const typingItem = document.getElementById(user);
    if (!typingItem) {
      const typingStatusItem = document.createElement("li");
      typingStatusItem.style.backgroundColor = "#FFF1A2";
      typingStatusItem.textContent = `${user} is typing...`;
      typingStatusItem.id = user;
      messages.appendChild(typingStatusItem);
    }
  });
}

export function endTyping(socket) {
  socket.on("typing end", (user) => {
    const typingItem = document.getElementById(user);
    typingItem.remove();
  });
}

export function handleTyping(socket, nickname) {
  let isTyping = false;
  let typingTimeout;

  const input = document.getElementById("message-input");

  input.addEventListener("input", (e) => {
    if (!isTyping) {
      isTyping = true;
      socket.emit("typing", nickname);
    }

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      isTyping = false;
      socket.emit("typing end", nickname);
    }, 500);
  });
}
