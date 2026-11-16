import test from 'node:test';import assert from 'node:assert/strict';import {distanceMeters,isDriverEligible} from '../proximidad.js';
const p={lat:4.535,lng:-75.675},now=100000;
test('la distancia a sí mismo es cero',()=>assert.equal(distanceMeters(p,p),0));
test('400 metros aproximados usando latitud',()=>{const near={lat:p.lat+0.003,lng:p.lng},far={lat:p.lat+0.005,lng:p.lng};assert.ok(distanceMeters(p,near)<400);assert.ok(distanceMeters(p,far)>400)});
test('solo conductores autorizados, disponibles y recientes',()=>{const driver={lat:p.lat,lng:p.lng,authorized:true,available:true,updatedAt:now-1000};assert.equal(isDriverEligible({driver,pickup:p,now}),true);assert.equal(isDriverEligible({driver:{...driver,authorized:false},pickup:p,now}),false);assert.equal(isDriverEligible({driver:{...driver,available:false},pickup:p,now}),false);assert.equal(isDriverEligible({driver:{...driver,updatedAt:now-61000},pickup:p,now}),false);assert.equal(isDriverEligible({driver:{...driver,updatedAt:now+1000},pickup:p,now}),false)});
test('rechaza coordenadas inválidas',()=>assert.throws(()=>distanceMeters({lat:91,lng:0},p)));
