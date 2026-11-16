import test from 'node:test';import assert from 'node:assert/strict';import {TRIP_STATES,canTransition,transitionTrip} from '../servicios.js';
test('ciclo completo y tarifa bloqueada',()=>{
 let t={id:'demo',status:TRIP_STATES.REQUESTED};
 t=transitionTrip(t,TRIP_STATES.ACCEPTED,{driverId:'conductor-demo'});
 assert.equal(t.driverId,'conductor-demo');
 assert.throws(()=>transitionTrip(t,TRIP_STATES.ACCEPTED,{driverId:'otro'}));
 assert.throws(()=>transitionTrip(t,TRIP_STATES.IN_PROGRESS));
 t=transitionTrip(t,TRIP_STATES.IN_PROGRESS,{pinVerified:true});
 assert.throws(()=>transitionTrip(t,TRIP_STATES.FINISHED,{finalFareCOP:6001}));
 t=transitionTrip(t,TRIP_STATES.FINISHED,{finalFareCOP:6000});
 t=transitionTrip(t,TRIP_STATES.CLOSED);
 assert.equal(t.finalFareCOP,6000);
 assert.equal(canTransition(t.status,TRIP_STATES.REQUESTED),false);
});
test('no se salta la verificación ni se altera un viaje cerrado',()=>{
 const t={status:TRIP_STATES.REQUESTED};
 assert.throws(()=>transitionTrip(t,TRIP_STATES.IN_PROGRESS,{pinVerified:true}));
 assert.throws(()=>transitionTrip(t,TRIP_STATES.ACCEPTED,{driverId:''}));
 assert.equal(t.status,TRIP_STATES.REQUESTED);
});
test('cancelación solo antes de iniciar',()=>{
 const t=transitionTrip({status:TRIP_STATES.REQUESTED},TRIP_STATES.CANCELLED);
 assert.equal(t.status,TRIP_STATES.CANCELLED);
 assert.equal(canTransition(TRIP_STATES.IN_PROGRESS,TRIP_STATES.CANCELLED),false);
});
