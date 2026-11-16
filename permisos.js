import {watchSession} from './autenticacion.js';
import {firebaseApp} from './firebase-app.js';
import {getFirestore,doc,getDoc} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const db=getFirestore(firebaseApp);
export async function hasRole(user,role){
 if(!user)return false;
 const roleDoc=await getDoc(doc(db,'roles',user.uid));
 return roleDoc.exists()&&roleDoc.data()[role]===true;
}
export function requireRole(role){
 const main=document.querySelector('main');if(!main)return;
 main.hidden=true;
 const status=document.createElement('section');
 status.className='panel';status.style.cssText='width:min(800px,calc(100% - 32px));margin:24px auto';
 status.setAttribute('role','status');main.before(status);
 let sequence=0;
 watchSession(async user=>{
   const current=++sequence;main.hidden=true;status.hidden=false;
   if(!user){status.innerHTML='Inicia sesión para acceder. <a href="./index.html#acceso">Ir al ingreso</a>';return}
   status.textContent='Comprobando acceso…';
   try{
     const permitted=await hasRole(user,role);
     if(current!==sequence)return;
     if(permitted){status.hidden=true;main.hidden=false}
     else status.textContent='Tu cuenta todavía no tiene habilitado el acceso de '+(role==='admin'?'administrador':'conductor')+'.';
   }catch{
     if(current===sequence)status.textContent='No se pudo comprobar el acceso. Revisa la conexión y las reglas de Firestore.';
   }
 });
}
