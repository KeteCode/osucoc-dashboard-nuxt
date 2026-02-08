# Nuxt 3 Modernization & Bug-Fix Plan

This document tracks the audit and refactoring process for the `osucoc-dashboard-nuxt` project.

## Directory: `pages/`

### 1. `pages/weeklyOutreach.vue`
-   **Status:** Completed
-   **Issue:** Critical bug. The template calls `useChangeCase`, but the import is commented out.
-   **Solution:** Uncomment the `import { useChangeCase } from '@vueuse/integrations/useChangeCase';` line.

### 2. Consolidate Redundant Data Table Pages
-   **Status:** Completed
-   **Sub-tasks:**
    -   [x] Create dynamic route page `pages/view/[table].vue`.
    -   [x] Delete the 7 redundant static pages.
    -   [x] Update navigation links.
-   **Files to Delete (7):**
    -   `pages/attendanceDashboard.vue`
    -   `pages/churchMembers.vue`
    -   `pages/churchVisitors.vue`
    -   `pages/drivers.vue`
    -   `pages/routes.vue`
    -   `pages/stops.vue`
    -   `pages/users.vue`
-   **Issue:** Massive code duplication. Seven components are nearly identical.
-   **Solution:**
    1.  Create a single dynamic route page at `pages/view/[table].vue`.
    2.  Use the `table` route parameter to dynamically set the `supabase-table-name` prop for the `DataTableJs` component.
    3.  Delete the 7 redundant static pages.
    4.  Update navigation links to point to the new dynamic routes (e.g., `/view/church_members`).

### 3. Refactor Authentication Pages
-   **Status:** Completed
-   **Files to Modify (3):**
    -   `pages/login.vue`
    -   `pages/forgot-password.vue`
    -   `pages/new-password.vue`
-   **Issue:** Brittle UX. `setTimeout` is used to clear error/success messages, which is unreliable.
-   **Solution:** Remove `setTimeout`. Implement a `watch` effect on form inputs (`email`, `password`, etc.) to clear the `authError` ref automatically on user input, providing immediate feedback.

### 4. Improve `index.vue`
-   **Status:** Completed
-   **Issue:** Shows a useless `<NuxtWelcome />` component to authenticated users.
-   **Solution:** Remove `<Nu-textWelcome />`. Use `navigateTo('/attendanceDashboard')` (or another default page) to redirect authenticated users immediately to a useful view.

## Directory: `components/`

### 1. Cleanup Unused Components
-   **Status:** Pending
-   **Files to Delete (3):**
    -   `components/login.vue`
    -   `components/AppHeader.vue`
    -   `components/DynamicForm.vue`
-   **Issue:** Orphaned/empty files clutter the codebase.
-   **Solution:** Delete the unused component files.

### 2. Refactor `DataTableJs.vue` Monolith
-   **Status:** Pending
-   **Issue:** A single component handles data fetching, table rendering, and all CRUD logic via modals, making it hard to maintain.
-   **Solution:**
    1.  Break the component into smaller, focused child components: `AddRecordForm.vue`, `EditRecordForm.vue`, and `DeleteConfirmation.vue`.
    2.  Simplify `DataTableJs.vue` to orchestrate these child components, passing props and listening for events.

### 3. Refactor Alert Components
-   **Status:** Pending
-   **Files to Modify (2):**
    -   `components/ErrorAlert.vue`
    -   `components/SuccessAlert.vue`
-   **Issue:** Components contain a misleading and unused `emit` for clearing the message.
-   **Solution:** Remove the `emit` logic. The components should be purely presentational.

### 4. Modernize Syntax in `DataTableJs.vue`
-   **Status:** Pending
-   **Issue:** Uses a legacy function expression for the `onMounted` hook.
-   **Solution:** Update `onMounted` to use a modern arrow function.

