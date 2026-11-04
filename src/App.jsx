import { Navigate, Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:slug" element={<PropertyDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
