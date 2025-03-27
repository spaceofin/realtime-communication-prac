export async function setNickname(socket, nickname) {
  return new Promise((resolve, reject) => {
    socket.on("set nickname", () => {
      const nicknameModal = document.createElement("div");
      nicknameModal.id = "nickname-modal";

      const overlayBg = document.createElement("div");
      overlayBg.classList.add("overlay");
      nicknameModal.appendChild(overlayBg);

      const nicknameForm = document.createElement("div");
      nicknameForm.id = "nickname-form";

      const nicknameLabel = document.createElement("label");
      nicknameLabel.setAttribute("for", "nickname");
      nicknameLabel.innerText = "Enter your Nickname";

      const nicknameInput = document.createElement("input");
      nicknameInput.type = "text";
      nicknameInput.id = "nickname";
      nicknameInput.placeholder = "Nickname";

      nicknameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          nicknameBtn.click();
        }
      });

      const nicknameBtn = document.createElement("button");
      nicknameBtn.innerText = "Set";

      nicknameForm.appendChild(nicknameLabel);
      nicknameForm.appendChild(nicknameInput);
      nicknameForm.appendChild(nicknameBtn);

      nicknameModal.appendChild(nicknameForm);

      document.body.appendChild(nicknameModal);

      document.body.style.overflow = "hidden";

      nicknameBtn.addEventListener("click", () => {
        const enteredNickname = nicknameInput.value.trim();
        if (enteredNickname) {
          resolve(enteredNickname);
          nicknameModal.remove();
          document.body.style.overflow = "";
          document.getElementById("nickname-display").innerText =
            enteredNickname;
          socket
            .timeout(5000)
            .emit("set nickname", enteredNickname, (err, response) => {
              console.log(response.status);
            });

          const username = document.createElement("li");
          username.innerText = enteredNickname;
          username.id = `${enteredNickname}-online`;
          const onlineList = document.getElementById("online-list");
          onlineList.appendChild(username);
        } else {
          alert("Please enter a nickname");
        }
      });
    });
  });
}
