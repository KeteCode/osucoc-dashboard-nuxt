# Osu Church of Christ - Admin Dashboard

This is a modern, server-side rendered dashboard for the Osu Church of Christ, built with Nuxt.js v3. It provides administrative tools for managing members, attendance, and user access, with a backend powered by Supabase.

## Key Features

-   **Modern Data Tables:** A feature-rich and customizable data table component used throughout the application for displaying data from Supabase. It includes:
    -   Sorting, searching, and pagination.
    -   Checkbox-based row selection with a selection count display.
    -   Export selected rows to CSV or PDF.
    -   "Select All" functionality.
-   **Attendance Management:**
    -   **Mark Attendance:** A dedicated, mobile-friendly page for rapidly marking member attendance by their church number. It supports marking attendance for past dates.
    -   **Attendance Report:** A report page to view lists of present and absent members for any given date, with data export capabilities.
    -   **Attendance Dashboard:** A historical dashboard showing a yearly overview of member attendance, filterable by year.
-   **User Authentication & Management:**
    -   Secure authentication powered by Supabase Auth.
    -   Standard email/password login with a "Remember Me" option.
    -   OAuth login with Google.
    -   **Invite-Only System:** A secure, server-side feature that allows administrators to invite new users by email.
-   **Modern UI/UX:**
    -   Clean, modern interface built with Vuetify 3.
    -   Redesigned login and password recovery pages.
    -   A beautified and reorganized navigation menu with logical groupings, icons, and active page highlighting.

## Tech Stack

-   **Framework:** [Nuxt.js](https://nuxt.com/) v3
-   **UI Framework:** [Vuetify](https://vuetifyjs.com/) v3
-   **Backend:** [Supabase](https://supabase.io/)
-   **Data Tables:** [vue3-easy-data-table](https://hc200ok.github.io/vue3-easy-data-table/)
-   **PDF Export:** [jspdf](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

## Project Structure

-   `pages/`: Contains the application's pages.
    -   `mark-attendance.vue`: The primary page for marking attendance.
    -   `attendance-report.vue`: Page for viewing present/absent reports.
    -   `invite-user.vue`: Page for sending user invitations.
    -   `view/[table].vue`: A dynamic page that displays data for any given Supabase table (e.g., `/view/church_members`).
-   `components/`: Contains reusable Vue components.
    -   `DataTableJs.client.vue`: The primary data table component with CRUD, export, and selection logic.
    -   `ReportDataTable.vue`: A read-only version of the data table for report pages.
    -   `NavigationList.vue`: The redesigned side navigation menu.
-   `server/api/`: Contains server-side API endpoints.
    -   `invite.post.ts`: The secure endpoint for handling user invitations with the Supabase Admin client.
-   `nuxt.config.ts`: The main Nuxt.js configuration file.

## Setup and Development

### Prerequisites
- Node.js (v18+)
- Yarn

### Installation
1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    yarn install
    ```

### Running in Development
Start the development server on `http://localhost:3000`:
```bash
yarn dev
```

### Production Build
To build the application for production:
```bash
yarn build
```
You can preview the production build with:
```bash
yarn preview
```

## Supabase Configuration
This project requires a Supabase backend. You will need to set up your Supabase project and add the following to your `.env` file:
```
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY"
```

You will also need to configure the **Site URL** and **Redirect URLs** in your Supabase project's Authentication settings to `http://localhost:3000` for local development.