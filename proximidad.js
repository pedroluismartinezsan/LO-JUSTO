/* LOJUSTO: cálculos geográficos compartidos. El backend deberá verificar GPS, permisos y frescura. */
export const MAX_PICKUP_METERS=400;
export const MAX_GPS_AGE_MS=60_000;
export function distanceMeters(a,b){
 for(const p of [a,b])if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>90||Math.abs(p.lng)>180)throw Error('Coordenadas inválidas');
 const rad=Math.PI/180,R=6371000,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad;
 const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
 return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
}
export function isDriverEligible({driver,pickup,now=Date.now(),maxDistance=MAX_PICKUP_METERS,maxAge=MAX_GPS_AGE_MS}){
 if(!driver||driver.available!==true||driver.authorized!==true)return false;
 if(!Number.isFinite(driver.updatedAt)||!Number.isFinite(now)||driver.updatedAt>now||now-driver.updatedAt>maxAge)return false;
 try{return distanceMeters(driver,pickup)<=maxDistance}catch{return false}
}
