# Snorql Frontend

This repository contains the frontend code for Snorql, an open-source project developed at Udaan aimed at diagnosing and resolving common database-related problems using SQL metrics.

## Getting Started

### Prerequisites

Before you can run this application, you must have the following installed:

- Node.js
- yarn

### Installation

To install the dependencies for this project, run the following command in the root directory:

```
yarn
```

### Running the App

To start the development server, run the following command:

```
yarn start
```

This will start the frontend application and automatically open it in your default browser. 
Then, start the proxy server which can either connect to snorql-backend or serve the json mocks stored in `/mocks` directory as response to API calls. 

```
yarn start-proxy
```

## Contributing

We welcome contributions to this project! To get started, please fork this repository and create a new branch for your changes. Once you have made your changes, create a pull request and we will review your changes.

Please ensure that your code is well-documented, and that it follows our [code style guidelines](https://github.com/udaan-com/snorql/blob/main/CODE_STYLE.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The [Create React App](https://create-react-app.dev/) team for providing an easy way to set up a React project.
- The [Udaan](https://udaan.com/) team for creating and maintaining Snorql.