const os = require('os');
console.log(JSON.stringify({
  success: true,
  data: {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    uptime: os.uptime(),
    userInfo: os.userInfo().username
  }
}));
