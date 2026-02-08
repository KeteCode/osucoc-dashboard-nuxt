# Project Audit & Modernization Plan

This document outlines the phased plan to audit and modernize the Nuxt 3 project, focusing on modern standards, bug fixes, and general housekeeping.

## Overall Goal
Conduct a comprehensive audit of a 3-year-old Nuxt project for modern standards, bug fixes, and general housekeeping, focusing on Nuxt 3, Composition API, and Vite compatibility.

---

## Current Status

*   **Project State:** The project is a Nuxt 3 application with a Supabase backend and Vuetify UI. Many core components and pages have been refactored or created.
*   **Key Dependencies:** `vue3-easy-data-table` is now used for tables. `jspdf` and `jspdf-autotable` are included for PDF/CSV exports.
*   **Known Issues:** The `v-date-picker` component is currently not resolving correctly, preventing interactivity on the "Attendance Report" and "Mark Attendance" pages.

---

## Plan & Progress

1.  **[DONE]** Initial Environment Snapshot (package.json).
2.  **[DONE]** Phased Audit: `pages/` directory.
3.  **[DONE]** Phased Audit: `components/` directory (excluding DataTableJs issues).
4.  **[DONE]** Phased Audit: `layouts/` directory.
5.  **[DONE]** Phased Audit: `middleware/` directory.
6.  **[DONE]** Phased Audit: `server/` directory (no changes needed).
7.  **[DONE]** Resolve `DataTableJs.client.vue` initialization issues (by replacing the library).
8.  **[DONE]** Replace `datatables.net-vue3` with `vue3-easy-data-table` to resolve persistent initialization errors.
9.  **[TODO]** Fix `v-date-picker` component not resolving and being interactive on `pages/mark-attendance.vue` and `pages/attendance-report.vue`. This is a Vuetify 3 with Nuxt 3 configuration issue.
