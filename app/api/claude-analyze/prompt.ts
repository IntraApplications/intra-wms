export const prompt = `Here's a revised prompt designed to ensure accurate data extraction and Dockerfile creation for any project:

---

### **Instructions:**

1. **Comprehensive Project Analysis**:

   - **Framework and Technology Identification**:
     - Examine all files and directories in the project to identify all programming languages, frameworks, libraries, and tools used.
     - Look into configuration and dependency files such as \`package.json\`, \`requirements.txt\`, \`go.mod\`, \`Pipfile\`, \`Gemfile\`, \`composer.json\`, \`Cargo.toml\`, etc.
     - Detect if the project uses multiple frameworks or languages (e.g., a Python backend with a React frontend).

   - **Configuration Files**:
     - Analyze build and configuration files like \`webpack.config.js\`, \`babel.config.js\`, \`tsconfig.json\`, \`Dockerfile\`, \`Makefile\`, and CI/CD pipelines.
     - Note any scripts or commands in \`package.json\` scripts or equivalent that are essential for building or running the application.

2. **Dependency and Version Extraction**:

   - **List All Dependencies with Exact Versions**:
     - Extract all dependencies and their exact versions, including devDependencies and peerDependencies where applicable.
     - Include significant transitive dependencies if they impact the build or runtime.

   - **Programming Language and Runtime Versions**:
     - Identify the exact versions of programming languages and runtimes required (e.g., Node.js 14.17.0, Python 3.9.1).
     - Check for version files like \`.nvmrc\`, \`.python-version\`, \`.ruby-version\`, or engines specified in \`package.json\`.

   - **System Requirements**:
     - Note any OS-specific requirements, necessary system packages, or compiler tools needed (e.g., GCC, make, OpenSSL).

3. **Dockerfile Creation**:

   - **Generate an Accurate and Efficient Dockerfile**:
     - Create a Dockerfile that replicates the necessary environment to build and run the application successfully.
     - Use multi-stage builds to optimize the final image size by separating build-time and runtime dependencies.
     - Select appropriate base images that match the required language and OS versions.

   - **Include Necessary Commands and Configurations**:
     - Install all required system packages and dependencies.
     - Copy necessary files and set the correct working directory.
     - Specify build commands, if any (e.g., \`npm run build\`, \`python setup.py install\`).
     - Set up the entry point and command to run the application.
     - Expose necessary ports.

4. **Environment and External Dependencies**:

   - **Environment Variables**:
     - Identify all environment variables required by the application without exposing sensitive data.
     - Use placeholders or reference external configurations for secrets.

   - **External Services and APIs**:
     - Note any external services (e.g., databases, caching services, third-party APIs) the application interacts with.
     - Ensure necessary client libraries and network configurations are included.

5. **Optimization and Best Practices**:

   - **Security Measures**:
     - Run the application as a non-root user where possible.
     - Exclude unnecessary files and directories to minimize the image size.
     - Do not copy sensitive files like \`.env\` into the image.

   - **Performance Enhancements**:
     - Implement caching for dependency installation steps to speed up builds.
     - Use lightweight base images (e.g., Alpine variants) when appropriate.

6. **Output Requirements**:

   - **Structured JSON Output**:
     - Present all findings and the Dockerfile in the following JSON format:

     \`\`\`json
     {
       "projectType": ["Framework1", "Framework2", "..."],
       "languageVersion": "LanguageName Version",
       "dependencies": [
         "dependency1@version",
         "dependency2@version",
         "..."
       ],
       "dockerfile": "Generated Dockerfile content here",
       "osRequirements": ["OS or Distribution", "System Packages", "..."],
       "ports": [portNumber1, portNumber2, "..."],
       "environmentVariables": ["VARIABLE_NAME1", "VARIABLE_NAME2", "..."],
       "notes": "Additional notes, recommendations, or special instructions."
     }
     \`\`\`

   - **Comprehensive and Accurate Content**:
     - Ensure that each field is detailed and accurately reflects the project's requirements.
     - The \`"dockerfile"\` field should contain the full content of the Dockerfile, properly formatted.

7. **Validation and Error Checking**:

   - **Consistency Verification**:
     - Cross-verify that all versions and dependencies are consistent throughout the output.
     - Check for conflicting dependencies or version mismatches.

   - **Build Simulation**:
     - Consider the build process steps to identify potential issues.
     - Adjust the Dockerfile to resolve any anticipated errors.

8. **Additional Considerations**:

   - **Multi-Service Applications**:
     - If the project consists of multiple services (e.g., microservices architecture), generate Dockerfiles for each service or provide guidance on handling them.

   - **Platform-Specific Instructions**:
     - For applications targeting specific platforms (e.g., mobile, IoT), include necessary build tools or emulators.

   - **CI/CD Integration**:
     - Suggest ways to integrate the Dockerfile into CI/CD pipelines for automated builds and deployments.

---

### **Example Output:**

\`\`\`json
{
  "projectType": ["Python", "Django", "React"],
  "languageVersion": "Python 3.9.1",
  "dependencies": [
    "Django==3.2.5",
    "djangorestframework==3.12.4",
    "react@17.0.2",
    "webpack@5.38.1"
  ],
  "dockerfile": "FROM python:3.9.1-slim AS base\nWORKDIR /app\nCOPY requirements.txt ./\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\n\nFROM node:14.17.0-alpine AS frontend\nWORKDIR /app/frontend\nCOPY frontend/package.json ./\nRUN npm install\nCOPY frontend .\nRUN npm run build\n\nFROM base AS final\nCOPY --from=frontend /app/frontend/build /app/static\nEXPOSE 8000\nCMD [\"python\", \"manage.py\", \"runserver\", \"0.0.0.0:8000\"]",
  "osRequirements": ["Debian GNU/Linux", "Build-essential package"],
  "ports": [8000],
  "environmentVariables": ["DJANGO_SECRET_KEY", "DATABASE_URL", "DEBUG"],
  "notes": "Ensure that the Django secret key and database URL are provided as environment variables. The frontend React app is built separately and the static files are collected into the Django static directory."
}
\`\`\`

---

### **Important Notes:**

- **Accuracy and Completeness**:
  - **Detailed Analysis**: Perform an exhaustive analysis to capture all aspects of the project.
  - **Exact Versions**: Use precise versions for all languages, frameworks, and dependencies to prevent compatibility issues.

- **Security Best Practices**:
  - **Sensitive Data Handling**: Do not include actual secret keys, passwords, or any sensitive information in the output.
  - **User Permissions**: Configure the Dockerfile to avoid running the application as the root user when possible.

- **Optimizations**:
  - **Layer Caching**: Organize Dockerfile commands to leverage layer caching, placing commands that change less frequently earlier.
  - **Image Size**: Use slim or alpine base images to reduce the final image size, unless the application requires standard images.

- **Testing and Validation**:
  - **Build Testing**: Encourage testing the Docker image locally to ensure it builds and runs as expected before deployment.
  - **Continuous Integration**: Recommend incorporating the Docker build into a CI pipeline for ongoing validation.

- **Documentation**:
  - **Comments in Dockerfile**: Include comments within the Dockerfile to explain non-obvious instructions.
  - **Readme Updates**: Suggest updating project documentation to reflect Docker usage and any changes made.

  -- NOTE PLEASE DO NOT INCLUDE ANY COMMENTS IN THE JSON YOU RETURN 
---

This revised prompt is designed to guide you in accurately extracting all necessary data from any project and generating a correct Dockerfile every time. By following these detailed instructions, you can ensure that the Dockerfile and accompanying configurations will enable the application to build and run successfully in a containerized environment.`;
