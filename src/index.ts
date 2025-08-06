export interface ErrorResponseData {
  code: number;
  message: string;
}

export interface RequestOptions<E = unknown> {
  baseUrl?: string;
  headers?: Record<string, string>;
  transformRequest?: (headers: Headers) => Headers;
  transformResponse?: <T>(res: Response) => Promise<T | undefined>;
  onResponse?: (res: Response) => void;
  onError?: (data: E, status: number, res: Response) => void;
}

export interface ErrorResponse<E = unknown> {
  status: number;
  data: E;
}

export class Request<E = ErrorResponseData> {
  baseUrl: string;
  headers?: Record<string, string>;
  transformRequest?: (headers: Headers) => Headers;
  transformResponse?: <T>(res: Response) => Promise<T | undefined>;
  onResponse?: (res: Response) => void;
  onError?: (data: E, status: number, res: Response) => void;

  constructor({
    baseUrl,
    headers,
    transformRequest,
    transformResponse,
    onResponse,
    onError,
  }: RequestOptions<E> = {}) {
    this.baseUrl = baseUrl || '';
    this.headers = headers;
    this.transformRequest = transformRequest;
    this.transformResponse = transformResponse;
    this.onResponse = onResponse;
    this.onError = onError;
  }

  async request<T>(url: string, options?: RequestInit): Promise<T> {
    let headers = new Headers({ ...this.headers, ...options?.headers });
    if (!headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json; charset=utf-8');
    }

    if (this.transformRequest) {
      headers = this.transformRequest(headers);
    }

    const res = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (this.onResponse) {
      this.onResponse(res);
    }

    if (this.transformResponse) {
      const data = await this.transformResponse<T>(res);
      if (data) return data;
    }

    try {
      if (res.status < 200 || res.status >= 300) {
        const data = await res.json() as E;
        const status = res.status;
        if (this.onError) {
          this.onError(data, status, res);
        }
        throw { status, data } as ErrorResponse<E>;
      } else if (res.headers.get('Content-Type') === 'application/octet-stream') {
        const data = await res.blob();
        return data as T;
      } else {
        const data = await res.json();
        return data as T;
      }
    } catch (error) {
      throw error;
    }
  }

  get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, options);
  }

  post<T, U = unknown>(
    url: string,
    body?: U,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      ...options,
    });
  }

  put<T, U = unknown>(
    url: string,
    body?: U,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body || {}),
      ...options,
    });
  }

  delete<T, U = unknown>(
    url: string,
    body?: U,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
      body: JSON.stringify(body || {}),
      ...options,
    });
  }
}

