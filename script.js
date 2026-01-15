// script.js

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const apiKeyInput = document.getElementById("api-key-input");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add(
    "message",
    sender === "user" ? "user-message" : "ai-message"
  );
  if (sender === "ai") {
    // AI ဖြစ်ရင် Markdown ပုံစံပြောင်းပေးမယ်
    div.innerHTML = marked.parse(text);
  } else {
    div.innerText = text;
  }
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!message) return;
  if (!apiKey) {
    alert("Please enter your Gemini API Key first!");
    return;
  }

  addMessage(message, "user");
  userInput.value = "";

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading";
  loadingDiv.innerText = "Gemini is thinking...";
  chatBox.appendChild(loadingDiv);

  try {
    // FIX: Model နာမည်ကို 'gemini-pro' သို့ ပြောင်းထားပါသည်
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    });

    const data = await response.json();
    chatBox.removeChild(loadingDiv);

    if (data.candidates && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      addMessage(aiResponse, "ai");
    } else {
      console.error("API Error:", data);
      addMessage(
        `Error: ${data.error?.message || "Something went wrong."}`,
        "ai"
      );
    }
  } catch (error) {
    chatBox.removeChild(loadingDiv);
    addMessage("Network Error: " + error.message, "ai");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
