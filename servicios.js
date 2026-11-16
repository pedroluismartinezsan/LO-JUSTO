/* LOJUSTO — máquina de estados local, sin almacenamiento ni autorización.
   El backend deberá ejecutar transacciones atómicas para la aceptación y el cierre. */
export const TRIP_STATES=Object.freeze({REQUESTED:'solicitado',ACCEPTED:'aceptado',IN_PROGRESS:'en_curso',FINISHED:'finalizado',CLOSED:'cerrado',CANCELLED:'cancelado'});
const NEXT=Object.freeze({
 solicitado:['aceptado','cancelado'],
 aceptado:['en_curso','cancelado'],
 en_curso:['finalizado'],
 finalizado:['cerrado'],
 cerrado:[],
 cancelado:[]
});
export function canTransition(from,to){return Array.isArray(NEXT[from])&&NEXT[from].includes(to)}
export function transitionTrip(trip,to,{driverId,pinVerified=false,finalFareCOP}={}){
 if(!trip||!canTransition(trip.status,to))throw Error('Transición de servicio no permitida');
 const next={...trip,status:to};
 if(to==='aceptado'){
   if(typeof driverId!=='string'||!driverId.trim())throw Error('Falta conductor');
   if(trip.driverId)throw Error('El servicio ya tiene conductor');
   next.driverId=driverId;
 }
 if(to==='en_curso'){
   if(!trip.driverId||pinVerified!==true)throw Error('Falta conductor o verificación del PIN');
 }
 if(to==='finalizado'){
   if(!Number.isFinite(finalFareCOP)||finalFareCOP<0||finalFareCOP%50!==0)throw Error('Tarifa final inválida');
   next.finalFareCOP=finalFareCOP;
 }
 return next;
}
