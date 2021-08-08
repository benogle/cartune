Contains NSX-specific RealDash stuff

![screenshot](https://user-images.githubusercontent.com/69169/128649215-75b2c038-520f-4f05-9f75-1cf33c2b9dbe.png)

* XML files are realdash definition files including the AEM infinity definition _plus_ CAN protocol definitions for 2 AEM wideband O2 sensors
  * AEMNet_TargetIds.xml - uses [RealDash target IDs](https://realdash.net/manuals/targetid.php)
  * AEMNet.xml - Same, but no target IDs
* nsx-dash.rd - The dashboard I am using in the NSX right now, shown in the pic above. It uses target IDs for all values, except the small numbers on the AFR graphs, which are digital AFR from the XML files above.
