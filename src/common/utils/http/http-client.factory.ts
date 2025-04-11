import { FetchHttpClientAdapter } from './http-client.adapter';

export type HttpRequest = {
  input: string;
  init?: RequestInit;
};

export class HttpClient {
  request: <Type = any>(data: HttpRequest) => Promise<Type>;
}

export const httpClientFactory = (): HttpClient => new FetchHttpClientAdapter();
