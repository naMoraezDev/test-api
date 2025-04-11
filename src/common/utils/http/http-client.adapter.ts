import { HttpClient, HttpRequest } from './http-client.factory';

export class FetchHttpClientAdapter implements HttpClient {
  async request({ input, init }: HttpRequest) {
    const response = await fetch(input, init);

    if (!response.ok) {
      throw new Error(
        `Falha na requisição: ${input} ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }
}
