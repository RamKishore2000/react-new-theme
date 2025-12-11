
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Products from "./Components/Products";



function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
        </Routes>
    
      </div>
    </BrowserRouter>
  );
}
export default App;
