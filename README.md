# Node OpenSecrets API Client

This project is a Node.js client for interacting with the OpenSecrets API. It provides a simple interface for fetching data such as legislators by state.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
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

To use the client, you will need to obtain an Open Secrets API key. This will be used to initialize the client and will be sent with requests.

```javascript
import { Client as OpenSecretsClient } from '@the-wash/node-opensec';

const openSecretsClient = new OpenSecretsClient('your-api-key');
```

You can then use the client to fetch data from the Open Secrets API.
```javascript
const legislators = await openSecretsClient.getLegislators('CA');
```

## Testing

The project uses Jest for testing. You can run the test suite with:
```bash
yarn test
```

To run tests in watch mode:

```bash
yarn run test:watch
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any features, bug fixes, or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
