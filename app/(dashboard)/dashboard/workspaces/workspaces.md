The workflow for creating a new workspace in Intra, from clicking the "Create New Workspace" button to the workspace being fully created, involves several key steps. Below is a breakdown of each step, including backend and frontend interactions, as well as the integration of GitHub and Docker components.

### 1. **User Clicks "Create New Workspace" Button**

- **Frontend:** The user initiates the workspace creation process by clicking the "Create New Workspace" button in the Intra dashboard.
- **Backend Trigger:** A request is sent to the Intra backend to begin the process of creating a new workspace.

### 2. **Selecting VCS or Blank Workspace**

- **Frontend UI:** The user is presented with options:
  - Choose a Version Control System (VCS) like GitHub.
  - Select "Blank Workspace" if no VCS is used.
- **Backend Request:** If GitHub is selected, a request is sent to retrieve the user's repositories or prompt them to authorize GitHub.

### 3. **GitHub Authorization (If Applicable)**

- **OAuth Flow:** If the user hasn't previously linked GitHub, they are redirected to the GitHub OAuth page for authorization.
- **Token Retrieval:** Upon authorization, GitHub returns an access token to Intra, which is stored securely in the backend.
- **GitHub App Check:** If the user is using the GitHub App, the system checks for existing installations and retrieves the installation ID.

### 4. **Repository Selection**

- **Frontend UI:** After authorizing, the user selects a repository from their GitHub account to be used as the workspace source.
- **Backend Request:** Once a repository is selected, Intra pulls repository metadata (e.g., branch, files) from GitHub.

### 5. **Dependency Scanning**

- **Backend:** Intra scans the repository for any dependency files (e.g., `package.json` for Node.js, `requirements.txt` for Python).
- **Container Setup:** If dependencies are found, the backend prepares to create a Docker container that includes these dependencies. If no Dockerfile exists, Intra uses pre-configured Docker images based on the detected stack.

### 6. **Docker Container Creation**

- **Backend:**
  - Intra uses Docker to pull a base image for the programming language or stack used in the repository.
  - Dependencies are installed, and the application is set up within the container.
  - If no dependencies are found or it's a Blank Workspace, a generic development environment is created.

### 7. **Workspace Initialization**

- **Backend:**
  - The Docker container is started with all necessary configurations and scripts that Intra needs to manage the workspace.
  - Code is cloned into the container, and any initial setup steps (like installing packages) are executed.
- **Frontend Notification:** The frontend displays a loading spinner or progress bar, indicating that the workspace is being created.

### 8. **WebSocket Connection**

- **Backend:**
  - Once the workspace is initialized, Intra establishes a WebSocket connection between the frontend and backend for real-time updates (e.g., live notifications, status updates).
  - GitHub webhooks are set up to notify the workspace of any future commits or changes made in the repository.

### 9. **Workspace Launched**

- **Frontend UI:** The workspace opens up in a browser-based IDE (e.g., VS Code Cloud or Intra’s custom IDE).
  - The user can now edit, run, and test their code in real-time.
- **Backend:** The workspace remains active, running the Docker container with the project. Any changes made through the IDE are reflected in the container, and commits can be pushed back to GitHub if connected.

### 10. **Syncing to Worktree & Notifications**

- **Backend:**
  - The workspace is synced with the Intra worktree feature, showing live updates of branches and commits.
  - GitHub webhook notifications are filtered to ensure that relevant notifications (e.g., pull requests, commits) are shown to the user.
- **Frontend UI:** The user is notified of any new commits or updates via the WebSocket connection and Intra's notification system.

### 11. **Workspace Ready**

- The workspace is now fully operational, and the user can start working with their code, collaborating with team members, or managing the project from the workspace UI.

This process ensures seamless integration with GitHub, automatic Docker container creation, and a responsive, real-time development environment for the user to start coding in immediately after setup.
