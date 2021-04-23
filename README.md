# Higher Education Map


## Install

1. Upload all the files in the **scripts** folder to the server.

3. Add this to the `<head>` to call Jquery, Jquery UI, and Leaflet.
You may need to remove Jquery if it's already being called by the page and causing a conflict:

        <!-- Jquery -->
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>

        <!-- Jquery UI -->
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
        <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">

        <!-- Leaflet -->
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==" crossorigin=""></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin=""/>

4. Then add lines in the `<head>` to call the files you'll be uploading locally the Countries Geo Data, the map script & css, modify the URLs to match the urls of the files (e.g. replace `scripts/`):

        <!-- HE Map Countries Geo Data -->
        <script type="text/javascript" src="scripts/countriesgeodata.js"></script>

        <!-- HE Map Script & CSS -->
        <script type="text/javascript" src="scripts/he_map_script.js"></script>
        <link rel="stylesheet" href="scripts/he-map.css">

5. Then add these lines of code into the header following, modifying the url to match where you've uploaded them (e.g. again replace `scripts/`):

        <script>
            //HE Map - set these links to the location of these files:
            var jsonlink = 'scripts/data.json';
            var bluePin = 'scripts/pin.png';
            var redPin = 'scripts/pin_red.png';
        </script>


6. Then where you want to insert the **map** in the `<body>` paste this code.
You can remove the H1 header text, but everything else should stay as-is:

        <!-- Begin HE Map -->
        <div class="he-wrapper">
            <h1>Higher Education Map</h1>
            <form id="countries">
                <select id="countries-select">
                    <option>Loading...</option>
                </select>
            </form>
            <div><a href="#projects-wrapper" class="skip-link">Skip to results</a></div>
            <div class="he-map" id="map"></div>
            <div id="projects-wrapper"></div>
            <div><a href="#countries" class="skip-link">Back to region selector</a></div>
        </div>
        <!-- End HE Map -->

---

## Updating the Map Data

1. After editing the original spreadsheet, export it as a `.csv`.
2. Then use a CSV to JSON converter (e.g. https://csvjson.com/csv2json) to convert it to a `.json`.
3. Replace the `data.json` file.

---

## Troubleshooting additions to the map
### New Countries
If countries have been added to the map and they aren't showing up on the leaflet map and only in the dropdown, you can edit the GEO JSON file `countriesgeodata.js`.

Edit the country name to match the one from the spreadsheet. Sometimes they are different.

### New Regions

If a new region has been added (like "Africa Regional"), and you need to add a new **map pin**.

You'll need to add a line registering the pin in the `he_map_script.js` file. Look at the line with the comment `Add Pins to the Map`. 

For more information you can see examples here: https://leafletjs.com/examples/quick-start/

