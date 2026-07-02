import { Routes, Route } from "react-router-dom";
import Home from "./screens/Home";

export default function App() {
  return (
    <div className="mx-auto w-full max-w-page">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
