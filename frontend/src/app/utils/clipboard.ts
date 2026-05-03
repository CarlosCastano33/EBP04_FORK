/**
 * Copia texto al portapapeles usando un método compatible con todos los navegadores
 * Fallback para cuando el Clipboard API no está disponible
 */
export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Intentar primero con el Clipboard API moderno
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => resolve())
        .catch(() => {
          // Si falla, usar el método alternativo
          fallbackCopyToClipboard(text, resolve, reject);
        });
    } else {
      // Usar el método alternativo directamente
      fallbackCopyToClipboard(text, resolve, reject);
    }
  });
}

/**
 * Método alternativo para copiar al portapapeles
 * Usa el método tradicional con document.execCommand
 */
function fallbackCopyToClipboard(
  text: string,
  resolve: () => void,
  reject: (error: Error) => void
) {
  // Crear un elemento textarea temporal
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Hacer el textarea invisible
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  textArea.setAttribute('readonly', '');

  document.body.appendChild(textArea);

  // Seleccionar el texto
  textArea.focus();
  textArea.select();

  try {
    // Ejecutar el comando de copiar
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      resolve();
    } else {
      reject(new Error('No se pudo copiar al portapapeles'));
    }
  } catch (err) {
    document.body.removeChild(textArea);
    reject(err as Error);
  }
}
