const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWindow;
const activeRequests = new Set();
let isShuttingDown = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'icons/app-icon.png'),
    frame: false,
    titleBarStyle: 'hidden'
  });

  mainWindow.loadFile('index.html');

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

app.on('before-quit', () => {
  isShuttingDown = true;
  activeRequests.forEach((controller) => controller.abort());
  activeRequests.clear();
});

// Controls
ipcMain.on('minimize-window', () => mainWindow.minimize());
ipcMain.on('maximize-window', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('close-window', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  activeRequests.forEach((controller) => controller.abort());
  activeRequests.clear();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
  }
  app.quit();
});

// Scrape (parallel 10, 50+ источников, decode GitHub API)
ipcMain.on('start-scrape', async (event) => {
  if (isShuttingDown) return;
  const startTime = Date.now();
  let allProxies = new Set();
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
  let processed = 0;
  const safeReply = (channel, payload) => {
    if (isShuttingDown) return;
    const sender = event.sender;
    if (!sender.isDestroyed()) {
      event.reply(channel, payload);
    }
  };

  // Функция для одного источника (GitHub API decode + fallback)
  const fetchSingle = async (url) => {
    if (isShuttingDown) return { success: false, added: 0 };
    const controller = new AbortController();
    activeRequests.add(controller);
    try {
      const response = await axios.get(url, { headers, timeout: 20000, signal: controller.signal });
      let content = response.data.toString().trim();
      if (url.includes('api.github.com')) { // Decode GitHub API JSON base64
        try {
          const data = typeof response.data === 'object' ? response.data : JSON.parse(content);
          if (data.content) {
            content = Buffer.from(data.content, 'base64').toString('utf8').trim();
          }
        } catch (decodeErr) {
          console.error(`GitHub decode error ${url}: ${decodeErr.message} — fallback raw`);
        }
      }
      let proxies = [];
      if (content.startsWith('[')) { // JSON
        try {
          const data = JSON.parse(content);
          (Array.isArray(data) ? data : (data.data || data.proxies || [])).forEach(item => {
            if (typeof item === 'object') {
              const ip = item.ip || item.Ip || item.host;
              const port = item.port || item.Port;
              if (ip && port && isValidProxy(ip, port)) proxies.push(`${ip}:${port}`);
            } else if (typeof item === 'string' && item.includes(':')) {
              const [ip, port] = item.split(':');
              if (isValidProxy(ip, port)) proxies.push(item);
            }
          });
        } catch (jsonErr) {
          console.error(`JSON error ${url}: ${jsonErr.message} — fallback TXT`);
          content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes(':') && !trimmed.startsWith('#')) {
              const [ip, port] = trimmed.split(':', 2);
              if (isValidProxy(ip, port)) proxies.push(trimmed);
            }
          });
        }
      } else { // TXT
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed.includes(':') && !trimmed.startsWith('#')) {
            const [ip, port] = trimmed.split(':', 2);
            if (isValidProxy(ip, port)) proxies.push(trimmed);
          }
        });
      }
      proxies.slice(0, 6000).forEach(p => allProxies.add(p));
      return { success: true, added: proxies.length };
    } catch (e) {
      if (e.name !== 'CanceledError' && !isShuttingDown) {
        console.error(`Error ${url}:`, e.message);
      }
      return { success: false, added: 0 };
    } finally {
      activeRequests.delete(controller);
    }
  };

  // Твои новые источники + предыдущие (50+ всего)
  const sources = [
    // Твои новые raw TXT
    'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt',
    'https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5.txt',
    'https://raw.githubusercontent.com/prxchk/proxy-list/main/socks5.txt',
    'https://raw.githubusercontent.com/proxylist-to/proxy-list/main/socks5.txt',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies_anonymous/socks5.txt',
    'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt',
    'https://raw.githubusercontent.com/WangYihang/Proxy-Verifier/main/sources.yaml',
    'https://raw.githubusercontent.com/gfpcom/free-proxy-list/main/socks5.txt',
    'https://raw.githubusercontent.com/officialputuid/KangProxy/main/socks5.txt',
    'https://raw.githubusercontent.com/shaggymop/boltfn/main/sources.txt',
    'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks4.txt',
    'https://raw.githubusercontent.com/prxchk/proxy-list/main/socks4.txt',
    // Твои новые GitHub API (decode)
    'https://api.github.com/repos/jetkai/proxy-list/contents/online-proxies/txt/proxies-socks5.txt',
    'https://api.github.com/repos/MuRongPIG/Proxy-Master/contents/socks5.txt',
    'https://api.github.com/repos/prxchk/proxy-list/contents/socks5.txt',
    'https://api.github.com/repos/proxylist-to/proxy-list/contents/socks5.txt',
    'https://api.github.com/repos/monosans/proxy-list/contents/proxies/socks5.txt',
    'https://api.github.com/repos/roosterkid/openproxylist/contents/SOCKS5_RAW.txt',
    'https://api.github.com/repos/officialputuid/KangProxy/contents/socks5.txt',
    // Предыдущие + проверенные
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt',
    'https://raw.githubusercontent.com/r00tee/Proxy-List/main/Socks5.txt',
    'https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt',
    'https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5.txt',
    'https://raw.githubusercontent.com/dpangestuw/Free-Proxy/main/socks5.txt',
    'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/socks5.json',
    'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/SOCKS5.txt',
    'https://raw.githubusercontent.com/FrancoStefano/SOCKS-List/master/proxy.txt',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
    'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
    'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/proxy.txt',
    'https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt',
    'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=10000&country=all',
    'https://api.openproxylist.xyz/socks5.txt',
    'https://www.proxy-list.download/api/v1/get?type=socks5',
    'https://raw.githubusercontent.com/gfpcom/free-proxy-list/main/socks5.txt',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
    'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt',
    'https://raw.githubusercontent.com/officialputuid/KangProxy/main/socks5.txt'
  ];

  const batchSize = 10;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(url => fetchSingle(url)));
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        processed++;
        safeReply('scrape-progress', { current: processed, total: sources.length, added: result.value.added, totalUnique: allProxies.size });
      }
    });
    if (isShuttingDown) break;
  }

  // Пагинация Geonode (100 страниц для +40k)
  let page = 1;
  while (page <= 100) {
    if (isShuttingDown) break;
    const controller = new AbortController();
    activeRequests.add(controller);
    try {
      const query = `?limit=1000&page=${page}&protocols=socks5&anonymity=all&sort_by=lastChecked&sort_type=desc`;
      const response = await axios.get(`https://proxylist.geonode.com/api/proxy-list${query}`, { headers, timeout: 20000, signal: controller.signal });
      let proxies = [];
      const data = response.data;
      const items = Array.isArray(data) ? data : (data.data || data.proxies || []);
      items.forEach(item => {
        if (typeof item === 'object') {
          const ip = item.ip || item.Ip || item.host;
          const port = item.port || item.Port;
          if (ip && port && isValidProxy(ip, port)) proxies.push(`${ip}:${port}`);
        }
      });
      if (proxies.length === 0) break;
      proxies.forEach(p => allProxies.add(p));
      processed++;
      safeReply('scrape-progress', { current: processed, total: sources.length + 100, added: proxies.length, totalUnique: allProxies.size });
      page++;
    } catch (e) {
      if (!isShuttingDown && e.name !== 'CanceledError') {
        console.error(`Geonode page ${page}:`, e.message);
      }
      break;
    } finally {
      activeRequests.delete(controller);
    }
  }

  if (isShuttingDown) return;
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const uniqueProxies = Array.from(allProxies).map(p => ({ proxy: p, status: 'collected' }));
  safeReply('scrape-complete', { proxies: uniqueProxies, duration, sourcesCount: sources.length + 1 });
});

function isValidProxy(ip, port) {
  try {
    if (ip === '0.0.0.0' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) return false;
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) return false;
    return ipParts.every(part => {
      const num = parseInt(part);
      return !isNaN(num) && num >= 0 && num <= 255;
    }) && parseInt(port) >= 1 && parseInt(port) <= 65535;
  } catch {
    return false;
  }
}
