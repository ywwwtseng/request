interface ErrorResponseData {
    code: number;
    message: string;
}
interface RequestOptions<E = unknown> {
    baseUrl?: string;
    headers?: Record<string, string>;
    transformRequest?: (headers: Headers) => Headers;
    transformResponse?: <T>(res: Response) => Promise<T | undefined>;
    onResponse?: (res: Response) => void;
    onError?: (data: E, status: number, res: Response) => void;
}
interface ErrorResponse<E = unknown> {
    status: number;
    data: E;
}
declare class Request<E = ErrorResponseData> {
    baseUrl: string;
    headers?: Record<string, string>;
    transformRequest?: (headers: Headers) => Headers;
    transformResponse?: <T>(res: Response) => Promise<T | undefined>;
    onResponse?: (res: Response) => void;
    onError?: (data: E, status: number, res: Response) => void;
    constructor({ baseUrl, headers, transformRequest, transformResponse, onResponse, onError, }?: RequestOptions<E>);
    request<T>(url: string, options?: RequestInit): Promise<T>;
    get<T>(url: string, options?: RequestInit): Promise<T>;
    post<T, U = unknown>(url: string, body?: U, options?: RequestInit): Promise<T>;
    put<T, U = unknown>(url: string, body?: U, options?: RequestInit): Promise<T>;
    delete<T, U = unknown>(url: string, body?: U, options?: RequestInit): Promise<T>;
}

export { type ErrorResponse, type ErrorResponseData, Request, type RequestOptions };
