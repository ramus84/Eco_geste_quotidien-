import React from 'react';
import Chart from '../components/Chart';
import { useState, useEffect } from 'react';
import axios from 'axios';

const About = () => {
  // Exemple d'affichage du graphique sur la page À propos
  const [gestures, setGestures] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:5000/api/gestures')
      .then(res => setGestures(res.data));
  }, []);

  return (
    <div className="container py-4">
      <h2>À propos</h2>
      <p>
        Ce site a été créé pour encourager les gestes éco-responsables au quotidien.<br />
        Il permet d'ajouter, de suivre et de visualiser l'impact de vos actions pour la planète.<br />
        Vous pouvez consulter vos statistiques, exporter vos données, et bien plus encore !
      </p>
      <Chart gestures={gestures} />
    </div>
  );
};

export default About; 