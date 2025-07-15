import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './Components/Navbar'; // Sidebar
import Login from './Pages/Login';
import Register from './Pages/Register';
import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import BillForm from './Components/BillForm';
import AdminPanel from './Pages/AdminPanel';
import TotalBills from './Pages/TotalBills';
import PendingBills from './Pages/PendingBills';
import MyProfile from './Pages/MyProfile';
import PaidBills from './Pages/PaidBills';
import UnpaidBills from './Pages/UnpaidBills';
import TotalCustomers from './Pages/TotalCustomers';
import ViewBill from './Pages/ViewBill';
import TotalEditors from './Pages/TotalEditors';
import EditorCustomers from './Pages/EditorCustomers';
import EditorSales from './Pages/EditorSales';
import TotalSales from './Pages/TotalSales';
import EditorBills from './Pages/EditorBills';
import BillRatio from './Pages/BillRatio';
import CustomerDetails from './Pages/CustomerDetails';
import EditorCustomerDetails from './Pages/EditorCustomerDetails';
import AddItems from './Pages/AddItems';
import ViewProducts from './Pages/ViewProducts';
import AgentsDetails from './Pages/AgentsDetails';
import AgentFullDetails from './Pages/AgentFullDetails';
import VendorDetails from './Pages/VendorDetails';
import ViewBillWithAgent from './Pages/ViewBillWithAgent';
import Return from './Pages/Return'; // ✅ Corrected import
import Exchange from './Pages/Exchange'; // ✅ Corrected import
import Request from './Pages/Request'; // ✅ Corrected import
import ExchangedProductBill from "./Pages/ExchangedProductBill";
import ExchangedBills from "./Pages/ExchangedBills";
import Notification from "./Pages/Notification";
import RedirectToBill from "./Pages/RedirectToBill";
import ReturnProductBill from "./Pages/ReturnProductBill";
import UserDetails from './Pages/UserDetails';
import AgentBill from './Pages/AgentBill';
import CustomerRegister from './Pages/CustomerRegister';
import CustomerDashboard from './Pages/CustomerDashboard';
import AgentDashboard from './Pages/AgentDashboard';
import VendorDashboard from './Pages/VendorDashboard';
import AllCustomers from './Pages/AllCustomers';
import AllAgents from './Pages/AllAgents';
import AllVendors from './Pages/AllVendors'; 
import VendorFullDetails from './Pages/VendorFullDetails';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userType, setUserType] = useState(localStorage.getItem('userType') || '');

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (userType) localStorage.setItem('userType', userType);
    else localStorage.removeItem('userType');
  }, [token, userType]);

  const isAuthenticated = Boolean(token);
  const isAdmin = userType.toLowerCase() === 'admin';
  const isEditor = userType.toLowerCase() === 'editor';
  const isCustomer = userType.toLowerCase() === 'customer';
  const isAgent = userType.toLowerCase() === 'agent';
  const isVendor = userType.toLowerCase() === 'vendor';

  return (
    <div className="flex">
      {/* Sidebar */}
      {isAuthenticated && (
        <Navbar
          token={token}
          userType={userType}
          setToken={setToken}
          setUserType={setUserType}
        />
      )}

      {/* Main Content */}
      <div className={isAuthenticated ? "w-full md:ml-64" : "w-full"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login setToken={setToken} setUserType={setUserType} />
              ) : isAdmin ? (
                <Navigate to="/admin-panel" replace />
              ) : isEditor ? (
                <Navigate to="/dashboard" replace />
              ) : isCustomer ? (
                <Navigate to="/customer-dashboard" replace />
              ) : isAgent ? (
                <Navigate to="/agent-dashboard" replace />
              ) : isVendor ? (
                <Navigate to="/vendor-dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/register" element={<Register />} /> {/* ✅ Move this outside the isAuthenticated block */}

          {/* Authenticated Routes */}
          {isAuthenticated ? (
            <>
              {/* Admin-only Routes */}
              {isAdmin && (
                <>
                  <Route path="/admin-panel" element={<AdminPanel />} />
                  <Route path="/bill-form" element={<BillForm />} />
                  <Route path="/total-bills" element={<TotalBills />} />
                  <Route path="/total-customers" element={<TotalCustomers />} />
                  <Route path="/total-editors" element={<TotalEditors />} />
                  <Route path="/total-sales" element={<TotalSales />} />
                  <Route path="/customer-details/:name" element={<CustomerDetails />} />
                  <Route path="/bill-ratio" element={<BillRatio />} />
                  <Route path="/requests" element={<Request />} />
                  <Route path="/vendors" element={<VendorDetails token={token} userType={userType} />} />
                  <Route path="/user-details" element={<UserDetails />} />
                  <Route path="/all-customers" element={<AllCustomers />} />
                  <Route path="/all-agents" element={<AllAgents />} />
                  <Route path="/all-vendors" element={<AllVendors />} />
                </>
              )}

              {/* Editor-only Routes */}
              {isEditor && (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/editor/customers" element={<EditorCustomers />} />
                  <Route path="/editor/sales" element={<EditorSales />} />
                  <Route path="/editor-bills" element={<EditorBills />} />
                  <Route path="/editor-customer/:name" element={<EditorCustomerDetails />} />
                  <Route path="/vendors" element={<VendorDetails token={token} userType={userType} />} />
                </>
              )}

              {/* ✅ Customer / Agent / Vendor Dashboards */}
              {isCustomer && <Route path="/customer-dashboard" element={<CustomerDashboard />} />}
              {isAgent && <Route path="/agent-dashboard" element={<AgentDashboard />} />}
              {isVendor && <Route path="/vendor-dashboard" element={<VendorDashboard />} />}
              
              {/* Shared Routes */}
              <Route path="/pending-bills" element={<PendingBills />} />
              <Route path="/bill-form" element={<BillForm />} />
              <Route path="/paid-bills" element={<PaidBills />} />
              <Route path="/unpaid-bills" element={<UnpaidBills />} />
              <Route path="/bill/:id" element={<ViewBill />} />
              <Route path="/myprofile" element={<MyProfile />} />
              <Route path="/add-items" element={<AddItems />} />
              <Route path="/view-products" element={<ViewProducts />} />
              <Route path="/agents" element={<AgentsDetails />} />
              <Route path="/agent-full-details/:name" element={<AgentFullDetails />} />
              <Route path="/bill-with-agent/:id" element={<ViewBillWithAgent />} />
              <Route path="/exchanged-bill/:id" element={<ExchangedProductBill />} />
              <Route path="/exchanged-bills" element={<ExchangedBills />} />
              <Route path="/notifications" element={<Notification />} />
              <Route path="/view-bill-by-number/:billNumber" element={<RedirectToBill />} />
              <Route path="/return-product-bill/:id" element={<ReturnProductBill />} />
              <Route path="/return/:id" element={<Return />} />
              <Route path="/exchange/:id" element={<Exchange />} />
              <Route path="/agent-bill/:id" element={<AgentBill />} />
              <Route path="/register-customer" element={<CustomerRegister />} />
              <Route path="/vendor-details-view" element={<VendorFullDetails />} />

              {/* 404 for authenticated users */}
              <Route path="*" element={<div className="p-8 text-center text-2xl">404 - Page Not Found</div>} />
            </>
          ) : (
            // Redirect to login if unauthenticated
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
