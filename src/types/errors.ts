class OpenSecretsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenSecretsError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class NetworkError extends OpenSecretsError {
  public url: string;

  constructor(message: string, url: string) {
    super(message);
    this.name = 'NetworkError';
    this.url = url;
  }
}

class APIError extends OpenSecretsError {
  public statusCode: number;
  public response: any;

  constructor(message: string, statusCode: number, response: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

class ValidationError extends OpenSecretsError {
  public validationErrors: string[];

  constructor(message: string, validationErrors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export { OpenSecretsError, NetworkError, APIError, ValidationError };
