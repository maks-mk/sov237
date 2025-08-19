(function(){
  async function generateCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200; canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = '#069';
      ctx.fillText(navigator.userAgent.slice(0, 32), 2, 2);
      const data = canvas.toDataURL();
      return data.slice(-32);
    } catch { return 'nocanvas'; }
  }

  async function generateFingerprint() {
    const data = {
      userAgent: navigator.userAgent || '',
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
      language: navigator.language || '',
      languages: (navigator.languages || []).slice(0,4),
      deviceMemory: navigator.deviceMemory || null,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      canvas: await generateCanvasFingerprint()
    };
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch {
      return btoa(JSON.stringify(data));
    }
  }

  window.generateFingerprint = generateFingerprint;
})();
