import { Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Search from "./screens/Search";
import SongDetail from "./screens/SongDetail";

export default function App() {
  return (
    <div className="mx-auto w-full max-w-page">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/song/:id" element={<SongDetail />} />
      </Routes>
    </div>
  );
}
