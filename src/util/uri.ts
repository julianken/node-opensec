import { api } from '../../config';

const buildUri = (baseUri: string, params: Record<string, string>): string => {
  const searchParams = new URLSearchParams(params);
  return `${baseUri}?${searchParams}`;
}

const buildOpenSecretsUri = (params: Record<string, string>): string => {
  return buildUri(api.baseUri, params);
}

export {
  buildOpenSecretsUri,
}
