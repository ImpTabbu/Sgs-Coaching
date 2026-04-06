import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9898Sy1vZ61mmhf7J8AoZoRQvnJNnYWQ",
  authDomain: "sgs-coaching.firebaseapp.com",
  projectId: "sgs-coaching",
  storageBucket: "sgs-coaching.firebasestorage.app",
  messagingSenderId: "163355192118",
  appId: "1:163355192118:web:ddbb04aa87fdefa424e197",
  measurementId: "G-KG8BXGK8XY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Offline Persistence
// This is the magic that makes the app work offline and saves database reads!
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ 
    tabManager: persistentMultipleTabManager() 
  })
});

// Initialize Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
