import mapboxgl from "mapbox-gl";

function getMapboxLayersForLegend(
  map: mapboxgl.Map,
  mapLegendLayerIds: string,
): mapboxgl.Layer[] {
  const layerIds = mapLegendLayerIds.split(",");
  const matchingLayers: mapboxgl.Layer[] = [];

  layerIds.forEach((layerId) => {
    layerId = layerId.trim();

    // Check if the map has this layer
    const layer: mapboxgl.Layer | undefined = map.getLayer(layerId);

    if (layer) {
      // Get the layer object and add it to the matchingLayers array
      matchingLayers.push(layer);
    } else {
      console.warn(`Layer with ID "${layerId}" not found.`);
    }
  });

  return matchingLayers;
}

export function prepareMapLegendLayers(
  map: mapboxgl.Map,
  mapLegendLayerIds: string | null,
  mapeoLegendColor: string | null,
): any[] | undefined {
  if (!mapLegendLayerIds || !map.isStyleLoaded()) {
    return;
  }

  const mapboxLayersForLegend = getMapboxLayersForLegend(
    map,
    mapLegendLayerIds,
  );

  // Prepare object with type, id, and color for each layer in the map legend
  const mapLegendContent = mapboxLayersForLegend
    .map((layer) => {
      const layerId = layer.id;
      const layerType = layer.type;
      let layerColor = map.getPaintProperty(layerId, `${layerType}-color`);

      if (!layerColor) {
        return;
      }

      const layerColorField = layerColor[3];
      if (Array.isArray(layerColorField) && mapeoLegendColor) {
        layerColor = mapeoLegendColor;
      }

      let formattedId = layerId
        .replace(/-/g, " ")
        .replace(/^\w/, (m) => m.toUpperCase());

      // if formattedId ends with polygon or linestring, remove it
      formattedId = formattedId.replace(/ polygon| linestring$/i, "");

      return {
        id: formattedId,
        type: layerType,
        color: layerColor,
      };
    })
    .filter(Boolean);

  if (mapLegendContent.length === 0) {
    return;
  }

  return mapLegendContent;
}

// Function to reverse [long, lat] coordinates and remove the brackets
export function prepareCoordinatesForSelectedFeature(
  coordinates: string,
): string {
  if (typeof coordinates === "object") {
    coordinates = JSON.stringify(coordinates);
  }

  return coordinates
    .replace("[", "")
    .replace("]", "")
    .split(",")
    .reverse()
    .join(",");
}
