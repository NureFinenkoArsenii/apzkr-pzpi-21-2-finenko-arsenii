import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

function MapWrapper({ mapState, saveMapState }) {
    const map = useMap();

    useEffect(() => {
        window.mapInstance = map;

        map.setView(mapState.center, mapState.zoom);

        map.on('moveend', () => {
            saveMapState({
                center: [map.getCenter().lat, map.getCenter().lng],
                zoom: map.getZoom(),
            });
        });

        return () => {
            map.off('moveend');
        };
    }, [map, mapState, saveMapState]);

    return null;
}

export default MapWrapper;