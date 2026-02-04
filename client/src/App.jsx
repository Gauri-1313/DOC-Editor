import { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [text, setText] = useState("");

  useEffect(() => {
    socket.emit("get-document", "codtech");

    socket.on("load-document", (data) => {
      setText(data || "");
    });

    socket.on("receive-changes", (data) => {
      setText(data || "");
    });

    return () => {
      socket.off("load-document");
      socket.off("receive-changes");
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    socket.emit("send-changes", value);
    socket.emit("save-document", value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Real-Time Collaborative Editor</h2>
      <textarea
        rows="12"
        cols="80"
        value={text}
        onChange={handleChange}
      />
    </div>
  );
}

export default App;
