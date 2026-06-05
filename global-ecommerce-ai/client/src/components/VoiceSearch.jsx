import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

/**
 * Voice Search Component
 * Global voice search for the main navbar/search bar
 */
const VoiceSearch = ({ onSearch }) => {
  const [isActive, setIsActive] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !listening && isActive) {
      onSearch(transcript);
      setIsActive(false);
    }
  }, [transcript, listening, isActive]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsActive(false);
    } else {
      resetTranscript();
      setIsActive(true);
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-IN",
      });
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={toggleListening}
        title="Voice Search"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          background: listening
            ? "linear-gradient(135deg, #ef4444, #f43f5e)"
            : "linear-gradient(135deg, #3b82f6, #6366f1)",
          color: "#fff",
          boxShadow: listening
            ? "0 0 0 4px rgba(239,68,68,0.3)"
            : "0 2px 8px rgba(59,130,246,0.3)",
          transition: "all 0.3s ease",
          animation: listening ? "pulse-ring 1.5s infinite" : "none",
        }}
      >
        {listening ? "⏹" : "🎤"}
      </button>

      {listening && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: "0",
            background: "#fff",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            minWidth: "200px",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                animation: "blink 1s infinite",
              }}
            />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Listening...</span>
          </div>
          {transcript && (
            <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
              "{transcript}"
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default VoiceSearch;
