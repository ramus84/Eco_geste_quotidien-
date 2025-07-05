import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Composant pour protéger les routes
const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem('token'); // Vérifier si le token est présent

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? ( // Si le token existe, afficher la page
          <Component {...props} />
        ) : ( // Sinon, rediriger vers la page de connexion
          <Navigate to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
