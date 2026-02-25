/**
 * Utility functions to parse device information from User-Agent string
 */

interface DeviceInfo {
  deviceName: string;
  browser: string;
  os: string;
  deviceType: string;
}

/**
 * Parse user agent string to extract device information
 * @param userAgent - User-Agent header string
 * @returns DeviceInfo object with parsed information
 */
export function parseDeviceInfo(userAgent: string): DeviceInfo {
  if (!userAgent || userAgent === 'unknown') {
    return {
      deviceName: 'Unknown Device',
      browser: 'Unknown',
      os: 'Unknown',
      deviceType: 'Unknown',
    };
  }

  const ua = userAgent.toLowerCase();
  let deviceName = 'Unknown Device';
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'Desktop';

  // Detect Browser
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    browser = 'Internet Explorer';
  }

  // Detect OS and Device Type
  if (ua.includes('windows')) {
    if (ua.includes('windows nt 10')) {
      os = 'Windows 10/11';
    } else if (ua.includes('windows nt 6.3')) {
      os = 'Windows 8.1';
    } else if (ua.includes('windows nt 6.2')) {
      os = 'Windows 8';
    } else if (ua.includes('windows nt 6.1')) {
      os = 'Windows 7';
    } else {
      os = 'Windows';
    }
    deviceType = 'Desktop';
    deviceName = `${os} Desktop`;
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    const macVersion = ua.match(/mac os x (\d+[._]\d+)/);
    if (macVersion) {
      os = `macOS ${macVersion[1].replace('_', '.')}`;
    } else {
      os = 'macOS';
    }
    deviceType = 'Desktop';
    deviceName = `${os} Desktop`;
  } else if (ua.includes('android')) {
    const androidVersion = ua.match(/android ([\d.]+)/);
    const androidModel = ua.match(/android.*?;\s*([^)]+)\)/);
    
    if (androidModel) {
      const model = androidModel[1].trim();
      // Clean up common model names
      deviceName = model
        .replace(/build/i, '')
        .replace(/wv\)/i, '')
        .trim();
      
      // Extract brand/model if available
      if (ua.includes('samsung')) {
        deviceName = `Samsung ${deviceName}`;
      } else if (ua.includes('xiaomi')) {
        deviceName = `Xiaomi ${deviceName}`;
      } else if (ua.includes('huawei')) {
        deviceName = `Huawei ${deviceName}`;
      } else if (ua.includes('oneplus')) {
        deviceName = `OnePlus ${deviceName}`;
      } else if (ua.includes('oppo')) {
        deviceName = `OPPO ${deviceName}`;
      } else if (ua.includes('vivo')) {
        deviceName = `Vivo ${deviceName}`;
      } else if (ua.includes('realme')) {
        deviceName = `Realme ${deviceName}`;
      } else if (ua.includes('pixel')) {
        deviceName = `Google Pixel ${deviceName}`;
      }
    } else {
      deviceName = 'Android Device';
    }
    
    if (androidVersion) {
      os = `Android ${androidVersion[1]}`;
    } else {
      os = 'Android';
    }
    deviceType = 'Mobile';
  } else if (ua.includes('iphone')) {
    const iosVersion = ua.match(/os (\d+[._]\d+)/);
    const iphoneModel = ua.match(/iphone\s*(\w+)/);
    
    if (iphoneModel) {
      deviceName = `iPhone ${iphoneModel[1]}`;
    } else {
      deviceName = 'iPhone';
    }
    
    if (iosVersion) {
      os = `iOS ${iosVersion[1].replace('_', '.')}`;
    } else {
      os = 'iOS';
    }
    deviceType = 'Mobile';
  } else if (ua.includes('ipad')) {
    const iosVersion = ua.match(/os (\d+[._]\d+)/);
    deviceName = 'iPad';
    if (iosVersion) {
      os = `iPadOS ${iosVersion[1].replace('_', '.')}`;
    } else {
      os = 'iPadOS';
    }
    deviceType = 'Tablet';
  } else if (ua.includes('linux')) {
    os = 'Linux';
    deviceType = 'Desktop';
    deviceName = 'Linux Desktop';
  } else if (ua.includes('ubuntu')) {
    os = 'Ubuntu';
    deviceType = 'Desktop';
    deviceName = 'Ubuntu Desktop';
  }

  // Clean up device name
  if (deviceName === 'Unknown Device') {
    deviceName = `${os} ${deviceType}`;
  }

  return {
    deviceName: deviceName.trim(),
    browser,
    os,
    deviceType,
  };
}

/**
 * Get a friendly device name from user agent
 * @param userAgent - User-Agent header string
 * @returns Friendly device name string
 */
export function getDeviceName(userAgent: string): string {
  return parseDeviceInfo(userAgent).deviceName;
}

