// Importing logo and CSS
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom'; // On retire BrowserRouter ici
import { Container } from 'react-bootstrap';
import { useEffect, useState } from 'react'; // Import du hook pour exécuter du code au chargement
import { testConnection } from './axiosConfig'; // Import de la fonction de test de connexion
import React from 'react';

// Importing pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import GestureDetail from './pages/GestureDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Legal from './pages/Legal';
import Tips from './pages/Tips';
import NotFound from './pages/NotFound';
import EcoGestesMaison from './pages/EcoGestesMaison';
import EcoGestesTransport from './pages/EcoGestesTransport';
import EcoGestesAlimentation from './pages/EcoGestesAlimentation';
import EcoGestesTravail from './pages/EcoGestesTravail';
import EcoGestesPDF from './pages/EcoGestesPDF';
import EcoGestesEau from './pages/EcoGestesEau';
import EcoGestesEnergie from './pages/EcoGestesEnergie';
import EcoGestesZeroDechet from './pages/EcoGestesZeroDechet';
import BlogEco from './pages/BlogEco';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Achievements from './pages/Achievements';
import CarbonCalculator from './pages/CarbonCalculator';
import Statistics from './pages/Statistics';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import CarbonCalculatorPage from './pages/CarbonCalculator';
// Importing components
import NavigationBar from './components/Navbar';
// import UserDashboard from './pages/UserDashboard';
import Footer from './components/Footer'; // Importer le composant Footer
import NotificationComponent from './components/NotificationComponent';
import PasswordForm from './components/PasswordForm';
import UserDashboard from './components/UserDashboard';
import AddGestureForm from './components/AddGestureForm';
import GestureList from './components/GestureList';

// Loader animé simple
const Loader = () => (
  <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(255,255,255,0.7)',zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div className="spinner" style={{border:'8px solid #f3f3f3',borderTop:'8px solid #4caf50',borderRadius:'50%',width:60,height:60,animation:'spin 1s linear infinite'}}></div>
    <style>{`@keyframes spin {0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}}`}</style>
  </div>
);

export const NotificationContext = React.createContext();
export const LoaderContext = React.createContext();

function App() {
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [showLoader, setShowLoader] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };
  const closeNotification = () => setNotification({ ...notification, message: '' });

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <LoaderContext.Provider value={{ showLoader, setShowLoader }}>
      <NavigationBar /> {/* Affichage de la barre de navigation */}
      <Container fluid className="main-content">
      {/* Routes doit contenir toutes les routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gestures/:id" element={<GestureDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="/notifications" element={<NotificationComponent />} />
        <Route path="/password" element={<PasswordForm />} />
        <Route path="/private-test" element={<PrivateRoute component={Dashboard} />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/gestes-maison" element={<EcoGestesMaison />} />
        <Route path="/gestes-transport" element={<EcoGestesTransport />} />
        <Route path="/gestes-alimentation" element={<EcoGestesAlimentation />} />
        <Route path="/gestes-travail" element={<EcoGestesTravail />} />
        <Route path="/gestes-pdf" element={<EcoGestesPDF />} />
        <Route path="/gestes-eau" element={<EcoGestesEau />} />
        <Route path="/gestes-energie" element={<EcoGestesEnergie />} />
        <Route path="/gestes-zero-dechet" element={<EcoGestesZeroDechet />} />
        <Route path="/blog" element={<BlogEco />} />
        <Route path="/support" element={<Support />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/carbon-calculator" element={<CarbonCalculator />} />
        <Route path="/calculateur-carbone" element={<CarbonCalculatorPage />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Container>
      <Footer /> {/* Affichage du pied de page */}
        <NotificationComponent message={notification.message} type={notification.type} onClose={closeNotification} />
        {showLoader && <Loader />}
        {/* Formulaire pour ajouter un geste */}
        {/* <AddGestureForm /> */}
        {/* Liste des gestes enregistrés */}
        {/* <GestureList /> */}
      </LoaderContext.Provider>
    </NotificationContext.Provider>
  );
}

export default App;
