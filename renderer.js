let proxies = [];
let autoRefreshInterval;
let isScraping = false;

document.addEventListener('DOMContentLoaded', () => {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const exportBtn = document.getElementById('exportBtn');
  const refreshToggle = document.getElementById('refreshToggle');
  const progress = document.getElementById('progress');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const progressAdded = document.getElementById('progressAdded');
  const proxyCount = document.getElementById('proxyCount');
  const statsView = document.getElementById('statsView');
  const statsText = document.getElementById('statsText');

  window.electronAPI.onProgress((_, data) => {
    if (!isScraping) return;

    const totalEst = data.total || 135;
    const percent = Math.min((data.current / totalEst) * 100, 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${data.current}/${totalEst} items`;
    progressAdded.textContent = `Unique: ${data.totalUnique}`;
  });

  window.electronAPI.onComplete((_, data) => {
    proxies = Array.isArray(data.proxies) ? data.proxies : [];
    const duration = data.duration || '0.0';
    const sourcesCount = data.sourcesCount || 0;

    isScraping = false;
    progress.classList.add('hidden');
    scrapeBtn.disabled = false;
    scrapeBtn.textContent = 'Grab Proxies';

    proxyCount.textContent = `${proxies.length} proxies loaded`;
    proxyCount.classList.remove('hidden');

    exportBtn.disabled = proxies.length === 0;

    updateStats(duration, sourcesCount);
  });

  scrapeBtn.addEventListener('click', () => {
    if (isScraping) return;

    isScraping = true;
    scrapeBtn.disabled = true;
    scrapeBtn.textContent = 'Scraping...';
    progress.classList.remove('hidden');

    proxies = [];
    proxyCount.classList.add('hidden');
    exportBtn.disabled = true;
    statsView.classList.add('hidden');

    window.electronAPI.startScrape();
  });

  exportBtn.addEventListener('click', () => {
    if (!proxies.length) return;

    const txt = proxies.map((entry) => entry.proxy).join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `socks5_proxies_max_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  });

  refreshToggle.addEventListener('click', () => {
    const isOn = refreshToggle.classList.contains('active');

    if (isOn) {
      clearInterval(autoRefreshInterval);
      refreshToggle.classList.remove('active');
      refreshToggle.textContent = 'Auto Refresh Off';
    } else {
      autoRefreshInterval = setInterval(() => scrapeBtn.click(), 1_800_000);
      refreshToggle.classList.add('active');
      refreshToggle.textContent = 'Auto Refresh On';
    }
  });

  function updateStats(duration, sourcesCount) {
    const note = proxies.length < 10_000
      ? '<p class="note">Partial sweep captured - trigger another pass for even fresher nodes.</p>'
      : '<p class="note success">Pro collection complete. The pool is saturated.</p>';

    statsText.innerHTML = `
      <div class="stats-grid">
        <p><span class="highlight">${proxies.length.toLocaleString()}</span> unique SOCKS5 proxies</p>
        <p>Harvested from <span class="highlight">${sourcesCount}</span> curated sources</p>
        <p>Completed in <span class="highlight">${duration}s</span></p>
        ${note}
        <p class="note subtle">Export the list to work with it externally.</p>
      </div>
    `;
    statsView.classList.remove('hidden');
  }
});
