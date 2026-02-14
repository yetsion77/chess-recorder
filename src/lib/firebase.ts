import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDXpi0-Z5L1c4TeGCQV-ZnYX-Rpj0SwlDs",
  authDomain: "chesss-3fe1c.firebaseapp.com",
  databaseURL: "https://chesss-3fe1c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chesss-3fe1c",
  storageBucket: "chesss-3fe1c.firebasestorage.app",
  messagingSenderId: "368138918419",
  appId: "1:368138918419:web:04955a32f87601224a7de6",
  measurementId: "G-THHZKNLFEF",
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
