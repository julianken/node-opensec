# Node OpenSecrets API Client

This project is a Node.js client for interacting with the OpenSecrets API. It provides a simple interface for fetching data such as legislators by state.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Installation

To use this package, you'll need Node.js installed. You can install the package using npm or yarn:

```bash
npm install @the-wash/node-opensec
```

Or using yarn:

```bash
yarn add @the-wash/node-opensec
```

## Usage

To use the client, you will need to obtain an OpenSecrets API key. This will be used to initialize the client and will be sent with requests.

```javascript
import { Client as OpenSecretsClient } from '@the-wash/node-opensec';

const client = new OpenSecretsClient('your-api-key');

async function fetchLegislators() {
  try {
    const legislators = await client.getLegislators('NY');
    console.log(legislators);
  } catch (error) {
    console.error('Error fetching legislators:', error.message);
  }
}

fetchLegislators();
```

**Example:**

```javascript
const legislators = await client.getLegislators('CA');
```

## Environment Variables

This client requires the OpenSecrets API key to be set in your environment. Create a .env file in your project root and add:

```bash
OPENSECRETS_API_KEY=your_api_key_here
```

## Testing

The project uses Jest for testing. You can run the test suite with:
```bash
yarn test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any features, bug fixes, or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
