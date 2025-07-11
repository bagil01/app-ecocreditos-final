// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXHrkBYWMMZfWOTAuEFqVRAYZpFyjxqDU",
  authDomain: "ecocreditossantarem.firebaseapp.com",
  projectId: "ecocreditossantarem",
  storageBucket: "ecocreditossantarem.firebasestorage.app",
  messagingSenderId: "136620980388",
  appId: "1:136620980388:web:f6576bab4220a482a3ce31"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
