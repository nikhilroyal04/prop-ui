import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import Properties from "../pages/Properties";
import NotFound from "../pages/NotFound";

const Routing = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <Routes>
      {/* Superadmin Routes */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route 
          path="properties" 
          element={
            isAuthenticated ? (
              <Properties />
            ) : (
              <Navigate to="/" state={{ from: location }} replace />
            )
          } 
        />
      </Route>
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Routing;
