import { useEffect, useState } from 'react';
import { ExternalLink, Layers3, MapPinned, Flame, Droplets, Satellite, RefreshCw, RadioTower } from 'lucide-react';
import './land-data-panel.css';

type Props = { apiBaseUrl: string; latitude: number; longitude: number; parcelName: string };
type SourceInfo = {
  mapbiomas?: { name: string; status: string; collection: string; coverage_years: string; spatial_resolution_m: number; land_cover_classes: number; method_note: string; platform_url: string; assets_url: string; downloads_url: string };
  senamhi?: { name: string; status: string; collections_url: string; service_url: string; method_note: string };
};
type CollectionResponse = { status: string; collections?: { id?: string; title?: string; description?: string }[]; note?: string };
type StationResponse = { status: string; count?: number; stations?: { id?: string; name: string; geometry?: unknown }[]; note?: string };

export default function LandDataPanel({ apiBaseUrl, latitude, longitude, parcelName }: Props) {
  const [sources, setSources] = useState<SourceInfo | null>(null);
  const [collections, setCollections] = useState<CollectionResponse>({ status: 'loading' });
  const [stations, setStations] = useState<StationResponse>({ status: 'loading' });
  const [expanded, setExpanded] = useState<'mapbiomas' | 'senamhi' | null>('mapbiomas');

  async function load() {
    setCollections({ status: 'loading' });
    setStations({ status: 'loading' });
    try {
      const base = apiBaseUrl.replace(/\/$/, '');
      const [sourceRes, collectionRes, stationRes] = await Promise.all([
        fetch(`${base}/api/land/sources`),
        fetch(`${base}/api/land/senamhi/collections`),
        fetch(`${base}/api/land/senamhi/stations?limit=20`),
      ]);
      if (sourceRes.ok) setSources(await sourceRes.json());
      if (collectionRes.ok) setCollections(await collectionRes.json());
      else setCollections({ status: 'unavailable', note: `SENAMHI returned HTTP ${collectionRes.status}` });
      if (stationRes.ok) setStations(await stationRes.json());
      else setStations({ status: 'unavailable', note: `SENAMHI returned HTTP ${stationRes.status}` });
    } catch {
      setCollections({ status: 'unavailable', note: 'Could not reach the SIMORA API.' });
      setStations({ status: 'unavailable', note: 'Could not reach the SIMORA API.' });
    }
  }

  useEffect(() => { void load(); }, [apiBaseUrl, latitude, longitude]);
  const map = sources?.mapbiomas;
  const sen = sources?.senamhi;

  return <section className="card land-data-panel">
    <div className="land-data-head">
      <div><span className="eyebrow">LAND INTELLIGENCE</span><h3><Layers3 size={18}/> Land history & national data</h3><p>{parcelName} · {latitude.toFixed(4)}, {longitude.toFixed(4)}</p></div>
      <button className="secondary land-refresh" onClick={() => void load()} title="Refresh source status"><RefreshCw size={15}/></button>
    </div>

    <article className="land-source-card">
      <button className="land-source-toggle" onClick={() => setExpanded(expanded === 'mapbiomas' ? null : 'mapbiomas')}>
        <span className="land-source-icon"><Satellite size={20}/></span>
        <span className="land-source-title"><strong>MapBiomas Bolivia</strong><small>Land cover, water and fire history</small></span>
        <span className="land-source-badge catalog">Official catalogue</span>
      </button>
      {expanded === 'mapbiomas' && <div className="land-source-body">
        <div className="land-stat-grid"><div><strong>{map?.coverage_years || '1985–2025'}</strong><small>Historical series</small></div><div><strong>{map?.spatial_resolution_m || 30} m</strong><small>Pixel resolution</small></div><div><strong>{map?.land_cover_classes || 29}</strong><small>Land-cover classes</small></div></div>
        <p>Use this source to review annual land-cover transitions, water-surface history and burned areas around the selected property. These are landscape-history products, not soil-fertility tests.</p>
        <div className="land-product-list"><span><MapPinned size={14}/> Annual land cover and land use</span><span><Droplets size={14}/> Annual/monthly water surface</span><span><Flame size={14}/> Burned-area history and alerts</span></div>
        <div className="land-source-warning">Parcel-specific pixel statistics are not yet calculated inside SIMORA. MapBiomas provides official GEE assets; a parcel polygon must be intersected with those rasters to produce a measured result.</div>
        <div className="land-links"><a href={map?.platform_url || 'https://bolivia.mapbiomas.org/'} target="_blank" rel="noreferrer">Explore platform <ExternalLink size={13}/></a><a href={map?.assets_url || 'https://bolivia.mapbiomas.org/downloads/assets-en-google-earth-engine/'} target="_blank" rel="noreferrer">GEE assets <ExternalLink size={13}/></a><a href={map?.downloads_url || 'https://bolivia.mapbiomas.org/downloads/'} target="_blank" rel="noreferrer">Downloads <ExternalLink size={13}/></a></div>
      </div>}
    </article>

    <article className="land-source-card">
      <button className="land-source-toggle" onClick={() => setExpanded(expanded === 'senamhi' ? null : 'senamhi')}>
        <span className="land-source-icon"><RadioTower size={20}/></span>
        <span className="land-source-title"><strong>SENAMHI Bolivia</strong><small>Weather stations and observations</small></span>
        <span className={`land-source-badge ${collections.status === 'live' ? 'live' : 'catalog'}`}>{collections.status === 'live' ? 'Connected' : collections.status === 'loading' ? 'Checking' : 'Catalogue'}</span>
      </button>
      {expanded === 'senamhi' && <div className="land-source-body">
        <div className="land-stat-grid"><div><strong>{collections.collections?.length ?? '—'}</strong><small>Collections found</small></div><div><strong>{stations.count ?? '—'}</strong><small>Stations returned</small></div><div><strong>{stations.status === 'live' ? 'Live' : '—'}</strong><small>Station service</small></div></div>
        {collections.collections?.length ? <div className="land-collection-list">{collections.collections.map((c, i) => <div key={c.id || i}><strong>{c.title || c.id || 'Collection'}</strong><small>{c.description || c.id}</small></div>)}</div> : <p>{collections.note || 'Checking the public SENAMHI service…'}</p>}
        {stations.stations?.length ? <p className="land-source-note">The service returned {stations.count} station features in this sample request. This is not yet a nearest-station match; stations must be filtered by geographic distance and elevation before being used as parcel context.</p> : <p className="land-source-note">{stations.note || 'No station features returned in this request.'}</p>}
        <div className="land-source-warning">Station observations are point measurements. SIMORA must calculate distance, elevation difference and data recency before treating a station as representative of this parcel.</div>
        <div className="land-links"><a href="https://wis.senamhi.gob.bo/oapi/collections?f=html" target="_blank" rel="noreferrer">SENAMHI data collections <ExternalLink size={13}/></a><a href="https://sena.senamhi.gob.bo/" target="_blank" rel="noreferrer">SENAMHI services <ExternalLink size={13}/></a></div>
      </div>}
    </article>
    <p className="land-data-foot">Source status is retrieved from the SIMORA backend. A catalogue link or successful API connection does not mean a parcel-level value has been calculated.</p>
  </section>;
}
