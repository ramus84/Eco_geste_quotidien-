import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ChartComponent = ({ gestures }) => {
  // Regrouper les économies de CO2 par catégorie
  const dataByCategory = gestures.reduce((acc, g) => {
    const cat = g.category || 'Autre';
    acc[cat] = (acc[cat] || 0) + (g.co2Saved || 0);
    return acc;
  }, {});

  const data = {
    labels: Object.keys(dataByCategory),
    datasets: [
      {
        label: 'CO₂ économisé (kg) par catégorie',
        data: Object.values(dataByCategory),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <Bar data={data} />
    </div>
  );
};

export default ChartComponent;
