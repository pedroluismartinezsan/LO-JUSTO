import {firebaseApp} from './firebase-app.js';
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
export const auth=getAuth(firebaseApp);
export function watchSession(callback){return onAuthStateChanged(auth,callback)}
export async function registerPassenger({firstName,lastName,email,password}){
 const name=[firstName,lastName].map(s=>String(s||'').trim()).join(' ').trim();
 if(!firstName?.trim()||!lastName?.trim())throw Error('Escribe nombre y apellido');
 const credential=await createUserWithEmailAndPassword(auth,email.trim(),password);
 await updateProfile(credential.user,{displayName:name});
 return credential.user;
}
export async function login(email,password){return (await signInWithEmailAndPassword(auth,email.trim(),password)).user}
export function logout(){return signOut(auth)}
export function friendlyAuthError(error){
 const code=error?.code||'';
 const messages={
 'auth/email-already-in-use':'Este correo ya tiene una cuenta. Ingresa con tu contraseña.',
 'auth/invalid-email':'Escribe un correo electrónico válido.',
 'auth/weak-password':'Elige una contraseña de al menos 6 caracteres.',
 'auth/invalid-credential':'Correo o contraseña incorrectos.',
 'auth/too-many-requests':'Demasiados intentos. Inténtalo más tarde.',
 'auth/network-request-failed':'No hay conexión. Revisa tu internet.',
 'auth/operation-not-allowed':'Debes habilitar Correo/Contraseña en Firebase Authentication.',
 'auth/unauthorized-domain':'Este dominio debe autorizarse en Firebase Authentication.'
 };
 return messages[code]||'No fue posible completar la operación. Inténtalo de nuevo.';
}
