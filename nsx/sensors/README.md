# Sensors

This is a scratch pad for building sensor tables and equations that end up in the ECU or in realdash.

## Scripts

* `temp-volts-table.js` - builds a voltage -> temp table from an ohms -> temp table
* `temp-sensor-equation.js` - finds a suitable equation from a voltage -> temp table for use in software that doesn't accept a table

## AEM EMS

Sensor tables are 0-5v, 32 cells, .15625v per cell

# Specific sensor notes

## Honda map sensor:

* -13.9PSIg (5.48kPA, 0.32v) to 10.94PSIg (176.72kPA, 4.82v)
* -13.9PSIg (-95.837164kPA, 0.32v) to 10.94PSIg (75.4286744kPA, 4.82v)
* kpa = 38.06*v -108.02
* psi = 5.52*v - 15.6664

0.2484*v - 13.9

(V*0.00007782) * 5.52 - 15.6664

psi = V*0.0004295664 - 15.6664
kpa = V*-0.000490266 + 207.09 // absolute?
kpa = V*0.0029618292 + -108.02

V*0.00007782 to volts


## Lowdoller 0 - 150psi sensor:

* 0psi (.5v) to 150psi (4.5v) linear
* psi = 37.5*v -18.75

0psi: 0v
10psi: 1.03v
30psi: 1.3v
40psi: 1.6v

## Rife liquid temp 300deg F

2200 ohms
y = -1.16x^5 + 15.36x^4 + -79.86x^3 + 207.01x^2 + -313.82x + 398.05

2150 ohms
y = -1.1718x^5 + 15.4508x^4 + -80.2679x^3 + 207.863x^2 + -314.9237x + 400.148

### realdash

V*0.00007782 to volts

-1.1718*(V*0.00007782)*(V*0.00007782)*(V*0.00007782)*(V*0.00007782)*(V*0.00007782) + 15.4508*(V*0.00007782)*(V*0.00007782)*(V*0.00007782)*(V*0.00007782) + -80.2679*(V*0.00007782)*(V*0.00007782)*(V*0.00007782) + 207.863*(V*0.00007782)*(V*0.00007782) + -314.9237*(V*0.00007782) + 400.148

y = -0.000091189476*V^5 + 0.001202381256*V^4 + -0.006246447978*V^3 + 0.01617589866*V^2 + -0.02450736233*V + 400.148

### Table

60deg: 4.39v
80deg: 4.0v
100deg: 3.6v
130deg: 2.9v

```
F     Ω
-20   189,726
-10   132,092
0     93,425
10    67,059
20    48,804
30    35,983
40    26,855
50    20,274
60    15,473
70    11,929
80    9,287
90    7,295
100   5,781
110   4,618
120   3,718
130   3,016
140   2,463
150   2,025
160   1,675
170   1,395
180   1,167
190   983
200   832
210   707
220   604
230   519
240   447
250   387
260   336
270   294
280   257
290   226
```


## Rife IAT lo-at air sensor

Works, but need ohms in decimal: ohms * 0.0001

-35.0756252065x^5 + 230.2169709841x^4 + -574.8273511549x^3 + 699.0260262714x^2 + -461.4915047654x + 220.0597537706


-35.0756252065*(V*0.0001)*(V*0.0001)*(V*0.0001)*(V*0.0001)*(V*0.0001) + 230.2169709841*(V*0.0001)*(V*0.0001)*(V*0.0001)*(V*0.0001) + -574.8273511549*(V*0.0001)*(V*0.0001)*(V*0.0001) + 699.0260262714*(V*0.0001)*(V*0.0001) + -461.4915047654*(V*0.0001) + 220.0597537706

### Scale

```js
// ohms to temp
// [ 132, 335 ],
// [ 157, 320 ],
// [ 178, 309 ],
// [ 204, 298 ],
// [ 235, 287 ],
// [ 271, 276 ],
// [ 314, 265 ],
// [ 366, 254 ],
// [ 428, 243 ],
// [ 503, 232 ],
// [ 595, 221 ],
// [ 707, 210 ],
// [ 845, 199 ],
// [ 1017, 188 ],
// [ 1231, 177 ],
[ 1500, 166 ],
[ 1840, 155 ],
[ 2276, 144 ],
[ 2836, 133 ],
[ 3564, 122 ],
[ 4518, 111 ],
[ 5781, 100 ],
[ 7471, 89 ],
[ 9756, 78 ],
[ 12884, 67 ],
[ 17218, 56 ],
[ 23302, 45 ],
// [ 31963, 34 ],
// [ 44481, 23 ],
// [ 62863, 12 ],


// { x: 0.15, equationValue: 165, realValue: 166, error: '-0.6%' },
// { x: 0.184, equationValue: 155, realValue: 155, error: '0%' },
// { x: 0.2276, equationValue: 145, realValue: 144, error: '0.69%' },
// { x: 0.2836, equationValue: 134, realValue: 133, error: '0.75%' },
// { x: 0.3564, equationValue: 122, realValue: 122, error: '0%' },
// { x: 0.4518, equationValue: 110, realValue: 111, error: '-0.9%' },
// { x: 0.5781, equationValue: 99, realValue: 100, error: '-1%' },
// { x: 0.7471, equationValue: 89, realValue: 89, error: '0%' },
// { x: 0.9756, equationValue: 79, realValue: 78, error: '1.28%' },
// { x: 1.2884, equationValue: 66, realValue: 67, error: '-1.49%' },
// { x: 1.7218, equationValue: 56, realValue: 56, error: '0%' },
// { x: 2.3302, equationValue: 45, realValue: 45, error: '0%' }
```


## G meter

.494g + 2.48 = V

(V - 2.48) / .494 = g

V / .494 - 5.020242915
