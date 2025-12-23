import { testBackend } from "./api";
import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    testBackend()
      .then((res) => setMsg(res.message))
      .catch((err) => setMsg(err.message));
  }, []);

  return (
    <div>
      <h1>React + Django</h1>
      <p>{msg}</p>
    </div>
  );
}

export default App;

