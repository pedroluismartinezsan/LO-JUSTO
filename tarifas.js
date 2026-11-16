/* LOJUSTO — cálculo compartido, sin datos personales. El servidor debe ser autoridad final. */
export const DEFAULT_TARIFF=Object.freeze({baseCOP:6000,includedMeters:2000,perExtraMeterCOP:3,perMinuteAfterThresholdCOP:200,roundToCOP:50});
export function roundCOP(amount,increment=50){if(!Number.isFinite(amount)||!Number.isFinite(increment)||increment<=0)throw Error('Importe inválido');return Math.round(amount/increment)*increment}
export function calculateFare({distanceMeters,secondsAfterThreshold=0,tariff=DEFAULT_TARIFF}){
 if(!Number.isFinite(distanceMeters)||distanceMeters<0||!Number.isFinite(secondsAfterThreshold)||secondsAfterThreshold<0)throw Error('Medición inválida');
 for(const key of ['baseCOP','includedMeters','perExtraMeterCOP','perMinuteAfterThresholdCOP','roundToCOP'])if(!Number.isFinite(tariff[key])||tariff[key]<0)throw Error('Tarifa inválida: '+key);
 if(tariff.roundToCOP<=0)throw Error('Redondeo inválido');
 const extra=Math.max(0,distanceMeters-tariff.includedMeters);
 const seconds=extra>0?secondsAfterThreshold:0;
 const raw=tariff.baseCOP+extra*tariff.perExtraMeterCOP+(seconds/60)*tariff.perMinuteAfterThresholdCOP;
 return {totalCOP:roundCOP(raw,tariff.roundToCOP),rawCOP:raw,extraMeters:extra,chargedSeconds:seconds};
}
