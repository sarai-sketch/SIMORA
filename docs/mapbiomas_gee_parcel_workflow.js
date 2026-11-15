// SIMORA - plantilla de Google Earth Engine para resumir MapBiomas por parcela.
// 1) Sustituye ASSET_ID por el ID oficial copiado desde la página de assets MapBiomas Bolivia.
// 2) Sustituye el polígono de ejemplo por el polígono real de la parcela.
// 3) Confirma el nombre de banda/año y la leyenda de la colección elegida antes de ejecutar.
// Este script es una plantilla: no incluye un Asset ID inventado.

var parcel = ee.Geometry.Polygon([
  [[-66.223, -17.330], [-66.207, -17.330], [-66.207, -17.340], [-66.223, -17.340]]
]);

var ASSET_ID = 'PASTE_OFFICIAL_MAPBIOMAS_ASSET_ID_HERE';
var mapbiomas = ee.Image(ASSET_ID);

// Inspecciona las bandas disponibles y selecciona explícitamente el año/banda.
print('Available bands - inspect before selecting:', mapbiomas.bandNames());
// Ejemplo, solo después de confirmar el nombre real de la banda:
// var selectedYear = mapbiomas.select('classification_2025');
// var histogram = selectedYear.reduceRegion({
//   reducer: ee.Reducer.frequencyHistogram(),
//   geometry: parcel,
//   scale: 30,
//   maxPixels: 1e9,
//   bestEffort: true
// });
// print('MapBiomas class pixel counts for parcel:', histogram);

Map.centerObject(parcel, 15);
Map.addLayer(parcel, {color: 'yellow'}, 'SIMORA parcel boundary');
