# NSX Tune

Car is a 1991 NSX, C30A with an old whipple 1.6 CTSC with a 3.5" high boost pulley (9 psi)

### Cal Files

* base - the tune when I bought the car
* current - what is in the car now
  * Rife Lo-AT air temp sensor
  * Using TPS signal from ADCR11 (D12 pin, "PR Press Voltage", less noisy than D11)
  * Oil temp: Rife 0-300 into ADCR01 (D11 pin)
  * Oil pressure: Lowdoller 0 - 150psi into ADCR03 (D8 pin)
* current-stock-sensors - current with stock sensor cal tables
  * Stock sensors other than O2

### Attritbues

* ECU: AEM 30-1006 and 30-1042
* Peak 9 psi boost
* RC 550cc injectors
* 46psi idle fuel pressure
* O2 sensors
  * Both setup for 30-0310 AEM X-Series wideband analog input
  * O2 feedback OFF
* Rife Lo-AT air temp sensor
* Internal logging running all the time: MAP, RPM, 02 sensors, fuel, ign, knock, etc.

I repinned a couple ADC channels to deal with sensor noise and add sensors

* TPS into the EGRL pin: ADCR11 / PR Press
* Oil temp into TPS pin D11: ADCR1 (TPS Raw)
* Oil pressure into D8: ADCR3 ("MAF")
* Fuel pressure into D6: ADCR13

* Use stock TPS path for TPS
* Oil temp uses ign adjust pathway, currently into TPS
* Accessory
  * D6: fuelpress
  * D8: oil press

AFRs in the

* low-mid 14s when cruising
* mid 11s in boost


### Known Issues

* ECT cal table is likely slightly off with temps > 175deg.
* Accel fuel settings have high thresholds to compensate for noisy TPS signal
