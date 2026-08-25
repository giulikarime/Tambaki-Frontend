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
import {Routes,Route} from 'react-router-dom'
import OpenAllTickets from './pages/Ticket/OpenAllTickets/OpenAllTickets';
import BookTable from './pages/Ticket/BookTable/BookTable';
import Tables from './pages/Tables/Tables';

function App() {

  return (
    <main>
      <Routes>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/dashboard' element={<Home/>}></Route>
        <Route path='/financial' element={<Financial/>}></Route>
        <Route path='/menu' element={<Menu/>}></Route>
        <Route path='/stock' element={<Stock/>}></Route>
        <Route path='/users' element={<UserPage/>}></Route>
        <Route path='/perfil' element={<Perfil/>}></Route>
        <Route path='/configuration' element={<Configuration/>}></Route>
        <Route path='/order_ticket' element={<OrderTicket/>}></Route>
        <Route path='/open_all_tickets' element={<OpenAllTickets/>}></Route>
        <Route path='/book_table' element={<BookTable/>}></Route>
        <Route path='/create_table' element={<Tables/>}></Route>
      </Routes>
    </main>
  );
}

export default App;
