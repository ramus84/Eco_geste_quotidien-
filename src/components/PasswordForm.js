import React, { useState } from 'react';

const PasswordForm = () => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Vérification du mot de passe
    if (!passwordRegex.test(newPassword)) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
    } else {
      setErrorMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordRegex.test(password)) {
      setErrorMessage('Veuillez entrer un mot de passe valide.');
    } else {
      console.log('Mot de passe validé et soumis !');
      // Continuer avec l'envoi du formulaire
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Entrez votre mot de passe"
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit">Soumettre</button>
      </form>
    </div>
  );
};

export default PasswordForm;
