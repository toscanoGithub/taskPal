import Constants from "expo-constants"

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: Constants?.expoConfig?.extra?.apiKey,
  authDomain: Constants?.expoConfig?.extra?.authDomain,
  projectId: Constants?.expoConfig?.extra?.projectId,
  storageBucket: Constants?.expoConfig?.extra?.storageBucket,
  messagingSenderId: Constants?.expoConfig?.extra?.messagingSenderId,
  appId: Constants?.expoConfig?.extra?.appId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });

// Initialize Cloud Firestore and get a reference to the service
 const db = getFirestore(app);

 export default db