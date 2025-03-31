import React from "react";
import "./loader.css";
const Loader1 = () => {
  return (
    <main className="w-full h-[calc(100vh-170px)] flex justify-center items-center">
      <div className="flex justify-center items-center w-full h-full">
        <section className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </section>
      </div>
    </main>
  );
};

export default Loader1;
