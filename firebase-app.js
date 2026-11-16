import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {firebaseConfig} from './firebase-config.js';
export const firebaseApp=getApps().length?getApp():initializeApp(firebaseConfig);
