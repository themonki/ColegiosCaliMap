//Key to google spreadsheet
var code = "1pdYkFsQcBX_nnczQfO6EyDWGZKdriZgm7uaCCmvzfus"
//Los datos deben contener una columna que se llame coordenadas (o como lo defina)
// y contener latidud y longitud en formato decimal: '3.3456,-75121'
var columnCoord = "coordenadas";
//Example values in sheet: small_red, small_yellow, etc. See the names of the png file on folder icons. This can be empty.
var columnColorMarker = "color";
//Example values in sheet: http://data.es/icon.png, customIcon/marker.png, etc. The URI to the icon. This can be empty.
var columnsIconMarker = "";
var templatePopUp = "<div class='view' style='font-size: 10px;font-family: sans-serif; width: 300px; overflow: hidden'>\
	<div style='font-size: 18px!important; background-color: #215a9a!important; color: white;'>\
		<b>Nombre Sede:</b> {{row.nombresede}}\
	</div>\
	<div style='color: #215a9a;'>\
		<b>DANE SEDE:</b> {{row.danesede}}<br />\
		<b>Nombre de la IE:</b> {{row.nombredelaie}}<br />\
		<b>DANE PRINCIPAL:</b> {{row.daneprincipal}}<br />\
		<b>Direcci&oacute;n:</b> {{row.dirección}}<br />\
		<b>Direcci&oacute;n Ajustada Manual:</b> {{row.direcciónajustadamanual}}<br />\
		<b>Coordenadas:</b> {{row.coordenadas}}<br />\
		<div style='color: #339966;'>"
			+"<b>Revisados:</b> {{row.revisados}}<br />\
		</div>\
		<div style='color: red;'>"
			+"<b>Sector:</b> {{row.sector}}<br />"
			+"<b>Matr&iacute;cula Contratada:</b> {{row.matriculacontratada}}<br />\
		</div>\
		<b>Zona:</b> {{row.zona}}<br />\
		<b>Comuna:</b> {{row.comuna}}<br />\
		<b>Niveles:</b> {{row.niveles}}<br />\
		<b>Grados:</b> {{row.grados}}<br />\
		<b>Estado:</b> {{row.estado}}<br />\
		<b>Jornadas:</b> {{row.jornadas}}<br />\
		<b>Modelos Educativos:</b> {{row.modeloseducativos}}<br />\
		<b>Tipo:</b> {{row.tipo}}<br />\
		<b>N&uacute;mero Contrato:</b> {{row.númerocontrato}}<br />\
		<a target='_blank' href='https://www.google.com/maps/search/?api=1&query={{row.coordenadas}}'>Abrir en Google Maps</a>\
	</div>\
</div>";

//Solo funciona en el servidor, localmente falla por CORS
//var comunas = createLayerKML('assets/kml/ComunasyCorregimientosCali.kml');
//var poblados = createLayerKML('assets/kml/CentrosPobladosPOT2014.kml');

var idescWMSUri = "http://ws-idesc.cali.gov.co:8081/geoserver/wms?";
var idescAttribution = "&copy; <a href='http://www.cali.gov.co/planeacion/publicaciones/3560/idesc/'>Infraestructura de Datos Espaciales de Santiago de Cali - IDESC</a>";

var comunas = createBaseMapWMS(idescWMSUri,"idesc:mc_comunas",idescAttribution);
var poblados = createBaseMapWMS(idescWMSUri,"pot_2014:bcs_centros_poblados",idescAttribution);
var corregimientos = createBaseMapWMS(idescWMSUri,"idesc:mc_corregimientos",idescAttribution);
var barrios = createBaseMapWMS(idescWMSUri,"idesc:mc_barrios",idescAttribution);
var nomenclatura = createBaseMapWMS(idescWMSUri,"idesc:mc_nomenclatura_ejes_viales",idescAttribution);

//Define otras capas para visualizar
var overlayMaps = {
	//	"Comunas": comunas,
	//	"Centros Poblados POT 2014": poblados,
		"Comunas": comunas,
		"Corregimientos": corregimientos,
		"Centros Poblados POT 2014": poblados,
		"Barrios": barrios,
		"Nomenclatura Ejes Viales": nomenclatura
};

		//idesc:mc_comunas,pot_2014:bcs_centros_poblados,idesc:mc_corregimientos,idesc:mc_barrios,idesc:mc_nomenclatura_ejes_viales
var idescMap = createBaseMapWMS(idescWMSUri,"Mapa base",idescAttribution);

//define mapas base adicionales
var baseMaps = {
		"IDESC": idescMap
	};

var filterVar = [
	{ column: "danesede", label: "Código DANE"},
	{ column: "nombresede", label: "Nombre de la Sede"},
	{ column: "nombredelaie", label: "Nombre del Establecimiento"},
	{ column: "tipo", label: "Tipo"},
	{ column: "comuna", label: "Comuna"},
	{ column: "sector", label: "Sector"},
	{ column: "zona", label: "Zona"},
	{ column: "matriculacontratada", label: "Matrícula Contratada"},
	{ column: "estado", label: "Estado"},
	{ column: "revisados", label: "Calidad de la Georeferenciación"},
	{ column: "jornadas", label: "Jornada (mañana, única, etc.)"},
	{ column: "númerocontrato", label: "No. Contrato"},
	{ column: "niveles", label: "Nivel (preescolar, primaria, etc."},
	{ column: "grados", label: "Grado"}
];

var defaultIconMarker = "icons/small_red.png";


var initialSearch;
var dataSpreadSheet;
var map;
var layerGeojson;
var searchCtrl;
var resultGeojson;


function fetchData(data, tabletop) {
    processData(data);
    dataSpreadSheet = data;
  }
  
function init() {
    var tabletop = Tabletop.init({
			key: code,
			prettyColumnNames: false,
			callback: fetchData,
			simpleSheet: true
		});
}

window.addEventListener('DOMContentLoaded', init);

function onEachFeature(feature, layer) {
	var popupContent = "<p>Sin datos</p>";
	if (feature.properties && feature.properties.popupContent) {
		popupContent = feature.properties.popupContent;
	}
	layer.bindPopup(popupContent);
	feature.layer = layer;
}

function pointToLayer(feature, latlng) {
	var tmpIcon = L.icon({
		iconUrl: feature.properties.icon,
		iconSize: [10, 10],
		popupAnchor: [0, -5],
		shadowUrl: 'icons/shadow.png',
		shadowSize: [11, 11],
		shadowAnchor: [4, 4]
	});
	return L.marker(latlng, {icon: tmpIcon});
}

function filterData(geoJsonFeature){
	return true;
}

function initMap(){
	map = L.map('map').setView([3.45, -76.5], 12);
	map.zoomControl.setPosition('bottomright');
	var baseOSM = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	});
	var google = L.gridLayer.googleMutant({
		type: 'roadmap'	// valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
	}).addTo(map);
	
	map.locate({setView: true, maxZoom: 16});
	
	function onLocationFound(e) {
		var radius = e.accuracy / 2;
		L.marker(e.latlng).addTo(map)
			.bindPopup("Estás a " + radius + " metros de este lugar").openPopup();
		L.circle(e.latlng, radius).addTo(map);
	}

	function onLocationError(e) {
		alert(e.message);
	}

	map.on('locationerror', onLocationError);
	map.on('locationfound', onLocationFound);
	
	layerGeojson = L.geoJson(null,{
		onEachFeature: onEachFeature,
		pointToLayer: pointToLayer
	}).addTo(map);
	
	var baseMapsDefault = {
		"Google Maps" : google,
		"OpenStreetMaps": baseOSM
	};
	
	for(var key in baseMaps){
		baseMapsDefault[key] = (baseMaps[key]);
	}
	L.control.layers(baseMapsDefault,overlayMaps).addTo(map);
	
	searchCtrl = L.control.fuseSearch({
		position: "topleft",
		title: "Buscar",
		panelTitle: "Colegios",
		placeholder: "Busca colegios",
		threshold: 0.0
	});
	searchCtrl.addTo(map);
	
}

function processData(sheet){
	var geojson = {};
		geojson['type'] = 'FeatureCollection';
		geojson['features'] = [];
	var selector = [];
	for(var i in filterVar){
		var col = filterVar[i]["column"];
		selector.push(col);
	}

	for (var i in sheet){
		var data = sheet[i];
		var coor = data[columnCoord];
	
		// compile Handlebars template
		var compilePopUp = Handlebars.compile(templatePopUp);
		var dataPopUp = compilePopUp({row : data});

		//the icons
		var iconUrlDef = data[columnColorMarker] != undefined && data[columnColorMarker] != "" ? 'icons/'+ data[columnColorMarker] +'.png' : defaultIconMarker;
		if (data[columnsIconMarker] != undefined && data[columnsIconMarker] != ""){
			iconUrlDef = data[columnsIconMarker];
		}
		var uriIcon = iconUrlDef;
		var lat = coor.split(",", 2)[0];
		var lon = coor.split(",", 2)[1];
		var newFeature = {
			"geometry": {
				"type": "Point",
				"coordinates": [
					parseFloat(lon),
					parseFloat(lat)
					]
			},
			"type": "Feature",
			"properties": {
				"popupContent": dataPopUp,
				"icon" : uriIcon
			},
			"id" : parseInt(i)
		}
		
		for(var i in filterVar){
			var col = filterVar[i]["column"];
			newFeature.properties[col]=data[col];
		}
		geojson['features'].push(newFeature);
	}
	initialSearch = geojson;
	layerGeojson.addData(geojson);
	searchCtrl.indexFeatures(geojson, selector);
}

initMap();

$(document).ready(function(){
	var searchBar = $("input.search-input");
	searchBar.keyup(searchEvent); 
});

//utilites

function createLayerKML(file){
	return omnivore.kml(file);
}

function createBaseMapWMS(uri, layers, attribution, styles){
	var baseMap = L.tileLayer.wms(uri, {
		layers: layers,
		format: 'image/png',
		transparent: true,
		attribution: attribution,
		styles: styles ? styles : ""
	});
	return baseMap;
}

function searchEvent(e){
	var searchString = e.currentTarget.value;
	searchCtrl.searchFeatures(searchString);
	if(searchString != ""){
		var result = searchCtrl._fuseIndex.search(searchString);
		resultGeojson = {};
		resultGeojson['type'] = 'FeatureCollection';
		resultGeojson['features'] = [];
		for (var i in result) {
			var props = result[i];
			var feature = props._feature;
			resultGeojson['features'].push(feature)
		}
		layerGeojson.clearLayers();
		layerGeojson.addData(resultGeojson);
  } else {
  	layerGeojson.clearLayers();
  	layerGeojson.addData(initialSearch);
  }
  
}
