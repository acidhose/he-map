$(document).ready(function () {

    /*
     * Install Note: connect to data.json if csv to JSON is not working   
     */

    //jsonlink is being called to in header
    //let jsonlink = 'scripts/data.json';

    // var prevLayerClicked = null;
    var prevPinClicked = null;
    let usaidRed = "#BA0C2F";
    let usaidLightBlue = "#A7C6ED";

    $.getJSON(jsonlink, function (data) {
        var countries = [];
        var countries2 = [];

        $.each(data, function(i, item) {
			let name = data[i].name;
			let description = data[i].description;
            let country = data[i].country;
            let sector = data[i].sector;
            let subsector = data[i].subsector;
            countries.push(country);
            countries2.push([country, sector, subsector]);
        });

        var countriesList = [...new Set(countries)];
        var countriesList2 = [...new Set(countries2)];
        // console.log("countries list ---v");
        // console.log(countriesList2);

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
            let programResult = '<div class="current-country">Region: ' + selectedCountry + '<div class="current-country-note">*Projects shaded blue match the selected sector</div></div>';

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
                    let sector = data[i].sector;
                    let subsector = data[i].subsector;

                    // add to result
                    programResult += '<div class="wrap"><h2 class="project-name" data-sector="' + sector + '" data-subsector="' + subsector + '">' + name + '</h2>';
                    programResult += '<div><span class="project-description">' + description + '</span>';
                    programResult += '<span class="project-dates">' + start + ' &ndash; ' + end + '</span>';
                    if (subawardees!='') {programResult += '<span class="project-subawardees"><strong>Subawardees:</strong> ' + subawardees + '</span>';}
                    programResult += '<br><div><strong>Sector:</strong> ' + sector + '</span></div>';
                    if (subsector!='') {programResult += '<div><strong>Subsector:</strong> ' + subsector + '</div>';}
                    if (implementorname!='') {programResult += '<span class="project-implementorname"><strong>Implementor:</strong> ' + implementorname + '</span>';}
                    if (link!='') {programResult += '<br><span class="project-subawardees"><a href="' + link + '" target="_blank" title="Link opens in a new window">Link to Project</a></span>';}
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
                    layer.setStyle(selectStyle);

                    // bring to front
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }
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
            
            highlightProjects(); //highlight projects that are now shown

        });
        
    //on change filter / begin function change filter

    $('#sector-filter').on('change', function() {
        changeFilter();
    });

    function changeFilter (){
        console.log("changed!");
        // const terms = '';

        let supportFilter = $('#sector-filter').val();
        // console.log(supportFilter);

        geojson.eachLayer(function (layer) {
            let supportProperty = layer.feature.properties["support"];
            layer.setStyle({fillColor : 'gray'});

            if (supportFilter == 'none'){
                layer.setStyle({fillColor : usaidLightBlue});
            }
            else {
                if (supportProperty){
                    if ( supportProperty.includes(supportFilter) ){
                        layer.setStyle({fillColor : usaidLightBlue});
                    }
                }
            }
        });
        highlightProjects ()
    } // end function change filter
    
    function highlightProjects (){
        let supportFilter = $('#sector-filter').val();

        //reset classes
        $("#projects-wrapper h2").each(function() { $(this).removeClass('highlighted-accordian'); });
        $("#projects-wrapper h2").each(function() {
            if ( $(this).attr("data-sector") == supportFilter || $(this).attr("data-subsector") == supportFilter ){
                $(this).addClass('highlighted-accordian');
            }
        });
    }

        var othercountries = '';
        //iterate through countriesMap variable
        // var geojson = L.geoJSON(countriesMap, {style: solidStyle, onEachFeature: onEachFeature})
        var geojson = L.geoJSON(countriesMap, {onEachFeature: onEachFeature})
            .eachLayer(function (layer) {
                let thislayercountry = layer.feature.properties.name;
                var int = 0;
                
                // console.log(countriesList2); 
                // console.log(thislayercountry); 

                if (exists(countriesList2, thislayercountry) ){ //checking 2 dim array    
                // if (exists(countriesList2, thislayercountry) ){ //checking 2 dim array    
                    layer.addTo(map).setStyle(solidStyle); //adds countries to map
                    
                    let supportHolder =  [];
                
                    countriesList2.forEach(e => {
                        if (e[0] == thislayercountry && e[1] !== undefined) { //if country matches other list
                            let supportTerm = e[1];
                            let subSupportTerm = e[2];
                            // layer.feature.properties["support"] += e[1] + ', ';

                            //could be improved to not add this every time
                            if ( supportHolder.includes(supportTerm) == false){
                                supportHolder.push(e[1]);
                                // layer.feature.properties["support"] = supportHolder;
                            }
                            if ( supportHolder.includes(subSupportTerm) == false){
                                supportHolder.push(e[2])
                            }
                            layer.feature.properties["support"] = supportHolder;

                            int++; 
                        }
                    });
            }

            function exists(arr, search) {
                console.log(arr.some(row => row.includes(search))); 
                return arr.some(row => row.includes(search)); //returns true
            }

            //popup
            layer
                .on('click', function(layer) {
                    $('#countries-select').val(thislayercountry).trigger('change');
                    console.log(this);
                    console.log(this.feature.properties.support);
                })
            othercountries += thislayercountry;

    }); //L.geoJSON eachLayer function


    // New 
    let prevLayerClicked = null;
            
    function resetHighlight(e) {
        let layer = e.target;
        layer.setStyle({ fillOpacity: 1 });
    }

    function highlightFeature(e) {
        let layer = e.target;
        layer.setStyle({ fillOpacity: 0.5 });
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    }

    // end new 

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

    /* Filter Specific */
    var mapfilters = L.control({ position: "bottomright" });

    mapfilters.onAdd = function(map) {
        var filtercontrol = L.DomUtil.create('div', 'mapfilter');
        filtercontrol.innerHTML += '<h4>Sector:</h4>';
        filtercontrol.innerHTML += '<select id="sector-filter"><option value="none">None Selected</option><option value="Agriculture & Food Security">Agriculture & Food Security</option><option value="Climate & Environment">Climate & Environment</option><option value="Democracy & Governance">Democracy & Governance</option><option value="Economic Growth">Economic Growth</option><option value="Education">Education</option><option value="Energy">Energy</option><option value="Global Health">Global Health</option><option value="Media & Journalism">Media & Journalism</option><option value="Research & Innovation">Research & Innovation</option><option value="Science, Technology, Engineering, and Mathematics (STEM)">Science, Technology, Engineering, and Mathematics (STEM)</option><option value="Water & Sanitation">Water & Sanitation</option><option value="Youth">Youth</option></select>';

        return filtercontrol;
    };
    
    mapfilters.addTo(map);
    $(".mapfilter").show();


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
        "fillColor": usaidLightBlue,
        "opacity": 0.5,
        "fillOpacity": 1.0
    };

    let selectStyle = {
        color: usaidRed,
        className : "select-test",
        weight: 1.5
    }




}); //document ready