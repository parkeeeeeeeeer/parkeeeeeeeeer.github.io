import React, { useState } from 'react';
import {scoringCriteria} from './pfaCriteria';
import './FitnessTest.css'; // Import your CSS file

// Sample scoring criteria
// const scoringCriteria = [
//   { exercise: 'pushup', gender: 'female', ageGroup: '<25', minPerformanceValue: 47, maxPerformanceValue: 47, points: 20 },
//   { exercise: 'pushup', gender: 'male', ageGroup: '<25', minPerformanceValue: 55, maxPerformanceValue: 55, points: 20 },
//   { exercise: 'situp', gender: 'female', ageGroup: '<25', minPerformanceValue: 50, maxPerformanceValue: 50, points: 20 },
//   { exercise: 'situp', gender: 'male', ageGroup: '<25', minPerformanceValue: 60, maxPerformanceValue: 60, points: 20 },
//   { exercise: '1.5_mile_run', gender: 'female', ageGroup: '<25', minPerformanceValue: 600, maxPerformanceValue: 650, points: 50 },
//   { exercise: '1.5_mile_run', gender: 'male', ageGroup: '<25', minPerformanceValue: 540, maxPerformanceValue: 600, points: 50 },
// ];

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
  const [age, setAge] = useState(36);
  const [gender, setGender] = useState('female');
  const [pushupPerformance, setPushupPerformance] = useState(47);
  const [situpPerformance, setSitupPerformance] = useState(50);
  const [runTime, setRunTime] = useState(620);

  const pushupScore = calculateScore('pushup', gender, age, pushupPerformance);
  const situpScore = calculateScore('situp', gender, age, situpPerformance);
  const runScore = calculateScore('1.5_mile_run', gender, age, runTime);
  const totalScore = pushupScore + situpScore + runScore;

  return (
    <div>
      <h2>Fitness Test Scores</h2>
      <p>Push-up Score: {pushupScore}</p>
      <p>Sit-up Score: {situpScore}</p>
      <p>1.5-Mile Run Score: {runScore}</p>
      <p>Total Score: {totalScore}</p>
    </div>
  );
};

export default FitnessTest;
