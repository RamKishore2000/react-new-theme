import React from 'react';
import Header from './Common/Header';
import Footer from './Common/Footer';
import Banner from './Banner';
import Categories from './Categories';
import ProductsCarousel from './ProductsCarousel';
import BusinessDescription from './BusinessDescription';
import ServiceCategories from './ServiceCategories';
import TrendingServices from './TrendingServices';
import Catalogues from './Catalogues';

const Home = () => {
  return (
    <>
      <Header />
      <main className="flex-grow-1">
        <div className="page-shell">
          <Banner />
          <Categories />
          <BusinessDescription />
          
          <ProductsCarousel />
          <ServiceCategories />
          <TrendingServices />
          <Catalogues />
        </div>
      </main>
      <Footer />
    </>
  )
};
export default Home;
