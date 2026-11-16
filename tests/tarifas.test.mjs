import test from 'node:test';import assert from 'node:assert/strict';
import {calculateFare} from '../tarifas.js';
test('tarifa mínima a 2 km y por debajo',()=>{for(const m of [0,1000,2000])assert.equal(calculateFare({distanceMeters:m,secondsAfterThreshold:999}).totalCOP,6000)});
test('sin minutos previos a cruzar 2 km',()=>assert.equal(calculateFare({distanceMeters:2001,secondsAfterThreshold:0}).totalCOP,6000));
test('distancia y tiempo tras 2 km',()=>assert.equal(calculateFare({distanceMeters:2100,secondsAfterThreshold:60}).totalCOP,6500));
test('prorrateo por segundo y redondeo 50',()=>assert.equal(calculateFare({distanceMeters:2010,secondsAfterThreshold:30}).totalCOP,6150));
test('rechaza distancias negativas',()=>assert.throws(()=>calculateFare({distanceMeters:-1})));
