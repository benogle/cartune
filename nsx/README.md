# NSX Tune

Car is a 1991 NSX, C30A with an old whipple CTSC with the high boost pulley.

### Cal Files

* base - the tune when I bought the car
* current - what is in the car now

### Attritbues

* ECU: AEM 30-1042
* Peak 8-9lbs boost
* RC 550cc injectors
* 46psi avg fuel pressure
* Stock sensors other than O2
* O2 sensors
  * Both setup for 30-0310 AEM X-Series wideband analog input
  * O2 feedback OFF
* Internal logging running all the time: MAP, RPM, 02 sensors, fuel, ign, knock, etc.

Car runs pretty rich

* high 12s -> low 14s when cruising
* low mid 11s in boost

### Known Issues

* IAT cal table is off, reads ~20deg F high from 60deg - 200degF
* ECT cal table is off in the higher temps > 175deg.
