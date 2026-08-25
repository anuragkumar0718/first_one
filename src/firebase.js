import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB-t-LXentfOjIoGHGs6SPTjrOFFCxCWy8",
  authDomain: "firstbyanurag.firebaseapp.com",
  projectId: "firstbyanurag",
  storageBucket: "firstbyanurag.firebasestorage.app",
  messagingSenderId: "868975121785",
  appId: "1:868975121785:web:4b2a0846ab7b2f8d5f8ba8",
  measurementId: "G-GQ1JQ3PKZH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
