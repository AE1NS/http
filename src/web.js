import { WebPlugin } from '@capacitor/core';
export class HttpPluginWeb extends WebPlugin {
  constructor() {
    super({
      name: 'Http',
      platforms: ['web', 'electron'],
    });
  }
  getRequestHeader(headers, key) {
    const originalKeys = Object.keys(headers);
    const keys = Object.keys(headers).map(k => k.toLocaleLowerCase());
    const lowered = keys.reduce((newHeaders, key, index) => {
      newHeaders[key] = headers[originalKeys[index]];
      return newHeaders;
    }, {});
    return lowered[key.toLocaleLowerCase()];
  }
  nativeHeadersToObject(headers) {
    const h = {};
    headers.forEach((value, key) => {
      h[key] = value;
    });
    return h;
  }
  makeFetchOptions(options, fetchExtra) {
    const req = Object.assign(
      { method: options.method || 'GET', headers: options.headers },
      fetchExtra || {},
    );
    const contentType =
      this.getRequestHeader(options.headers || {}, 'content-type') || '';
    if (contentType.indexOf('application/json') === 0) {
      req['body'] = JSON.stringify(options.data);
    } else if (
      contentType.indexOf('application/x-www-form-urlencoded') === 0 ||
      contentType.indexOf('multipart/form-data') === 0
    ) {
      const urlSearchParams = new URLSearchParams();
      for (let key of Object.keys(options.data)) {
        urlSearchParams.set(key, options.data[key]);
      }
      req['body'] = urlSearchParams.toString();
    }
    return req;
  }
  async request(options) {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);
    const ret = await fetch(options.url, fetchOptions);
    const contentType = ret.headers.get('content-type');
    let data;
    if (contentType && contentType.indexOf('application/json') === 0) {
      data = await ret.json();
    } else {
      data = await ret.text();
    }
    return {
      status: ret.status,
      data,
      headers: this.nativeHeadersToObject(ret.headers),
    };
  }
  async setCookie(options) {
    var expires = '';
    if (options.ageDays) {
      const date = new Date();
      date.setTime(date.getTime() + options.ageDays * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie =
      options.key + '=' + (options.value || '') + expires + '; path=/';
  }
  async getCookies(_options) {
    if (!document.cookie) {
      return { value: [] };
    }
    var cookies = document.cookie.split(';');
    return {
      value: cookies.map(c => {
        const cParts = c.split(';').map(cv => cv.trim());
        const cNameValue = cParts[0];
        const cValueParts = cNameValue.split('=');
        const key = cValueParts[0];
        const value = cValueParts[1];
        return {
          key,
          value,
        };
      }),
    };
  }
  async deleteCookie(options) {
    document.cookie = options.key + '=; Max-Age=0';
  }
  async clearCookies(_options) {
    document.cookie
      .split(';')
      .forEach(
        c =>
          (document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)),
      );
  }
  async uploadFile(options) {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);
    const formData = new FormData();
    formData.append(options.name, options.blob);
    await fetch(
      options.url,
      Object.assign(Object.assign({}, fetchOptions), {
        body: formData,
        method: 'POST',
      }),
    );
    return {};
  }
  async downloadFile(options) {
    const fetchOptions = this.makeFetchOptions(options, options.webFetchExtra);
    const ret = await fetch(options.url, fetchOptions);
    const blob = await ret.blob();
    return {
      blob,
    };
  }
}
//# sourceMappingURL=web.js.map
