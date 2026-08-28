import './App.css';
import Login from './pages/FirstAccess/login';
import Home from './pages/Home/Home';
import Financial from './pages/Financial/Financial';
import Menu from './pages/Menu/Menu';
import Stock from './pages/Stock/Stock';
import UserPage from './pages/UsersPage/UserPage';
import Perfil from './pages/Perfil/Perfil';
import Configuration from './pages/Configuration/Configuration';
import OrderTicket from './pages/Ticket/OrderTicket/OrderTicket';
import { Navigate, Routes, Route } from 'react-router-dom'
import OpenAllTickets from './pages/Ticket/OpenAllTickets/OpenAllTickets';
import BookTable from './pages/Ticket/BookTable/BookTable';
import Tables from './pages/Tables/Tables';

function hasValidAccessToken() {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function ProtectedRoute({ page }) {
  return hasValidAccessToken() ? page : <Navigate to="/" replace />;
}

function App() {

  return (
    <main>
      <Routes>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/dashboard' element={<ProtectedRoute><Home /></ProtectedRoute>}></Route>
        <Route path='/financial' element={<ProtectedRoute><Financial /></ProtectedRoute>}></Route>
        <Route path='/menu' element={<ProtectedRoute><Menu /></ProtectedRoute>}></Route>
        <Route path='/stock' element={<ProtectedRoute><Stock /></ProtectedRoute>}></Route>
        <Route path='/users' element={<ProtectedRoute><UserPage /></ProtectedRoute>}></Route>
        <Route path='/perfil' element={<ProtectedRoute><Perfil /></ProtectedRoute>}></Route>
        <Route path='/configuration' element={<ProtectedRoute><Configuration /></ProtectedRoute>}></Route>
        <Route path='/order_ticket' element={<ProtectedRoute><OrderTicket /></ProtectedRoute>}></Route>
        <Route path='/open_all_tickets' element={<ProtectedRoute><OpenAllTickets /></ProtectedRoute>}></Route>
        <Route path='/book_table' element={<ProtectedRoute><BookTable /></ProtectedRoute>}></Route>
        <Route path='/create_table' element={<ProtectedRoute><Tables /></ProtectedRoute>}></Route>
      </Routes>
    </main>
  );
}

export default App;
