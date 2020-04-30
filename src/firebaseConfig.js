import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyCSgVXCbq0_FNwauQYRx7vWgkFc16fbrb8",
  authDomain: "learning-tool-6536b.firebaseapp.com",
  databaseURL: "https://learning-tool-6536b.firebaseio.com",
  projectId: "learning-tool-6536b",
  storageBucket: "learning-tool-6536b.appspot.com",
  messagingSenderId: "955854541273"
};

export const FirebaseConsts = firebase;
export default firebase.initializeApp(config);

export const db = firebase.firestore();
export const Storage = firebase.storage();
