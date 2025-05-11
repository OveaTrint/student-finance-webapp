# NextGen Finance - Backend API

This is the backend API for the NextGen Finance application, a student finance web app designed to help users manage their income, expenses, and track their financial overview. This project was developed as part of [Your Course Name, e.g., CSC 212] at [Your School/University Name].

## Features (MVP - Minimum Viable Product)

The backend supports the following core features:

1.  **User Authentication:**
    *   Secure user registration with username and password.
    *   User login and logout capabilities.
    *   Session-based authentication using `JSESSIONID` cookies.

2.  **Income Management:**
    *   **Add Income:** Users can record income transactions.
        *   Fields: `amount`, `source` (as description), `category` (e.g., ALLOWANCE, SALARY), `date`, `frequency` (e.g., ONCE, WEEKLY, MONTHLY).

3.  **Expense Management:**
    *   **Add Expense:** Users can record expense transactions.
        *   Fields: `amount`, `description`, `category` (e.g., FOOD, TRANSPORT, DATA, SCHOOL_FEES, MISC), `date`.

4.  **Balance Overview:**
    *   **View Current Balance:** Calculates and displays the user's financial balance for the current allowance cycle (chosen by the user as weekly or monthly).
        *   Shows: Total Income (for the cycle), Total Expenses (for the cycle), and Current Balance (Income - Expenses).
        *   Provides the start and end dates of the current cycle.

5.  **Transaction History:**
    *   **View All Transactions:** Provides a chronological list of all income and expense entries for the logged-in user.
    *   Transactions for the current cycle are implicitly shown as part of the Balance Overview.

6.  **Allowance Cycle Management:**
    *   Users can choose an allowance cycle frequency (e.g., WEEKLY, MONTHLY) during registration.
    *   The backend automatically determines the start and end dates of the current cycle for balance calculations. Totals effectively "reset" visually to the current cycle's scope.

7.  **Predefined Categories:**
    *   A fixed set of categories for income sources and expense types are available.
    *   Examples:
        *   Income: ALLOWANCE, SALARY, GIFTS, OTHER_INCOME
        *   Expense: FOOD, TRANSPORT, DATA, SCHOOL_FEES, ENTERTAINMENT, RENT, UTILITIES, SHOPPING, MISC.
    *   An API endpoint is available to fetch these categories.

**Security Note on CSRF:**
*   For the current demonstration version of this project, Cross-Site Request Forgery (CSRF) protection has been temporarily disabled to meet project deadlines and overcome complex debugging challenges within the allotted timeframe. In a production environment or with further development, robust CSRF protection (e.g., using Spring Security's `CookieCsrfTokenRepository`) would be fully implemented and tested.

## Technologies Used

*   **Language:** Java 21
*   **Framework:** Spring Boot 3.4.5
    *   Spring Web (for REST APIs)
    *   Spring Data JPA (for database interaction with Hibernate)
    *   Spring Security (for authentication and authorization)
*   **Database:** H2 In-Memory Database (for development and demo)
*   **Build Tool:** Maven (or Gradle, specify which you used)
*   **Authentication Method:** Session-based (HttpOnly `JSESSIONID` cookie)

## API Endpoints

A brief overview of key API endpoints (assuming base path `/api`):

*   **Authentication:**
    *   `POST /api/auth/register`: User registration.
    *   `POST /api/auth/login`: User login.
    *   `POST /api/auth/logout`: User logout.
    *   `GET /api/auth/user`: Get current authenticated user details (simple version).
*   **Transactions:**
    *   `POST /api/transactions`: Add a new income or expense transaction.
    *   `GET /api/transactions`: Get all transactions for the logged-in user.
    *   `GET /api/transactions/categories`: Get available income/expense categories (optional query param `?type=income` or `?type=expense`).
*   **Balance:**
    *   `GET /api/balance/current`: Get the financial overview for the current user's allowance cycle.

*(Note: Refer to the controller classes for detailed request/response structures.)*

## Setup and Running Locally

1.  **Prerequisites:**
    *   Java JDK 21 or higher.
    *   Apache Maven 3.6+ (or Gradle equivalent).
    *   Git (for cloning).

2.  **Clone the Repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>/backend
    ```

3.  **Build the Project:**
    *   Using Maven:
        ```bash
        mvn clean package
        ```
    *   Using Gradle:
        ```bash
        gradle clean build
        ```

4.  **Run the Application:**
    The executable JAR will be created in the `target/` (for Maven) or `build/libs/` (for Gradle) directory.
    ```bash
    java -jar target/nextgenfinance-backend-0.0.1-SNAPSHOT.jar
    ```
    (Replace `nextgenfinance-backend-0.0.1-SNAPSHOT.jar` with the actual name of your generated JAR file).

5.  The backend API will typically start on `http://localhost:8080`.

6.  **Database (H2 Console):**
    *   The H2 in-memory database console can usually be accessed at `http://localhost:8080/h2-console` (if enabled in `application.properties`).
    *   JDBC URL: `jdbc:h2:mem:studentfinancedb`
    *   User: `sa`
    *   Password: (as set in `application.properties`, often blank or 'password' by default for H2 dev).

## Future Enhancements (Potential)

*   Re-enable and correctly configure CSRF protection.
*   Implement Savings Goals functionality.
*   Data visualization and analytics.
*   More detailed error handling and user feedback.
*   Use of a persistent database (e.g., PostgreSQL, MySQL) for production.
*   Full unit and integration testing coverage.

---
