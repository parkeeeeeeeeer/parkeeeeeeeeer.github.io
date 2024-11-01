// src/components/Profile.js

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';  // Import Firebase services

const Profile = () => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      // Fetch user data from Firestore
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
          setUserData(doc.data());
        }
      });
    }
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    const displayName = e.target.displayName.value;

    // Update Firestore with new profile information
    db.collection('users').doc(auth.currentUser.uid).update({
      displayName
    }).then(() => {
      alert('Profile updated successfully!');
    });
  };

  return (
    <div>
      <h2>Profile</h2>
      <form onSubmit={handleUpdate}>
        <label>
          Display Name:
          <input type="text" name="displayName" defaultValue={userData.displayName || ''} />
        </label>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
