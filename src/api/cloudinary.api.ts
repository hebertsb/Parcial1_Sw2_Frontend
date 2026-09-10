const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '';

export class CloudinaryError extends Error {}

/**
 * Sube un archivo directo a Cloudinary desde el navegador (upload preset SIN FIRMAR,
 * no pasa por nuestro backend) y devuelve la `secure_url` resultante.
 *
 * OJO de seguridad: un preset unsigned queda expuesto en el bundle del cliente —
 * cualquiera que lo inspeccione podría subir archivos a esta cuenta de Cloudinary.
 * Aceptable para el alcance de este proyecto (no producción real); si en algún momento
 * hace falta cerrar eso, la alternativa es un upload firmado (el backend genera la firma
 * con la API secret, nunca expuesta al cliente).
 */
export async function subirImagen(archivo: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('upload_preset', UPLOAD_PRESET);
  // Organiza todos los posters en una sola carpeta dentro de la cuenta de Cloudinary, en
  // vez de quedar sueltos en la raíz. Si el upload preset tiene el "Asset folder" fijado
  // en el dashboard de Cloudinary, este valor se ignora silenciosamente (gana el preset).
  formData.append('folder', 'peliculas');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new CloudinaryError(errorBody?.error?.message ?? `Error ${res.status} al subir la imagen a Cloudinary.`);
  }

  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
