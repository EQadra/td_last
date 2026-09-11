// config/detailConfig.ts

export interface DetailField {
  label: string;
  value: any;
}

export interface DetailData {
  title: string;
  description: string;
  imageUrl: string | null;
  mainField: { label: string; value: any } | null;
  extraFields: DetailField[];
  type: string;
  label: string;
  icon: string;
  color: string;
  createdAt: string | null;
  rawData: any;
}

const typeMap: Record<string, { icon: string; label: string; color: string }> = {
  'App\\Models\\Product': { icon: '🛍️', label: 'Producto', color: '#22C55E' },
  'App\\Models\\News': { icon: '📰', label: 'Noticia', color: '#3B82F6' },
  'App\\Models\\Post': { icon: '📝', label: 'Post', color: '#F59E0B' },
  'App\\Models\\Doctor': { icon: '👨‍⚕️', label: 'Doctor', color: '#8B5CF6' },
  'App\\Models\\Lawyer': { icon: '⚖️', label: 'Abogado', color: '#EC4899' },
  'App\\Models\\Shop': { icon: '🏪', label: 'Tienda', color: '#F472B6' },
  'App\\Models\\Association': { icon: '🤝', label: 'Asociación', color: '#F59E0B' },
};

const ignoredFields = [
  'id', 'created_at', 'updated_at', 'deleted_at',
  'image', 'url', 'user_id', 'views', 'last_viewed_at',
  'historyable_id', 'historyable_type', 'favoritable_id', 'favoritable_type'
];

/**
 * 🔥 EXTRACCIÓN CON LOGS
 */
export const extractData = (item: any): DetailData | null => {
  console.log('🔍 === EXTRACT DATA INICIO ===');
  console.log('🔍 item recibido:', JSON.stringify(item, null, 2));

  if (!item) {
    console.log('❌ item es null/undefined');
    return null;
  }

  const type = item.favoritable_type || item.historyable_type || 'default';
  console.log('🔍 type detectado:', type);

  const rawData = item.favoritable || item.historyable || item;
  console.log('🔍 rawData:', JSON.stringify(rawData, null, 2));
  console.log('🔍 rawData keys:', Object.keys(rawData));
  
  if (!rawData || typeof rawData !== 'object') {
    console.log('❌ rawData no es un objeto válido');
    return null;
  }

  const typeInfo = typeMap[type] || { icon: '📌', label: 'Elemento', color: '#6B7280' };

  // 🔥 EXTRAER TÍTULO
  let title = 'Sin título';
  const titleCandidates = ['name', 'titulo', 'title', 'first_name', 'nombre'];
  for (const key of titleCandidates) {
    if (rawData[key]) {
      if (key === 'first_name') {
        const lastName = rawData.last_name || '';
        title = `${rawData.first_name} ${lastName}`.trim();
      } else {
        title = rawData[key];
      }
      console.log(`✅ Título encontrado en "${key}":`, title);
      break;
    }
  }

  // 🔥 EXTRAER DESCRIPCIÓN
  let description = '';
  const descCandidates = ['description', 'descripcion', 'content', 'texto', 'body'];
  for (const key of descCandidates) {
    if (rawData[key]) {
      description = rawData[key];
      console.log(`✅ Descripción encontrada en "${key}":`, description);
      break;
    }
  }

  // 🔥 EXTRAER IMAGEN
  const imageUrl = rawData.image || rawData.url || null;
  console.log('🖼️ imageUrl:', imageUrl);

  // 🔥 EXTRAER CAMPO PRINCIPAL
  let mainField: { label: string; value: any } | null = null;
  
  if (rawData.price !== undefined && rawData.price !== null) {
    mainField = { label: 'Precio', value: `S/ ${rawData.price}` };
    console.log('💰 Campo principal: Precio =', rawData.price);
  } else if (rawData.specialty) {
    mainField = { label: 'Especialidad', value: rawData.specialty };
    console.log('🏥 Campo principal: Especialidad =', rawData.specialty);
  } else if (rawData.city) {
    mainField = { label: 'Ciudad', value: rawData.city };
    console.log('🌆 Campo principal: Ciudad =', rawData.city);
  } else if (rawData.newable?.name) {
    mainField = { label: 'Perfil', value: rawData.newable.name };
    console.log('👤 Campo principal: Perfil =', rawData.newable.name);
  } else if (rawData.user?.name) {
    mainField = { label: 'Autor', value: rawData.user.name };
    console.log('✍️ Campo principal: Autor =', rawData.user.name);
  }

  // 🔥 EXTRAER TODOS LOS CAMPOS
  const extraFields: DetailField[] = [];

  Object.keys(rawData).forEach(key => {
    if (ignoredFields.includes(key)) return;
    if (key === 'first_name' || key === 'last_name') return;
    if (key === 'name' || key === 'titulo' || key === 'title') return;
    if (key === 'description' || key === 'descripcion' || key === 'content') return;
    if (key === 'price' && mainField?.label === 'Precio') return;
    if (key === 'specialty' && mainField?.label === 'Especialidad') return;
    if (key === 'city' && mainField?.label === 'Ciudad') return;
    
    const value = rawData[key];
    if (value === null || value === undefined) return;
    if (typeof value === 'function') return;
    if (typeof value === 'object' && !(value instanceof Date)) {
      if (value && value.name) {
        extraFields.push({ label: key.replace(/_/g, ' ').toUpperCase(), value: value.name });
      }
      return;
    }

    let displayValue = value;
    if (key.includes('_at') && typeof value === 'string') {
      try {
        displayValue = new Date(value).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        displayValue = value;
      }
    }

    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    extraFields.push({ label, value: displayValue });
    console.log(`📋 Campo extra: "${label}" =`, displayValue);
  });

  if (extraFields.length === 0) {
    extraFields.push({ label: 'Sin información adicional', value: '-' });
  }

  const createdAt = item.created_at || rawData.created_at || null;

  const result = {
    title,
    description,
    imageUrl,
    mainField,
    extraFields,
    type,
    label: typeInfo.label,
    icon: typeInfo.icon,
    color: typeInfo.color,
    createdAt,
    rawData,
  };

  console.log('✅ RESULTADO FINAL:', JSON.stringify(result, null, 2));
  console.log('🔍 === EXTRACT DATA FIN ===');

  return result;
};