$(document).ready(function () {

    /*
     * Install Note: connect to data.json if csv to JSON is not working   
     */

    //jsonlink is being called to in header
    //let jsonlink = 'scripts/data.json';

    var prevLayerClicked = null;
    var prevPinClicked = null;

    $.getJSON(jsonlink, function (data) {
        var countries = [];

        $.each(data, function(i, item) {
			let name = data[i].name;
			let description = data[i].description;
            let country = data[i].country;
            countries.push(country);
        });

        var countriesList = [...new Set(countries)];

        /* Build Select List */
        let countrySelect = '<option name="none">Select Country or Region</option>';

        let arrayLength = countriesList.length;

        for (var i = 0; i < arrayLength; i++) {
            let currentCountry = countriesList[i]
            countrySelect +=  '<option value="' + currentCountry/*.toLowerCase()*/ + '">' + currentCountry + '</option>';
        }

        //add countrySelect to select
        $("#countries-select").html(countrySelect);

        // on select change
        $('#countries-select').on('change', function() {
            let selectedCountry = this.value

            //check if accordian exists -- destroy accordian
            var isAccordion = $("#projects-wrapper").hasClass("ui-accordion");
            if ( isAccordion ){
                $( "#projects-wrapper" ).accordion( "destroy" );
            }

            //go through json to find all matching countries
            let programResult = '<div class="current-country">Region: ' + selectedCountry + '</div>';    

            $.each(data, function(i, item) {
                var country = data[i].country;

                if (country == selectedCountry) {

                    //create variables
                    let name = data[i].name;
                    let description = data[i].description;
                    let start = data[i].start;
                    let end = data[i].end;
                    let implementorname = data[i].implementorname;
                    let subawardees = data[i].subawardees;
                    let link = data[i].link;

                    // add to result
                    programResult += '<div class="wrap"><h2 class="project-name">' + name + '</h2>';
                    programResult += '<div><span class="project-description">' + description + '</span>';
                    programResult += '<span class="project-dates">' + start + ' &ndash; ' + end + '</span>';
                    if (implementorname!='') { programResult += '<span class="project-implementorname"><strong>Implementor:</strong> ' + implementorname + '</span>';}
                    if (subawardees!='') { programResult += '<span class="project-subawardees"><strong>Subawardees:</strong> ' + subawardees + '</span>';}
                    if (link!='') { programResult += '<br><span class="project-subawardees"><a href="' + link + '" target="_blank" title="Link opens in a new window">Link to Project</a></span>';}
                    programResult += '</div></div>';
                }

            });

            $("#projects-wrapper").html(programResult);

            //create accordian
            $("#projects-wrapper" ).accordion({
                animate: 200,
                header: '> div.wrap > h2',
                heightStyle: "content",
                collapsible: true,
                active: false, //collapse all panels
            });

            // highlight country 
            geojson.eachLayer(function(layer) {
                
                let layername = layer.feature.properties.name;
                if (layername == selectedCountry) {
                    if (prevLayerClicked !== null) {
                        prevLayerClicked.setStyle(solidStyle);
                        map.closePopup();
                    }
                    layer.setStyle({ 'fillColor' : '#BA0C2F' });
                    prevLayerClicked = layer;                    
                }

                if (prevPinClicked !== null){
                    prevPinClicked.setIcon(pinIcon);
                }
            })

            //if equals pin layer then do something
            map.eachLayer(function (layer) {
                let altName = layer.options.alt;

                if(typeof altName !== "undefined"){
                    if (altName == selectedCountry){                        
                        layer.setIcon(pinIconSelected);
                        if (prevLayerClicked !== null){
                            prevLayerClicked.setStyle(solidStyle);
                        }
                        //reset pin
                        if (prevPinClicked !== null){
                            prevPinClicked.setIcon(pinIcon);
                        }
                        prevPinClicked = layer;
                        layer.setIcon(pinIconSelected);
                    }
                }
            });
            

        });
        
        var othercountries = '';
        //iterate through countriesMap variable
        var geojson = L.geoJSON(countriesMap, {style: solidStyle, onEachFeature: onEachFeature})
        .eachLayer(function (layer) {
            var thislayercountry = layer.feature.properties.name;
            if (countriesList.includes(thislayercountry)){
                layer.addTo(map)
            }
            //popup
            layer
                .on('click', function(layer) {
                    $('#countries-select').val(thislayercountry).trigger('change');
                })
            othercountries += thislayercountry;
        });//L.geoJSON eachLayer function

        var prevLayerClicked = null;
        function clickFeature(e) {
            var layer = e.target;

            layer.setStyle({ "fillColor": "#BA0C2F" })
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
            if (prevLayerClicked !== null) {
                prevLayerClicked.setStyle(solidStyle);
            }
            prevLayerClicked = layer;
        }
        
        function resetHighlight(e) {
            var layer = e.target;
            layer.setStyle({ color: '#fff' });
        }

        function highlightFeature(e) {
            var layer = e.target;
            layer.setStyle({ color: '#BA0C2F' });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
            });
        }

        /*
        Add Pins to the Map
        */

        // Adding for regions (not countries), have to be manually added with Long/Lat numbers
        var marker_africa = L.marker([15, 19], {icon: pinIcon, alt: 'Africa Regional'}).addTo(map).on('click', clickMarker);
        var marker_asia = L.marker([30, 89], {icon: pinIcon, alt: 'Asia Regional'}).addTo(map).on('click', clickMarker);
        var marker_middle_east_regional = L.marker([29, 49], {icon: pinIcon, alt: 'Middle East Regional'}).addTo(map).on('click', clickMarker);
        var marker_worldwide = L.marker([10, -30], {icon: pinIcon, alt: 'Worldwide'}).addTo(map).on('click', clickMarker);
        var marker_europe_eurasia = L.marker([45, 40], {icon: pinIcon, alt: 'Europe & Eurasia Regional'}).addTo(map).on('click', clickMarker);

        marker_africa.bindPopup('<b>Africa Regional</b>');
        marker_asia.bindPopup('<b>Asia Regional</b>');
        marker_worldwide.bindPopup('<b>Worldwide</b>');
        marker_middle_east_regional.bindPopup('<b>Middle East Regional</b>');
        marker_europe_eurasia.bindPopup('<b>Europe & Eurasia Regional</b>');
    
        function clickMarker(e){
            var layer = e.target;
            let region = layer.options.alt;
            layer.setIcon(pinIconSelected);
            $('#countries-select').val(region).trigger('change');
        }
        /*
        End Pins
        */

    });//end $.getJSON(jsonlink, function (data) {
    
    // leafletjs init map
    var map = L.map('map').setView([0, 0], 2);

    // load a tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        maxZoom: 17,
        minZoom: 1
    }).addTo(map);

    /*
     * Install Note: Change url to location of pin.png and pin_red.png   
     */
    
    //note: bluePin & redPin need to be set up in doc header
    var pinIcon = L.icon({
      iconUrl: bluePin,
      //iconUrl: 'scripts/pin.png',
      iconSize: [36,36],
      iconAnchor: [18, 36],
      popupAnchor:  [0, -27]
    });

    var pinIconSelected = L.icon({
      iconUrl: redPin,
      //iconUrl: 'scripts/pin_red.png',
      iconSize: [36,36],
      iconAnchor: [18, 36],
      popupAnchor:  [0, -27]
    });

    var solidStyle = {
        "color": "#fff",
        "weight": 2,
        "fillColor": "#A7C6ED",
        "opacity": 0.5,
        "fillOpacity": 1.0
    };

});