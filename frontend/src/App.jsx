import React from 'react';
import Link from '@mui/material/Link';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Header from './components/Header';
import NavigationMenu from './components/adminMenu'
import CustomerService from './pages/customerservice';
import RentalParking from './pages/ParkingList';
import AdminLogin from './pages/adminlogin';
import AdminDashboard from './pages/admin';
import AdminuserDashboard from './pages/adminuser';
import OrderManagement from './pages/adminorder';
import AdminCustomerService from './pages/adminCustomerService';
import ParkingManagement from './pages/adminparking';
import HistoryOrder from './pages/HistoryOrder';
import CurrentOrder from './pages/CurrentOrder';
import EditSpace from './pages/EditSpace';
import Booking from './pages/Booking';
import Terms from './pages/Terms';
import BookingPage from './pages/payment';
import Listing from './pages/Listing';
import Coupons from './pages/Coupon';
import AdminDataStatistics from './pages/admindata';
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('Authorization');
  if (!token) {
    return (
      <Navigate
        to='/login'
        state={{ from: window.location.pathname }}
        replace
      />
    );
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/auth'
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/auth/user-profile" element={<Profile />} />
          <Route path="/auth/parking-list" element={<RentalParking />} />
          <Route path="/auth/history" element={<HistoryOrder />} />
          <Route path="/auth/user-coupons" element={<Coupons />} />
          <Route path="/auth/user-current-order" element={<CurrentOrder />} />
          <Route path="/auth/edit/parking-space/:id" element={<EditSpace />} />
          <Route path="/auth/booking/parking-space/:id" element={<Booking />} />
          <Route path='/auth/customerservice' element={<CustomerService />} />
        </Route>


        <Route path='/auth/admindashboard' element={<LayoutWithNavigationMenu />}>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path='/auth/adminuser' element={<LayoutWithNavigationMenu />}>
          <Route index element={<AdminuserDashboard />} />
        </Route>
        <Route path='/auth/adminorder' element={<LayoutWithNavigationMenu />}>
          <Route index element={<OrderManagement />} />
        </Route>
        <Route path='/auth/adminhelp' element={<LayoutWithNavigationMenu />}>
          <Route index element={<AdminCustomerService />} />
        </Route>
        <Route path='/auth/adminparking' element={<LayoutWithNavigationMenu />}>
          <Route index element={<ParkingManagement />} />
        </Route>
        <Route path='/auth/admindata' element={<LayoutWithNavigationMenu />}>
          <Route index element={<AdminDataStatistics />} />
        </Route>


        <Route path='/' element={<Layout />}>
          <Route index path='/' element={<Home />} />
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/AdminLogin' element={<AdminLogin />} />
        <Route path='/register' element={<Register />} />
        <Route path='*' element={<NoMatch />} />

        <Route path='/' element={<Layout />}>
          <Route path='listing' element={<Listing />} />
        </Route>

        <Route path='/' element={<Layout />}>
          <Route path='customerservice' element={<CustomerService />} />
        </Route>
        <Route path='/payment' element={<BookingPage />} />
      </Routes>

    </Router>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to='/'>Go to the home page</Link>
      </p>
    </div>
  );
}

function Layout() {
  return (
    <div className='layout'>
      <Header />
      <div className='outlet'>
        <Outlet />
      </div>
    </div>
  );
}

function LayoutWithNavigationMenu() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '256px', height: '100%' }}>
        <NavigationMenu />
      </div>
      <div style={{ flexGrow: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
