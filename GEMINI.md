# Project Overview

This is a Nuxt.js v3 web application that serves as a dashboard for the Osu Church of Christ. It is built with Vue.js and uses Vuetify for its UI components. The backend is powered by Supabase, and it uses datatables.net for displaying and managing tabular data. The application is configured to be server-side rendered.

# Building and Running

## Development
To run the application in a development environment, first install the dependencies and then start the development server:

```bash
# Install dependencies
yarn install

# Start the development server
yarn dev
```
The application will be available at http://localhost:3000.

## Production
To build the application for production, use the following command:

```bash
yarn build
```
You can preview the production build with:
```bash
yarn preview
```
To start the application in production mode, use:
```bash
yarn start
```

# Deployment
The application can be deployed using Docker. A `dockerfile` is provided in the root of the project.

To build the Docker image, run the following command:
```bash
docker build -t osucoc-dashboard .
```

To run the Docker container, use the following command:
```bash
docker run -p 80:80 osucoc-dashboard
```
The application will be available at http://localhost:80.

# Project Structure
The project follows the standard Nuxt.js project structure.
- `app.vue`: The main entry point of the application.
- `components/`: Contains reusable Vue components.
  - `NavigationList.vue`: Renders the side navigation menu.
  - `DataTableJs.vue`: A reusable component that displays a datatable with CRUD functionality.
- `pages/`: Contains the application's pages and defines the routing.
- `layouts/`: Contains the application's layouts.
  - `default.vue`: The main layout with a header, side navigation, and content area.
  - `auth.vue`: A simple layout for authentication pages.
- `server/`: Contains server-side logic.
- `middleware/`: Contains route middleware.
  - `auth.js`: A route middleware that protects routes from unauthenticated access.
- `nuxt.config.ts`: The configuration file for Nuxt.js.
- `package.json`: Lists the project's dependencies and scripts.

# Authentication
The application uses Supabase for authentication.
- The login page is located at `/pages/login.vue`. It uses the `signInWithPassword` method from the Supabase client to authenticate users.
- The `middleware/auth.js` file defines a route middleware that checks if a user is authenticated. If the user is not authenticated, they are redirected to the `/login` page.
- The application uses two layouts: `default` and `auth`.
  - The `default` layout is the main layout for the application and includes the main navigation.
  - The `auth` layout is a simple layout used for pages like login and registration, which do not require the main navigation.

# Data Management
The application uses the `datatables.net-vue3` library to display and manage tabular data.
- The `components/DataTableJs.vue` component is a reusable component that provides a feature-rich datatable.
- It fetches data from a Supabase table specified by the `supabase-table-name` prop.
- It supports CRUD (Create, Read, Update, Delete) operations through dialogs.
- It includes features like pagination, sorting, filtering, and row selection.

## Advanced Data Management
The application also demonstrates more advanced data interactions by using Supabase's RPC (Remote Procedure Call) feature.
- The `pages/weeklyOutreach.vue` page calls a Supabase function `get_members_without_attendance` to fetch a list of members who have not had their attendance recorded for a specific date.
- This shows that the application is capable of more complex data queries beyond simple table selections.

# Server-Side Setup
The server-side configuration is standard for a Nu.js project.
- The `server/tsconfig.json` file extends the main `tsconfig.server.json` file in the `.nuxt` directory.

# Ignored Files
The `.gitignore` file is configured to ignore the following:
- Nuxt.js build outputs (`.output`, `.nuxt`, `.nitro`, `.cache`, `dist`)
- Node.js dependencies (`node_modules`)
- Logs (`logs`, `*.log`)
- Miscellaneous files (`.DS_Store`, `.fleet`, `.idea`)
- Local environment files (`.env`, `.env.*`)

The side navigation, rendered by the `NavigationList.vue` component, contains links to the following pages:
- Church Members
- Announcements
- Visitors
- Order of Worship
- Attendance Dashboard
- Weekly Outreach
- Users
- Logout
