// utils/fileUtils.js
function formatDuration(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    totalSeconds %= (24 * 3600);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }
  
  module.exports = { formatDuration };
  