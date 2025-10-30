# 🚀 TechShop Frontend

<div align="center">

<!-- TODO: Add project logo (e.g., from assets/logo.png) -->
<!-- ![TechShop Logo](public/images/logo.png) -->

[![GitHub stars](https://img.shields.io/github/stars/NgPhi2807/frontend-techshop?style=for-the-badge)](https://github.com/NgPhi2807/frontend-techshop/stargazers)

[![GitHub forks](https://img.shields.io/github/forks/NgPhi2807/frontend-techshop?style=for-the-badge)](https://github.com/NgPhi2807/frontend-techshop/network)

[![GitHub issues](https://img.shields.io/github/issues/NgPhi2807/frontend-techshop?style=for-the-badge)](https://github.com/NgPhi2807/frontend-techshop/issues)

[![GitHub license](https://img.shields.io/github/license/NgPhi2807/frontend-techshop?style=for-the-badge)](LICENSE)

**A modern and blazing-fast e-commerce storefront for tech products, built with Astro and Vue 3.**

[Live Demo](https://demo-link.com) <!-- TODO: Add live demo link if available -->
</div>

## 📖 Overview

TechShop Frontend is a high-performance e-commerce application designed to showcase and sell a variety of tech products. Leveraging the power of Astro for content-driven pages and Vue.js for dynamic, interactive UI components, it delivers a seamless and engaging shopping experience. The application focuses on speed, modern design, and a robust development workflow, connecting to a separate backend API for all product and user data.

## ✨ Features

-   🎯 **Product Catalog & Details:** Browse extensive product listings and view detailed information for each item.
-   🛒 **Shopping Cart Management:** Add, update, and remove items from your shopping cart seamlessly.
-   🔍 **Search & Filtering:** Easily find products with advanced search and filtering capabilities.
-   ⚡ **Optimized Performance:** Achieves superior page load speeds thanks to Astro's partial hydration and static site generation benefits.
-   📱 **Responsive Design:** A fully responsive interface ensures an optimal viewing experience across all devices, from desktop to mobile.
-   🎨 **Modern UI with Tailwind CSS:** Clean, maintainable, and highly customizable styling with a utility-first CSS framework.
-   🔐 **Authentication Flow:** Integrates with a backend API for user login, registration, and secure interactions.

## 🖥️ Screenshots

<!-- TODO: Add actual screenshots of the application -->
<!-- ![Screenshot of Homepage](public/screenshots/homepage.png) -->
<!-- ![Screenshot of Product Detail Page](public/screenshots/product-detail.png) -->
<!-- ![Screenshot of Shopping Cart](public/screenshots/cart.png) -->

## 🛠️ Tech Stack

**Frontend:**

![Astro](https://img.shields.io/badge/Astro-0C162B?style=for-the-badge&logo=astro&logoColor=FDD671)

![React.js](https://img.shields.io/badge/React.js-61DAFB?style=for-the-badge&logo=react&logoColor=white)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white)

**DevOps & Tools:**

![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

![PM2](https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white)

![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

![Prettier](https://img.shields.io/badge/Prettier-F7BA3E?style=for-the-badge&logo=prettier&logoColor=white)

## 🚀 Quick Start

### Prerequisites
Before you begin, ensure you have the following installed:
-   **Node.js**: `v18.0.0` or higher (LTS recommended)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/NgPhi2807/frontend-techshop.git
    cd frontend-techshop
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment setup**
    Create a `.env` file in the root directory by copying `.env.example`.
    ```bash
    cp .env.example .env
    ```
    Then, configure your environment variables. At a minimum, you'll need to specify the backend API URL:
    ```ini
    # .env
    VITE_PUBLIC_API_URL="http://localhost:8080/api/v1" # Or your deployed backend API URL
    ```
    *(Note: `.env.example` is assumed for best practice; if not present, create `.env` directly.)*

4.  **Start development server**
    ```bash
    npm run dev
    ```
    This will start the Astro development server.

5.  **Open your browser**
    Visit `http://localhost:4321` (default Astro dev server port) to see the application.

## 📁 Project Structure

```
frontend-techshop/
├── public/                 # Static assets (images, fonts, favicon)
│   └── # ...
├── src/                    # Application source code
│   ├── components/         # Reusable UI components (Astro & Vue)
│   │   ├── astro/          # Astro components
│   │   └── vue/            # Vue.js components
│   ├── layouts/            # Astro layout components
│   ├── pages/              # Astro pages (main routes of the application)
│   ├── styles/             # Global styles and Tailwind CSS base
│   ├── utils/              # Utility functions, helper scripts, API service
│   └── env.d.ts            # TypeScript environment type definitions
├── .env                    # Environment variables (local)
├── .gitignore              # Files/directories to ignore in Git
├── astro.config.mjs        # Astro project configuration
├── ecosystem.config.cjs    # PM2 process manager configuration (for deployment)
├── package.json            # Project metadata and npm scripts
├── package-lock.json       # Exact versions of npm dependencies
├── postcss.config.js       # PostCSS configuration for Tailwind CSS
├── prettier.config.mjs     # Prettier formatting configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## ⚙️ Configuration

### Environment Variables
Configure the `.env` file for different environments.

| Variable             | Description                                     | Default                   | Required |

|----------------------|-------------------------------------------------|---------------------------|----------|

| `VITE_PUBLIC_API_URL`| The base URL of the backend API service.        | `http://localhost:8080/api/v1`| Yes      |

| `VITE_SOME_OTHER_VAR`| <!-- TODO: Add other detected variables -->     | `N/A`                     | No       |

### Configuration Files
-   **`astro.config.mjs`**: Main Astro configuration, including integrations like Vue.js.
-   **`tailwind.config.js`**: Tailwind CSS theme, plugins, and utility generation.
-   **`postcss.config.js`**: PostCSS plugins for processing CSS, including Tailwind CSS and Autoprefixer.
-   **`tsconfig.json`**: TypeScript compiler options for the project.
-   **`prettier.config.mjs`**: Code formatting rules.
-   **`ecosystem.config.cjs`**: PM2 configuration for process management, often used for production deployments.

## 🔧 Development

### Available Scripts
The following scripts are defined in `package.json`:

| Command        | Description                                       |

|----------------|---------------------------------------------------|

| `npm run dev`  | Starts the development server with hot-reloading. |

| `npm run start`| Starts the Astro preview server after building.   |

| `npm run build`| Builds the project for production.                |

| `npm run preview`| Locally previews your production build.         |

| `npm run astro`| Runs Astro CLI commands.                          |

| `npm run lint` | Lints the codebase for potential errors.          |

| `npm run format`| Formats the code using Prettier.                 |

### Development Workflow
1.  Ensure all prerequisites are installed.
2.  Run `npm install` to get dependencies.
3.  Set up your `.env` file.
4.  Start the development server with `npm run dev`.
5.  Develop components and pages in `src/`. Astro will automatically detect changes and reload.
6.  Use `npm run lint` and `npm run format` to maintain code quality and consistency.

## 🧪 Testing

This project uses ESLint and TypeScript for static analysis. For runtime testing, you might integrate a framework like Vitest (for Astro/Vue components).

```bash

# Run linting checks
npm run lint

# TODO: Add commands for unit/integration tests if a testing framework is configured

# npm test

# npm run test:coverage
```

## 🚀 Deployment

### Production Build
To create a production-ready build of the application:
```bash
npm run build
```
This command compiles your Astro project into static assets or server-rendered output in the `dist/` directory, ready for deployment.

### Deployment Options
-   **Static Hosting (e.g., Netlify, Vercel, GitHub Pages)**: The `dist/` folder can be directly uploaded to any static hosting provider.
-   **PM2**: The `ecosystem.config.cjs` suggests PM2 can be used for managing the Node.js process (e.g., `npm run start` after build) for more robust hosting.
    ```bash
    # Install PM2 globally if not already installed
    npm install -g pm2

    # Start the application using PM2
    pm2 start ecosystem.config.cjs
    ```
-   **Docker**: <!-- TODO: If a Dockerfile is added later, include instructions here. -->

## 📚 API Reference

This frontend application consumes a RESTful API. The API endpoints are configured via the `VITE_PUBLIC_API_URL` environment variable. Details about specific API endpoints and data structures would be available in the separate backend repository's documentation.

### Example API Interaction
*(Conceptual - actual implementation in `src/utils/api.ts` or similar)*
```typescript
// src/utils/productService.ts (conceptual)
import axios from 'axios';

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchAllProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};
```

## 🤝 Contributing

We welcome contributions to TechShop Frontend! If you're interested in improving this project, please consider:
-   Forking the repository.
-   Creating a new branch for your feature or bug fix.
-   Ensuring your code adheres to the project's coding style (ESLint and Prettier).
-   Submitting a pull request with a clear description of your changes.

For more detailed contribution guidelines, please see our [Contributing Guide](CONTRIBUTING.md). <!-- TODO: Create CONTRIBUTING.md -->

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details. <!-- TODO: Create a LICENSE file with MIT License text -->

## 🙏 Acknowledgments

-   Built with [Astro](https://astro.build/)
-   Interactive components powered by [Vue.js](https://vuejs.org/)
-   Styled with [Tailwind CSS](https://tailwindcss.com/)
-   Managed with [npm](https://www.npmjs.com/)
-   Process management facilitated by [PM2](https://pm2.io/)

## 📞 Support & Contact

-   🐛 Issues: Feel free to open an issue on [GitHub Issues](https://github.com/NgPhi2807/frontend-techshop/issues) for bug reports or feature requests.
-   📧 Contact: [contact@example.com] <!-- TODO: Add project contact email -->

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [NgPhi2807](https://github.com/NgPhi2807)

</div>

