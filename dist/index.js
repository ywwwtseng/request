// src/index.ts
var Request = class {
  baseUrl;
  headers;
  transformRequest;
  transformResponse;
  onResponse;
  onError;
  constructor({
    baseUrl,
    headers,
    transformRequest,
    transformResponse,
    onResponse,
    onError
  } = {}) {
    this.baseUrl = baseUrl || "";
    this.headers = headers;
    this.transformRequest = transformRequest;
    this.transformResponse = transformResponse;
    this.onResponse = onResponse;
    this.onError = onError;
  }
  async request(url, options) {
    let headers = new Headers({ ...this.headers, ...options?.headers });
    if (!headers.get("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
    if (this.transformRequest) {
      headers = this.transformRequest(headers);
    }
    const res = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers
    });
    if (this.onResponse) {
      this.onResponse(res);
    }
    if (this.transformResponse) {
      const data = await this.transformResponse(res);
      if (data) return data;
    }
    try {
      if (res.status < 200 || res.status >= 300) {
        const data = await res.json();
        const status = res.status;
        if (this.onError) {
          this.onError(data, status, res);
        }
        throw { status, data };
      } else if (res.headers.get("Content-Type") === "application/octet-stream") {
        const data = await res.blob();
        return data;
      } else {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      throw error;
    }
  }
  get(url, options) {
    return this.request(url, options);
  }
  post(url, body, options) {
    return this.request(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      ...options
    });
  }
  put(url, body, options) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(body || {}),
      ...options
    });
  }
  delete(url, body, options) {
    return this.request(url, {
      method: "DELETE",
      body: JSON.stringify(body || {}),
      ...options
    });
  }
};
export {
  Request
};
