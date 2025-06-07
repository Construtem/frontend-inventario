// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA97OllCM6l5u1gMv3cWsS2KdsuRM9VcLk",
  authDomain: "logininventario-87abe.firebaseapp.com",
  projectId: "logininventario-87abe",
  storageBucket: "logininventario-87abe.appspot.com", // <-- corregido
  messagingSenderId: "1011506850426",
  appId: "1:1011506850426:web:d395a8779e4b0474dde9c3",
  measurementId: "G-RY83F2SQYS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
