import * as firebase from "firebase/app";
import "firebase/messaging";

const initializedFirebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyAtfjoIXUAv51YajA9rWTV-kq-2Gm5uAww",
  authDomain: "lifelearn-production.firebaseapp.com",
  databaseURL: "https://lifelearn-production.firebaseio.com",
  projectId: "lifelearn-production",
  storageBucket: "lifelearn-production.appspot.com",
  messagingSenderId: "473526365322",
  appId: "1:473526365322:web:e1e5ca48f79e37028c5173"
});


const messaging = firebase.messaging.isSupported() ? initializedFirebaseApp.messaging() : null;

if (messaging) {
  messaging.usePublicVapidKey(
    "BLkNSxTfNIcQ4JC-Vv-AJrHc3fJUeOcFZZDW2sQWGn0NIqqoMhN16WyvN1FZOWtnpRTQRZyDYM0Z2P6SY59XkMI"
  );
}

export { messaging };