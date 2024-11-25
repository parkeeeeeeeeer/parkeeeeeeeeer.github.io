import {
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { auth, db } from './auth.js';

const user = auth.currentUser;


const userDoc = await getDoc(doc(db, "users", user.uid));

const userData = userDoc.data();


const PFAUserDoc = await getDoc(doc(db, "PFA", user.uid));

const userPFAData = PFAUserDoc.data();


const SOBUserDoc = await getDoc(doc(db, "SOB", user.uid));

const userSOBData = SOBUserDoc.data();


const SOBStandardDoc = await getDoc(doc(db, "SOB", "Standard"));

const userSOBStandardData = SOBStandardDoc.data();


export {userData, userPFAData, userSOBData, userSOBStandardData};

// User Data

// PFA User Data

// SOB User Data

// Standard for SOBs (0:BC,1:BCL,2:ICL,3:SCL)  Field Format x.x: title