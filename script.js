// script.js - maneja el canvas, la carga de la fuente, QR y descarga

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('nameInput');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const canvas = document.getElementById('graffitiCanvas');

  // Crea el QR con la URL actual
  function makeQRCode() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    const url = window.location.href;
    new QRCode(qrContainer, { text: url, width: 200, height: 200 });
  }

  // Función para dibujar: espera a que la fuente esté cargada
  async function drawText() {
    // espera que la fuente esté lista (evita que canvas use una fuente por defecto)
    try {
      await document.fonts.load('120px "MiFuenteGrafiti"');
      await document.fonts.ready;
    } catch (e) {
      console.warn('No se pudo asegurar la carga de la fuente', e);
    }

    // ajusta resolución para pantallas retina
    const ratio = window.devicePixelRatio || 1;
    const displayW = 1000; // en CSS pixels
    const displayH = 400;
    canvas.width = Math.floor(displayW * ratio);
    canvas.height = Math.floor(displayH * ratio);
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';

    const ctx = canvas.getContext('2d');
    // escalar context para que el texto no se vea borroso
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // fondo
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, displayW, displayH);

    const name = (input.value || 'Grafiti').toUpperCase();

    // tamaño de fuente según longitud (ajusta para que encaje)
    const fontSize = Math.min(200, Math.max(80, Math.floor(displayW / Math.max(4, name.length) * 1.4)));
    ctx.font = `${fontSize}px "MiFuenteGrafiti"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    // sombra / glow
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 20;

    // degradado relleno
    const grad = ctx.createLinearGradient(0, 0, displayW, 0);
    grad.addColorStop(0, '#ff0055');
    grad.addColorStop(1, '#00eaff');
    ctx.fillStyle = grad;
    ctx.fillText(name, displayW/2, displayH/2);

    // contorno
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(6, Math.floor(fontSize * 0.06));
    ctx.strokeStyle = '#111';
    ctx.strokeText(name, displayW/2, displayH/2);

    // vuelve a generar el QR por si la URL cambió (por ejemplo si hay ?name=)
    makeQRCode();
  }

  generateBtn.addEventListener('click', () => drawText());

  downloadBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const safeName = (input.value || 'grafiti').replace(/\s+/g,'_');
    a.href = dataURL;
    a.download = `${safeName}.png`;
    a.click();
  });

  // Si la URL trae ?name=, pre-llenar y dibujar
  const params = new URLSearchParams(window.location.search);
  const nameParam = params.get('name');
  if (nameParam) {
    input.value = nameParam;
    drawText();
  } else {
    // muestra QR inicial
    makeQRCode();
  }
});
