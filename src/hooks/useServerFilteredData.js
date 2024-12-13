'use server';

export default async function useServerFilteredData(data, search) {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  if (!search) {
    return data;
  }

  const searchLower = search.toLowerCase();

  return data.filter(item =>
    item.id.toString().toLowerCase().includes(searchLower) ||
    (item.contact_name && item.contact_name.toLowerCase().includes(searchLower))
  );
}
