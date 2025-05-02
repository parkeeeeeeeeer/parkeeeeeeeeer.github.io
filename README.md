# AFROTC-Evaluation-Tracker:
Project Objective: To develop and launch a beta version of the improved Standards of Behavior (SOB) tracker with enhanced features by the beginning of December. (Note: This will continue into spring semester)

# SOBs and Class Criteria



## Key Components

- **`assets/`**: Contains reusable HTML components like navigation bars and static resources like images.
- **`css/`**: Stylesheets for customizing the appearance of various components and pages.
- **`databases/`**: SQL files used for database setup and queries.
- **`js/`**: JavaScript files implementing application logic and interactivity.
- **HTML Pages**: HTML files representing the user interface for different parts of the application.

## Notes

- Ensure to run `npm install` to install the required dependencies listed in `package.json`.
- For contributing, see the `CONTRIBUTING.md` (add if applicable).



Here’s a possible markdown structure for organizing the files in your project. You can include this in your README.md file to describe the file organization.

markdown
Copy code
# Project File Structure

This document provides an overview of the file organization for the project.

## Folder Structure

parkeeeeeeeeer.github.io
│
├── .vscode/               # VS Code configuration
│
├── node_modules/          # External dependencies
│
├── src/                   # Source code
│   ├── assets/            # HTML components for navigation
│   │   ├── a3NavBar.html
│   │   ├── a9NavBar.html
│   │   ├── cadreNavBar.html
│   │   ├── det130.png     # Image file
│   │   ├── gmcNavBar.html
│   │   ├── pocNavbar.html
│   │   └── wcNavbar.html
│   │
│   ├── css/               # Stylesheet files
│   │   ├── attendance.css
│   │   ├── cadetProfile.css
│   │   ├── detDashboard.css
│   │   ├── directory.css
│   │   ├── main.css
│   │   ├── nav.css
│   │   ├── PFA.css
│   │   └── SOB.css
│   │
│   ├── js/                # JavaScript functionality
│   │   ├── attendance.js
│   │   ├── auth.js
│   │   ├── cadetProfile.js
│   │   ├── dashboard.js
│   │   ├── dashboardCharts.js
│   │   ├── directory.js
│   │   ├── form2Submissions.js
│   │   ├── PFA.js
│   │   ├── pfaCriteria.js
│   │   ├── SOB.js
│   │   ├── SOBSubmissions.js
│   │   └── index.js
│   │
│   └── databases/         # Database-related files
│
├── .gitignore             # Git ignore configuration
├── attendance.html        # Main HTML pages
├── cadetProfile.html
├── color.html
├── database.rules.json    # Database configuration
├── detDashboard.html
├── directory.html
├── index.html             # Entry point
├── package-lock.json      # NPM dependencies lock
├── package.json           # Project configuration
├── pfaInput.html
├── README.md              # Project documentation
├── readPFAexcel.html
└── SOBsubmissions.html


# Cites:

PFA calculator: https://github.com/ronnieima/usaf-pt-calculator/tree/main

AFROTC 36-2011 Vol. 1 

