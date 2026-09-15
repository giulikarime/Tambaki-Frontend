import './App.css';
import Login from './pages/FirstAccess/Login';
import Home from './pages/Home/Home';
import Financial from './pages/Financial/Financial';
import Menu from './pages/Menu/Menu';
import Stock from './pages/Stock/Stock';
import UsersPage from './pages/UsersPage/UsersPage';
import Perfil from './pages/Perfil/Perfil';
import Configuration from './pages/Configuration/Configuration';
import OrderTicket from './pages/Ticket/OrderTicket/OrderTicket';
import { Navigate, Routes, Route } from 'react-router-dom'
import OpenAllTickets from './pages/Ticket/OpenAllTickets/OpenAllTickets';
import BookTable from './pages/Ticket/BookTable/BookTable';
import Tables from './pages/Tables/Tables';
import MenuOrdering from './pages/MenuOrdering/MenuOrdering';
import PasswordRecovery from './pages/FirstAccess/PasswordRecovery';
import Suppliers from './pages/Suppliers/Suppliers';


function App() {

  return (
    <Routes>
      <Route path='/' element={<Login />}></Route>
      <Route path='/recovery' element={<PasswordRecovery />}></Route>
      <Route path='/home' element={<Home />}></Route>
      <Route path='/dashboard' element={<Financial />}></Route>
      <Route path='/menu' element={<Menu />}></Route>
      <Route path='/stock' element={<Stock />}></Route>
      <Route path='/users' element={<UsersPage />}></Route>
      <Route path='/perfil' element={<Perfil />}></Route>
      <Route path='/configuration' element={<Configuration />}></Route>
      <Route path='/order_ticket' element={<OrderTicket />}></Route>
      <Route path='/open_all_tickets' element={<OpenAllTickets />}></Route>
      <Route path='/book_table' element={<BookTable />}></Route>
      <Route path='/create_table' element={<Tables />}></Route>
      <Route path='/menu_ordering' element={<MenuOrdering />}></Route>
      <Route path='/suppliers' element={<Suppliers />}></Route>
    </Routes>
  );
}

export default App;
