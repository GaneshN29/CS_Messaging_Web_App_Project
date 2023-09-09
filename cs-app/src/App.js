import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import { Routes,Route, BrowserRouter,useParams } from 'react-router-dom';
import Agent from './components/Agent';
import Customer from './components/Customer';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route  path='/' element={<Login/>}/>
      <Route  path='/Agent/:username/:id' element={<Agent/>}/>
      <Route path='/Customer/:username/:id' element={<Customer />} />
      <Route  path='/Login' element={<Login/>}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
