import React, { useEffect, useState } from 'react';
import { scoringCriteria } from './criteria'; // Make sure to import your scoring criteria
import './FitnessTest.css'; // Import your CSS file

// Helper function to convert MM:SS to total seconds
function convertToSeconds(minutes, seconds) {
  return Number(minutes) * 60 + Number(seconds);
}

// Function to calculate points based on performance
function calculateScore(exercise, gender, age, performanceValue) {
  let ageGroup;
  if (age < 25) ageGroup = '<25';
  else if (age >= 25 && age < 30) ageGroup = '25-30';
  else if (age >= 30 && age < 35) ageGroup = '30-35';
  else ageGroup = '35-39';

  const criteria = scoringCriteria.find(
    (criteria) =>
      criteria.exercise === exercise &&
      criteria.gender === gender &&
      criteria.ageGroup === ageGroup &&
      performanceValue >= criteria.minPerformanceValue &&
      performanceValue <= criteria.maxPerformanceValue
  );

  return criteria ? criteria.points : 0;
}

const FitnessTest = () => {
  const [cadets, setCadets] = useState([]);
  const [selectedCadet, setSelectedCadet] = useState('');
  const [pushupScore, setPushupScore] = useState('');
  const [situpScore, setSitupScore] = useState('');
  const [laps, setLaps] = useState([
    { minutes: '', seconds: '' },
    { minutes: '', seconds: '' },
    { minutes: '', seconds: '' },
    { minutes: '', seconds: '' },
    { minutes: '', seconds: '' },
    { minutes: '', seconds: '' }
  ]);
  const [calculatedScores, setCalculatedScores] = useState({});

  useEffect(() => {
    // Fetch cadet data from the backend
    const fetchCadets = async () => {
      const response = await fetch('/api/cadets');
      const data = await response.json();
      setCadets(data);
    };

    fetchCadets();
  }, []);

  // Function to validate input for pushups and situps
  const validatePushupSitup = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0;
  };

  // Validate MM:SS format for laps
  const validateLapTime = (minutes, seconds) => {
    const min = Number(minutes);
    const sec = Number(seconds);
    return (
      Number.isInteger(min) && min >= 0 &&
      Number.isInteger(sec) && sec >= 0 && sec < 60
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate pushups and situps
    if (!validatePushupSitup(pushupScore) || !validatePushupSitup(situpScore)) {
      alert('Please enter valid whole, non-negative numbers for push-ups and sit-ups.');
      return;
    }

    // Validate all lap times
    for (let i = 0; i < laps.length; i++) {
      const { minutes, seconds } = laps[i];
      if (!validateLapTime(minutes, seconds)) {
        alert(`Please enter a valid time in MM:SS format for Lap ${i + 1}.`);
        return;
      }
    }

    // Convert all lap times to total seconds and calculate total run time
    const totalRunTimeSeconds = laps.reduce((total, lap) => {
      return total + convertToSeconds(lap.minutes, lap.seconds);
    }, 0);

    // Submit the scores to the backend
    const response = await fetch(`/api/cadets/${selectedCadet}/scores`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pushupScore,
        situpScore,
        runTime: totalRunTimeSeconds, // Send total run time in seconds
      }),
    });

    if (response.ok) {
      alert('Scores updated successfully!');
      // Optionally, clear the input fields after submission
      setPushupScore('');
      setSitupScore('');
      setLaps(laps.map(() => ({ minutes: '', seconds: '' })));
    } else {
      alert('Error updating scores.');
    }
  };

  const handleCalculate = () => {
    const cadetDetails = cadets.find(cadet => cadet._id === selectedCadet);
    if (cadetDetails) {
      const { gender, age } = cadetDetails;

      const pushupPoints = calculateScore('pushup', gender, age, Number(pushupScore));
      const situpPoints = calculateScore('situp', gender, age, Number(situpScore));

      // Convert all lap times to total run time in seconds
      const totalRunTimeSeconds = laps.reduce((total, lap) => {
        return total + convertToSeconds(lap.minutes, lap.seconds);
      }, 0);

      const runPoints = calculateScore('1.5_mile_run', gender, age, totalRunTimeSeconds);
      const totalScore = pushupPoints + situpPoints + runPoints;

      setCalculatedScores({
        pushupScore: pushupPoints,
        situpScore: situpPoints,
        runScore: runPoints,
        totalScore: totalScore,
      });
    }
  };

  const handleLapChange = (index, field, value) => {
    setLaps(prev => {
      const updatedLaps = [...prev];
      updatedLaps[index] = { ...updatedLaps[index], [field]: value };
      return updatedLaps;
    });
  };

  return (
    <div className="container">
      <h2>Fitness Test Scores</h2>

      {/* Input Section */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="cadet-select">Select Cadet:</label>
        <select
          id="cadet-select"
          value={selectedCadet}
          onChange={(e) => setSelectedCadet(e.target.value)}
          required
        >
          <option value="">Select a cadet</option>
          {cadets.map((cadet) => (
            <option key={cadet._id} value={cadet._id}>
              {cadet.name}
            </option>
          ))}
        </select>

        <label htmlFor="pushup-score">Push-up Score:</label>
        <input
          type="number"
          id="pushup-score"
          value={pushupScore}
          onChange={(e) => setPushupScore(e.target.value)}
          required
        />

        <label htmlFor="situp-score">Sit-up Score:</label>
        <input
          type="number"
          id="situp-score"
          value={situpScore}
          onChange={(e) => setSitupScore(e.target.value)}
          required
        />

        {laps.map((lap, index) => (
          <div key={index}>
            <label>{`Lap ${index + 1} Time (MM:SS):`}</label>
            <div>
              <input
                type="number"
                placeholder="MM"
                value={lap.minutes}
                onChange={(e) => handleLapChange(index, 'minutes', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="SS"
                value={lap.seconds}
                onChange={(e) => handleLapChange(index, 'seconds', e.target.value)}
                required
              />
            </div>
          </div>
        ))}

        <button type="submit">Submit Scores</button>
      </form>

      {/* Calculation Section */}
      <h3>Calculate Scores</h3>
      <button onClick={handleCalculate}>Calculate</button>

      {calculatedScores.totalScore !== undefined && (
        <div className="calculated-scores">
          <p>Push-up Score: {calculatedScores.pushupScore}</p>
          <p>Sit-up Score: {calculatedScores.situpScore}</p>
          <p>1.5-Mile Run Score: {calculatedScores.runScore}</p>
          <p>Total Score: {calculatedScores.totalScore}</p>
        </div>
      )}
    </div>
  );
};

export default FitnessTest;
