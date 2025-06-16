import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAA8f5w4-5a6RmCEtXpyHWk8b8BfQ70d1k",
    authDomain: "compsci-summative-486d1.firebaseapp.com",
    projectId: "compsci-summative-486d1",
    storageBucket: "compsci-summative-486d1.firebasestorage.app",
    messagingSenderId: "291429059925",
    appId: "1:291429059925:web:d8fb1acfcc4dc92412b3dc",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
