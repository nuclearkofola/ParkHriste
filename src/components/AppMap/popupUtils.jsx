export const createPopupContent = (feature) => {
  const props = feature.properties || {};
  const name = props.name || 'Bez názvu';
  const address = props.address?.address_formatted || 'Adresa není k dispozici';
  const desc = props.content || props.perex || '';
  const url = props.url ? `<a href="${props.url}" target="_blank" class="link link-primary">Web</a>` : '';
  const image = props.image?.url ? `<img src="${props.image.url}" alt="${name}" class="mt-2 w-full h-auto rounded" />` : '';

  const propertiesList = props.properties?.length 
    ? props.properties.map(p => `<p><b>${p.description}:</b> ${p.value}</p>`).join('') 
    : '';

  return `<div class="p-4 bg-white rounded shadow max-w-md">
      <h2 class="text-xl font-bold">${name}</h2>
      ${desc ? `<p class="mt-2">${desc}</p>` : ''}
      <p class="text-sm text-base-content mt-2">${address}</p>
      ${url ? `<p class="mt-2">${url}</p>` : ''}
      ${propertiesList}
      ${image}
    </div>`;
};