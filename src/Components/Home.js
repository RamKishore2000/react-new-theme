import React from 'react';
import Header from './Common/Header';
import Footer from './Common/Footer';
import Banner from './Banner';
import Categories from './Categories';
import ProductsCarousel from './ProductsCarousel';

const Home = () => {
  return (
    <>
      <Header />
      <main className="flex-grow-1">
        <Banner />
        <Categories />
        <ProductsCarousel />
        <div className="container py-5">
          <h1 className="fw-bold mb-3">Welcome to NovaRoute</h1>
          <p className="text-secondary">
            Swap in your own copy and routes. The header now includes product and services dropdowns,
            quick profile access, and a cart badge to get you started.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
};
export default Home;
