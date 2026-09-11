import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Search from './pages/Search';
import Category from './pages/Category';
import Drops from './pages/Drops';
import Product from './pages/Product';
import Order from './pages/Order';
import Brands from './pages/Brands';
import About from './pages/About';
import Consign from './pages/Consign';
import Sourcing from './pages/Sourcing';
import Consultation from './pages/Consultation';
import Disclaimer from './pages/Disclaimer';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:cat" element={<Category />} />
        <Route path="/drops" element={<Drops />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/order" element={<Order />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/about" element={<About />} />
        <Route path="/consign" element={<Consign />} />
        <Route path="/sourcing" element={<Sourcing />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
      </Route>
    </Routes>
  );
}
