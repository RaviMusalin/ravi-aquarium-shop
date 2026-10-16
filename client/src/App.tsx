import { Link, Route, Routes } from "react-router-dom";
import { useCart } from "./context/CartContext";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import { formatPrice } from "./format";

export default function App() {
  const { itemCount, totalCents } = useCart();

  return (
    <>
      <header className="site-header">
        <Link to="/">
          <h1>Ravi's Aquarium Shop</h1>
        </Link>
        <Link to="/cart">Cart ({itemCount}) · {formatPrice(totalCents)}</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
    </>
  );
}