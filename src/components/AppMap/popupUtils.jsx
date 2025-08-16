export const createPopupContent = (feature) => {
  const props = feature.properties || {};
  const name = props.name || 'Bez názvu';
  const address = props.address?.address_formatted || 'Adresa není k dispozici';
  const desc = props.content || props.perex || '';
  
  // Extract coordinates for navigation
  const coordinates = feature.geometry?.coordinates;
  const lat = coordinates ? coordinates[1] : null;
  const lng = coordinates ? coordinates[0] : null;
  
  // Create navigation links
  const hasCoordinates = lat && lng;
  const googleMapsUrl = hasCoordinates ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null;
  const mapyCzUrl = hasCoordinates ? `https://mapy.cz/zakladni?plan=motorcar&y=${lat}&x=${lng}&z=17` : null;
  
  // Create buttons instead of plain links
  const urlButton = props.url ? 
    `<a href="${props.url}" target="_blank" class="btn btn-sm btn-primary">Web</a>` : '';
  
  const googleMapsButton = hasCoordinates ? 
    `<a href="${googleMapsUrl}" target="_blank" class="btn btn-sm btn-secondary">Google Maps</a>` : '';
  
  const mapyCzButton = hasCoordinates ? 
    `<a href="${mapyCzUrl}" target="_blank" class="btn btn-sm btn-accent">Mapy.cz</a>` : '';
  
  const image = props.image?.url ? `<img src="${props.image.url}" alt="${name}" class="mt-4 w-[90%] mx-auto h-auto rounded block" />` : '';
  
  // Check if this is a playground feature
  const isPlayground = props.type === 'playground' || props.category === 'playground';
  // Check if this is a park feature
  const isPark = props.type === 'park' || props.category === 'garden';
  // Check type
  const isGarden = props.type === 'garden' || props.category === 'garden';
  
  // Only show image for non-park features
  const displayImage = !isPark && props.image?.url ? 
    `<img src="${props.image.url}" alt="${name}" class="mt-4 w-[90%] mx-auto h-auto rounded block" />` : 
    '';

  // Hero: garden = strom, jinak obrázek (pokud je)
  const hero = isGarden
    ? `<div class="popup-hero icon-hero">🌳</div>`
    : (props.image?.url
        ? `<img src="${props.image.url}" alt="${name}" class="mt-4 w-[90%] mx-auto h-auto rounded block" />`
        : '');

  const propertiesList = props.properties?.length 
    ? props.properties
        .filter(p => p.description) // Only include properties that have a description
        .map(p => {
          // For all features including playgrounds, show both description and value if value exists
          return `<p><b>${p.description}:</b> ${p.value || ''}</p>`;
        })
        .join('') 
    : '';

  return `<div class="popup-content p-4 bg-white rounded">
      ${hero}
      <h2 class="text-2xl font-bold mt-4 mb-2 text-primary">${name}</h2>
      <div class="divider my-2"></div>
      ${desc ? `<p class="my-3 text-base whitespace-normal break-words">${desc}</p><div class="divider my-2"></div>` : ''}
      <p class="text-sm text-base-content my-2">${address}</p>
      ${(urlButton || googleMapsButton || mapyCzButton) ? 
        `<div class="flex flex-wrap gap-2 my-3">
          
          ${googleMapsButton}
          ${mapyCzButton}
        </div>` : ''}
      ${propertiesList ? `<div class="divider my-2"></div><div class="properties text-sm my-2">${propertiesList}</div>` : ''}
    </div>`;
};