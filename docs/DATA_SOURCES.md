# SIMORA — Data sources and provenance

| Source | Product/use | Resolution/coverage | Integration status |
|---|---|---|---|
| NASA POWER | Historical gridded meteorological context | Coordinate-based gridded product; check product metadata | Existing API connection in SIMORA |
| MapBiomas Bolivia | Land cover/use, water, fire history | Collection 4 land cover 1985–2025; 30 m; 29 classes | Official catalogue and asset links displayed; parcel raster sampling requires GEE setup |
| SENAMHI Bolivia | Station catalogue and observations exposed through WIS OGC API | Station-based; varies by station and collection | Live collection/station discovery endpoint added; nearest representative station and observation-series matching remain to be implemented |
| SIMORA soil assumptions | Example water capacity by declared texture | Illustrative only | Clearly labelled as assumptions; not soil chemistry measurements |

Official links:
- MapBiomas Bolivia: https://bolivia.mapbiomas.org/
- MapBiomas land cover: https://bolivia.mapbiomas.org/iniciativas-y-productos/cobertura-y-uso-del-suelo/cobertura/
- MapBiomas GEE assets: https://bolivia.mapbiomas.org/downloads/assets-en-google-earth-engine/
- MapBiomas downloads: https://bolivia.mapbiomas.org/downloads/
- SENAMHI WIS OGC API collections: https://wis.senamhi.gob.bo/oapi/collections?f=html
- SENAMHI public services: https://sena.senamhi.gob.bo/
- NASA POWER: https://power.larc.nasa.gov/

Always retain the source name, collection/product, timestamp, spatial resolution and processing method with any derived value.
