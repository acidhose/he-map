$(document).ready(function () {

    /*
     * Install Note: connect to data.json if csv to JSON is not working   
     */

    //jsonlink is being called to in header
    //let jsonlink = 'scripts/data.json';

    var prevLayerClicked = null;
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
            // console.log (sector);
            countries.push(country);
            countries2.push([country, sector]);
        });

        var countriesList = [...new Set(countries)];
        var countriesList2 = [...new Set(countries2)];
        console.log(countriesList2);

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
                    let sector = data[i].sector;
                    let subsector = data[i].subsector;

                    // add to result
                    programResult += '<div class="wrap"><h2 class="project-name">' + name + '</h2>';
                    programResult += '<div><span class="project-description">' + description + '</span>';
                    // programResult += '<div> Subsector: '  + subsector + '</span>';
                    programResult += '<span class="project-dates">' + start + ' &ndash; ' + end + '</span>';
                    if (subawardees!='') { programResult += '<span class="project-subawardees"><strong>Subawardees:</strong> ' + subawardees + '</span>';}
                    programResult += '<br><div><strong>Sector:</strong> ' + sector + '</span></div>';
                    if (implementorname!='') { programResult += '<span class="project-implementorname"><strong>Implementor:</strong> ' + implementorname + '</span>';}
                    if (subsector!='') { programResult += '<div><strong>Subsector:</strong> ' + subsector + '</div>';}
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
                    layer.setStyle({ 'fillColor' : usaidRed });
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
        // var geojson = L.geoJSON(countriesMap, {style: solidStyle, onEachFeature: onEachFeature})
        var geojson = L.geoJSON(countriesMap, {onEachFeature: onEachFeature})
            .eachLayer(function (layer) {
                let thislayercountry = layer.feature.properties.name;

                // console.log(countriesList2);

                var int = 0;
                if (exists(countriesList2, thislayercountry) ){ //checking 2 dim array    
                    // layer.addTo(map); //adds countries to map
                    layer.addTo(map).setStyle(solidStyle); //adds countries to map
                    
                    countriesList2.forEach(e => {

                        // console.log ('hi');
                        // console.log(e);

                        if (e[0] == thislayercountry) { //if country matches other list
                            layer.feature.properties["support"] = e[1];

                            // // first round with country registar data in object
                            // if (int == 0){
                            //     layer.feature.properties["support"] = e[1];
                            //     layer.feature.properties["preprimary"] = e[2];
                            //     layer.feature.properties["primary"] = e[3];
                            //     layer.feature.properties["secondary"] = e[4];
                            //     layer.feature.properties["wfdsupport"] = e[6];
                            //     layer.feature.properties["systems"] = e[7];

                            //     layer.feature.properties[e[8]] = []; //set up array
                            //     layer.feature.properties[e[8]].push(e[2], e[3], e[4], e[6], e[7]);

                            //     if (e[8] != ''){
                            //         layer.feature.properties["agencies"] = e[8];
                            //     }

                            //     layer.bindTooltip('<strong>' + layer.feature.properties.name + '</strong>' + '<br>Number of Supporting Agencies: ' + e[1]);
                            // }

                            // // other rounds
                            // else{
                            //     if (e[2] == 1){layer.feature.properties["preprimary"]++;} 
                            //     if (e[3] == 1){layer.feature.properties["primary"]++;} 
                            //     if (e[4] == 1){layer.feature.properties["secondary"]++;} 
                            //     if (e[6] == 1){layer.feature.properties["wfdsupport"]++;} 
                            //     if (e[7] == 1){layer.feature.properties["systems"]++;} 
                                
                            //     layer.feature.properties[e[8]] = []; //set up array
                            //     layer.feature.properties[e[8]].push(e[2], e[3], e[4], e[6], e[7]);

                            //     if (e[8] != ''){
                            //         if (layer.feature.properties["agencies"]){
                            //             layer.feature.properties["agencies"] += ' ' + e[8];
                            //         }
                            //         else {
                            //             layer.feature.properties["agencies"] = e[8];
                            //         }
                            //     }
                            // }

                            // //set color based on # of supporting agencies
                            // // layer.setStyle(colorstyle(layer.feature));
                            // //

                            // layer.setStyle(detailedBaseStyle);
                            // changeFilter();

                            int++;
                        }
                    
                });
            }

            function exists(arr, search) {                
                // return arr.some(row => row == search); //returns true
                return arr.some(row => row.includes(search)); //returns true
            }

            //popup
            layer
                .on('click', function(layer) {
                    $('#countries-select').val(thislayercountry).trigger('change');
                    console.log(this);
                })
            othercountries += thislayercountry;
        });//L.geoJSON eachLayer function


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
        // // var prevLayerClicked = null;
        // function clickFeature(e) {
        //     var layer = e.target;

        //     layer.setStyle({ "fillColor": "#BA0C2F" })
        //     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //         layer.bringToFront();
        //     }
        //     if (prevLayerClicked !== null) {
        //         prevLayerClicked.setStyle(solidStyle);
        //     }
        //     prevLayerClicked = layer;
        // }
        
        // function resetHighlight(e) {
        //     var layer = e.target;
        //     layer.setStyle({ color: '#fff' });
        // }

        // function highlightFeature(e) {
        //     var layer = e.target;
        //     layer.setStyle({ color: '#BA0C2F' });
        //     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //         layer.bringToFront();
        //     }
        // }

        // function onEachFeature(feature, layer) {
        //     layer.on({
        //         mouseover: highlightFeature,
        //         mouseout: resetHighlight,
        //     });
        // }

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
    

    //on change filter

    // On change check the other boxes if they are checked or not
    // Then check against other formulae
    $('#support-filter').on('change', function() {
        changeFilter();
    });

    function changeFilter() {
        console.log ("change filter!!!")
    }

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
        filtercontrol.innerHTML += '<select id="sector-filter"><option value="none">None Selected</option><option value="agriculture">Agriculture & Food Security</option><option value="climate">Climate & Environment</option><option value="democracy">Democracy & Governance</option><option value="economic">Economic Growth</option><option value="education">Education</option><option value="energy">Energy</option><option value="health">Global Health</option><option value="media">Media & Journalism</option><option value="research">Research & Innovation</option><option value="stem">Science, Technology, Engineering, and Mathematics (STEM)</option><option value="water">Water & Sanitation</option><option value="youth">Youth</option></select>';

        return filtercontrol;
    };
    
    mapfilters.addTo(map);
    $(".mapfilter").show();


    //on change filter

    // On change check the other boxes if they are checked or not
    // Then check against other formulae
    $('#sector-filter').on('change', function() {
        changeFilter();
    });

    function changeFilter (){
        console.log("changed!");
        const terms = '';

        supportFilter = $('#sector-filter').val();
        

        geojson.eachLayer(function (layer) {
            // let agencies = layer.feature.properties["agencies"];
            
            let containsSupportTerms = false; 

            // if (agencies) {
            //     containsSupportTerms = terms.every(term => agencies.includes(term));
            // }

            if (supportFilter == "none" && terms == '' ){
                layer.setStyle({fillColor : 'gray'});
            }

            else if(supportFilter == "none"){
                if(containsSupportTerms) {
                    layer.setStyle({fillColor : usaidLightBlue})
                }
                else {
                    layer.setStyle({fillColor : 'gray'})
                }
            }
            

            else if (terms == '' && supportFilter != "none"){

                if(layer.feature.properties[supportFilter] >= 1 && containsSupportTerms) {
                    layer.setStyle({
                        fillColor : usaidLightBlue
                    });
                }
                else {
                    layer.setStyle({fillColor : 'gray'})
                }

            }
            
            else{
                //loop through the terms selected
                let counter = 0;
                let arrayLength = terms.length;
                
                for (let i = 0; i < arrayLength; ) {
                    
                    let term = terms[i];

                    if (layer.feature.properties[term]){ //check if object has term
                        
                        // note this could be improved with keys on the objects
                        // counter is iterated when a match occurs
                        if (supportFilter == 'preprimary' && layer.feature.properties[term][0] == 1 ) {
                            counter++;
                        }
                        if (supportFilter == 'primary' && layer.feature.properties[term][1] == 1 ) {
                            counter++;
                        }
                        if (supportFilter == 'secondary' && layer.feature.properties[term][2] == 1 ) {
                            counter++;
                        }
                        if (supportFilter == 'wfdsupport' && layer.feature.properties[term][3] == 1 ) {
                            counter++;
                        }
                        if (supportFilter == 'systems' && layer.feature.properties[term][4] == 1 ) {
                            counter++;
                        }
                    }

                    i++ //add to i

                    //if it gets to the end, and all agencies have the selected terms  
                    //if counter matches the number of terms
                    if (i == arrayLength && i == counter){
                        if (i == arrayLength && counter == arrayLength ){
                            console.log (i + '  --> ' + arrayLength);
                            layer.setStyle({fillColor : usaidLightBlue});
                        }
                    }
                    
                    else {
                        layer.setStyle({fillColor : 'gray'})
                    }
    

                }//end for

            }

        });

    } // function change filter

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




});