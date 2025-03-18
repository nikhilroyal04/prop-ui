import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import Properties from "../pages/Properties";

const Routing = () => {
  return (
    <Routes>
      {/* Superadmin Routes */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="properties" element={<Properties />} />
      </Route>
    </Routes>
  );
};

export default Routing;
