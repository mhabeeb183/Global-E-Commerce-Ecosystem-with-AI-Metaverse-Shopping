import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const ChatWidget = () => {
  const navigate = useNavigate();
  const {
  transcript,
  listening,
  resetTranscript,
  browserSupportsSpeechRecognition,
} = useSpeechRecognition();
console.log("Transcript =", transcript);

if (!browserSupportsSpeechRecognition) {
  return (
    <div>
      Browser doesn't support speech recognition.
    </div>
  );
}

  const [open, setOpen] = useState(false);
  const [isListeningForChat, setIsListeningForChat] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 How can I help you shop today?",
    },
  ]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;
        if (open && token) {
          const { data } = await axios.get(
            "http://localhost:5000/api/chatbot/history",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (data.messages && data.messages.length > 0) {
            const formatted = data.messages.map((m) => ({
              sender: m.sender,
              text: m.text,
            }));
            setMessages(formatted);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      }
    };
    fetchHistory();
  }, [open]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);


    try {
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo")
      );

      const { data } = await axios.post(
        "http://localhost:5000/api/chatbot",
        {
          message,
          userId: userInfo?._id || userInfo?.user?._id,
        }
      );

      const botMessage = {
        sender: "bot",
        text:
          data.reply ||
          (data.products?.length > 0
            ? `Found ${data.products.length} products`
            : "No products found"),
        products: data.products || [],
        type: data.type || null,
        recommendation:
          data.recommendation || null,
      };

      setMessages((prev) => [
        ...prev,
        botMessage,
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Something went wrong",
        },
      ]);
    }

    setMessage("");
  };
  const startVoiceSearch = () => {
    resetTranscript();
    setMessage("");
    setIsListeningForChat(true);

    SpeechRecognition.startListening({
      continuous: false,
      language: "en-US",
    });

    setTimeout(() => {
      SpeechRecognition.stopListening();
    }, 5000);
  };

  useEffect(() => {
    if (
      !listening &&
      transcript &&
      transcript.trim() &&
      isListeningForChat
    ) {
      setMessage(transcript);
      setIsListeningForChat(false);
    }
  }, [transcript, listening, isListeningForChat]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg z-50 hover:bg-blue-700 transition"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-zinc-200">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h2 className="font-bold text-lg">
              AI Shopping Assistant
            </h2>

            <button
              onClick={() => setOpen(false)}
              className="text-xl"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index}>
                <div
                  className={`p-3 rounded-xl max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-blue-100 ml-auto"
                      : "bg-white border"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Comparison Card */}
                {msg.type === "comparison" &&
                  msg.products?.length >= 2 && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mt-3">
                      <h3 className="font-bold text-lg mb-3">
                        📊 Comparison Result
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <strong>
                            {msg.products[0].name}
                          </strong>
                          <br />
                          Price: ₹
                          {msg.products[0].price}
                          <br />
                          Brand:{" "}
                          {msg.products[0].brand}
                        </div>

                        <div className="text-center font-bold text-lg">
                          VS
                        </div>

                        <div>
                          <strong>
                            {msg.products[1].name}
                          </strong>
                          <br />
                          Price: ₹
                          {msg.products[1].price}
                          <br />
                          Brand:{" "}
                          {msg.products[1].brand}
                        </div>

                        <div className="mt-3 p-3 bg-green-100 rounded-lg">
                          🏆 Recommended:
                          <strong>
                            {" "}
                            {msg.recommendation}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Product Cards */}
                {msg.products?.map((product) => (
                  <div
                    key={product._id}
                    className="mt-3 bg-white border rounded-xl shadow-sm overflow-hidden"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    )}

                    <div className="p-3">
                      <h3 className="font-bold text-lg">
                        {product.name}
                      </h3>

                      <p className="text-green-600 font-bold text-lg">
                        ₹
                        {product.dynamicPrice ||
                          product.price}
                      </p>

                      <p className="text-gray-500">
                        {product.brand}
                      </p>

                      {product.rating && (
                        <p className="text-yellow-500">
                          ⭐ {product.rating}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          navigate(
                            `/product/${product._id}`
                          )
                        }
                        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white">

  {listening && (
    <p className="text-red-500 text-sm mb-2">
      🎤 Listening...
    </p>
  )}

  <div className="flex gap-2">
    <p className="text-xs text-blue-500">
  Transcript: {transcript}
</p>
    <input
      type="text"
      value={message}
      onChange={(e) =>
        setMessage(e.target.value)
      }
      placeholder="Ask me anything..."
      className="flex-1 border rounded-lg px-3 py-2 outline-none"
      onKeyDown={(e) =>
        e.key === "Enter" &&
        sendMessage()
      }
    />

  <button
    onClick={() => {
      if (!listening) {
        startVoiceSearch();
      } else {
        SpeechRecognition.stopListening();
      }
    }}
  className={`px-3 rounded-lg ${
    listening
      ? "bg-red-500"
      : "bg-green-500"
  } text-white`}
>
  {listening ? "🛑" : "🎤"}
</button>

    <button
      onClick={sendMessage}
      className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700"
    >
         Send
    </button>
  </div>

</div>
</div>
)}
</>
);
};

export default ChatWidget;