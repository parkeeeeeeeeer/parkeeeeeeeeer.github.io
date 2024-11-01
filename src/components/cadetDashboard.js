// src/components/Dashboard.js

import React from 'react';
import Profile from './profile';  // Importing Profile component
import PerformanceCharts from './PerformanceCharts';  // Importing other components
import Sidebar from './Sidebar';  // Navigation sidebar component

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <Profile />               {/* Profile component */}
        <PerformanceCharts />      {/* Performance Charts component */}
        {/* You can add more components here as needed */}
      </div>
    </div>
  );
};

export default Dashboard;
