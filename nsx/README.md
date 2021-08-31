# NSX Tune

Car is a 1991 NSX, C30A with an old whipple 1.6 CTSC with the high boost pulley.

### Cal Files

* base - the tune when I bought the car
* current - what is in the car now
  * Rife Lo-AT air temp sensor
  * Using TPS signal from ADCR11 (D12 pin, "PR Press Voltage")
* current-stock-sensors - current with stock sensor cal tables
  * Stock sensors other than O2

### Attritbues

* ECU: AEM 30-1042
* Peak 8-9lbs boost
* RC 550cc injectors
* 46psi avg fuel pressure
* O2 sensors
  * Both setup for 30-0310 AEM X-Series wideband analog input
  * O2 feedback OFF
* Internal logging running all the time: MAP, RPM, 02 sensors, fuel, ign, knock, etc.

AFRs in the

* low-mid 14s when cruising
* mid 11s in boost

### Known Issues

* ECT cal table is likely slightly off with temps > 175deg.
* Accel fuel settings have high thresholds to compensate for noisy TPS signal
