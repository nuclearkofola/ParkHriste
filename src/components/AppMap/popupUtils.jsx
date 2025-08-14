export const createPopupContent = (feature) => {
  const props = feature.properties || {};
  const name = props.name || 'Bez názvu';
  const address = props.address?.address_formatted || 'Adresa není k dispozici';
  const desc = props.content || props.perex || '';
  const url = props.url ? `<a href="${props.url}" target="_blank" class="link link-primary">Web</a>` : '';
  const image = props.image?.url ? `<img src="${props.image.url}" alt="${name}" class="mt-4 w-[90%] mx-auto h-auto rounded block" />` : '';
  
  // Check if this is a playground feature
  const isPlayground = props.type === 'playground' || props.category === 'playground';

  const propertiesList = props.properties?.length 
    ? props.properties
        .filter(p => p.description) // Only include properties that have a description
        .map(p => {
          // For playgrounds, only show description without value
          if (isPlayground) {
            return `<p><b>${p.description}</b></p>`;
          }
          // For other features, show both description and value if value exists
          return `<p><b>${p.description}:</b> ${p.value || ''}</p>`;
        })
        .join('') 
    : '';

  return `<div class="popup-content p-4 bg-white rounded">
      ${image}
      <h2 class="text-2xl font-bold mt-4 mb-2 text-primary">${name}</h2>
      <div class="divider my-2"></div>
      ${desc ? `<p class="my-3 text-base">${desc}</p><div class="divider my-2"></div>` : ''}
      <p class="text-sm text-base-content my-2">${address}</p>
      ${url ? `<p class="mt-3 text-sm">${url}</p>` : ''}
      ${propertiesList ? `<div class="divider my-2"></div><div class="properties text-sm my-2">${propertiesList}</div>` : ''}
    </div>`;
};