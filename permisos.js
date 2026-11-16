import {watchSession} from './autenticacion.js';
/* El ocultamiento de la interfaz no reemplaza reglas del servidor. */
export function requireRole(role){
 const main=document.querySelector('main');
 if(!main)return;
 main.hidden=true;
 const status=document.createElement('section');
 status.className='panel';
 status.style.cssText='width:min(800px,calc(100% - 32px));margin:24px auto';
 status.setAttribute('role','status');
 status.textContent='Comprobando acceso…';
 main.before(status);
 watchSession(async user=>{
   main.hidden=true;
   if(!user){status.innerHTML='Inicia sesión para acceder a esta sección. <a href="./index.html#acceso">Ir al ingreso</a>';return}
   try{
     const token=await user.getIdTokenResult(true);
     if(token.claims[role]===true){status.remove();main.hidden=false}
     else status.textContent='Tu cuenta no tiene autorización de '+(role==='admin'?'administrador':'conductor')+'. Solicita al administrador que active tus permisos.'
   }catch{status.textContent='No pudimos comprobar tus permisos. Revisa tu conexión e inténtalo nuevamente.'}
 });
}
