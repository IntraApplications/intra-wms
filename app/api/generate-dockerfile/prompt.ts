export const prompt = `
### Instructions:

1. **Comprehensive Project Analysis**:

   - **Framework and Technology Identification**:
     - Examine all files and directories in the project to identify all programming languages, frameworks, libraries, and tools used.
     - Look into configuration and dependency files such as \`package.json\`, \`requirements.txt\`, \`go.mod\`, \`Pipfile\`, \`Gemfile\`, \`composer.json\`, \`Cargo.toml\`, \`pom.xml\`, \`build.gradle\`, \`pubspec.yaml\`, etc.
     - Detect if the project uses multiple frameworks or languages (e.g., a Java Spring Boot backend with a React frontend, or an Electron application combining Node.js and Chromium).

   - **Configuration Files**:
     - Analyze build and configuration files like \`webpack.config.js\`, \`babel.config.js\`, \`tsconfig.json\`, \`Dockerfile\`, \`Makefile\`, \`android/app/build.gradle\`, \`ios/Podfile\`, and CI/CD pipelines.
     - Note any scripts or commands in \`package.json\` scripts or equivalent that are essential for building or running the application.
     - Identify any platform-specific files or configurations (e.g., \`app.json\` for Expo, \`electron-builder.json\` for Electron).

2. **Dependency and Version Extraction**:

   - **List All Dependencies with Exact Versions**:
     - Extract all dependencies and their exact versions, including devDependencies and peerDependencies where applicable.
     - Include significant transitive dependencies if they impact the build or runtime.
     - Note any native modules or plugins that may require additional system dependencies or configurations.

   - **Programming Language and Runtime Versions**:
     - Identify the exact versions of programming languages and runtimes required (e.g., Node.js 14.17.0, Python 3.9.1, Java 11).
     - Check for version files like \`.nvmrc\`, \`.python-version\`, \`.ruby-version\`, or engines specified in \`package.json\` or \`build.gradle\`.

   - **System Requirements**:
     - Note any OS-specific requirements, necessary system packages, compiler tools, or SDKs needed (e.g., GCC, make, OpenSSL, Android SDK, iOS SDK).
     - Identify any requirements for GUI support or graphics libraries for desktop applications (e.g., Electron).

3. **Dockerfile Creation**:

   - **Generate an Accurate and Efficient Dockerfile**:
     - Create a Dockerfile that replicates the necessary environment to build and run the application successfully.
     - Use multi-stage builds to optimize the final image size by separating build-time and runtime dependencies.
     - Select appropriate base images that match the required language, OS versions, and platform-specific needs.
     - For multi-language projects, consider whether to use a single Dockerfile with multi-stage builds or separate Dockerfiles.

   - **Include Necessary Commands and Configurations**:
     - Install all required system packages, SDKs, emulators, and dependencies.
     - Configure the environment for GUI applications if necessary (e.g., setting up Xvfb for Electron apps).
     - Copy necessary files and set the correct working directories.
     - Specify build commands, if any (e.g., \`npm run build\`, \`gradle assemble\`, \`expo build\`).
     - Set up the entry point and command to run the application.
     - Expose necessary ports.

4. **Environment and External Dependencies**:

   - **Environment Variables**:
     - Identify all environment variables required by the application without exposing sensitive data.
     - Use placeholders or reference external configurations for secrets.
     - Provide guidance on how to supply these variables when running the container.

   - **External Services and APIs**:
     - Note any external services (e.g., databases, caching services, third-party APIs) the application interacts with.
     - Ensure necessary client libraries, network configurations, and environment variables are included.

5. **Optimization and Best Practices**:

   - **Security Measures**:
     - Run the application as a non-root user where possible.
     - Exclude unnecessary files and directories to minimize the image size.
     - Do not copy sensitive files like \`.env\` into the image.
     - Use trusted base images and verify checksums when downloading dependencies.

   - **Performance Enhancements**:
     - Implement caching for dependency installation steps to speed up builds.
     - Use lightweight base images (e.g., Alpine variants) when appropriate, but ensure compatibility with required dependencies.

6. **Output Requirements**:

   - **Structured JSON Output**:
     - Present all findings and the Dockerfile in the following JSON format:


     {
       "projectType": ["Framework1", "Framework2"],
       "languageVersions": {
         "Language1": "Version",
         "Language2": "Version",
       },
       "dependencies": [
         "dependency1@version",
         "dependency2@version",
       ],
       "dockerfile": "this is where the docker document content goes MAKE SURE THE FORMATTING IS GOOD FOR JSON AND IT GOES ALL ON ONE LINE WITH \n instead of multiple whitespace lines in the string",
       "osRequirements": ["OS or Distribution", "System Packages"],
       "ports": [portNumber1, portNumber2],
       "environmentVariables": ["VARIABLE_NAME1", "VARIABLE_NAME2"],
       "notes": "Additional notes, recommendations, or special instructions."
     }


   - **Comprehensive and Accurate Content**:
     - Ensure that each field is detailed and accurately reflects the project's requirements.
     - The \`"dockerfile"\` field should contain the full content of the Dockerfile, properly formatted.
     - For multi-service applications, provide Dockerfiles for each service if applicable.

     
7. **Validation and Error Checking**:

   - **Consistency Verification**:
     - Cross-verify that all versions and dependencies are consistent throughout the output.
     - Check for conflicting dependencies or version mismatches.
     - Ensure that the Dockerfile commands correspond to the identified project types and dependencies.

   - **Build Simulation**:
     - Consider the build process steps to identify potential issues.
     - Adjust the Dockerfile to resolve any anticipated errors.
     - Provide suggestions if certain components cannot be containerized easily (e.g., GUI applications).

8. **Additional Considerations**:

   - **Multi-Service Applications**:
     - If the project consists of multiple services (e.g., microservices architecture, separate frontend and backend), generate Dockerfiles for each service or provide guidance on using tools like Docker Compose.
     - Suggest appropriate service definitions and networking configurations.

   - **Platform-Specific Instructions**:
     - For applications targeting specific platforms (e.g., mobile, desktop), include necessary build tools, SDKs, or emulators.
     - Provide configurations needed to build and run the application within a container, acknowledging any limitations (e.g., hardware acceleration for mobile emulators).

   - **CI/CD Integration**:
     - Suggest ways to integrate the Dockerfile into CI/CD pipelines for automated builds and deployments.
     - Provide examples of how to build and push Docker images within popular CI/CD systems.
     - Mention any testing steps that should be included in the CI/CD pipeline.

---

### **Important Notes:**

- **Accuracy and Completeness**:
  - **Detailed Analysis**: Perform an exhaustive analysis to capture all aspects of the project, including less common frameworks or tools.
  - **Exact Versions**: Use precise versions for all languages, frameworks, and dependencies to prevent compatibility issues.
  - **Edge Cases**: Address potential challenges with containerizing certain applications (e.g., GUI applications, applications requiring specific hardware access).

- **Security Best Practices**:
  - **Sensitive Data Handling**: Do not include actual secret keys, passwords, or any sensitive information in the output.
  - **User Permissions**: Configure the Dockerfile to avoid running the application as the root user when possible.
  - **Trusted Sources**: Ensure all base images and downloaded dependencies come from trusted sources.

- **Optimizations**:
  - **Layer Caching**: Organize Dockerfile commands to leverage layer caching, placing commands that change less frequently earlier.
  - **Image Size**: Use slim or alpine base images to reduce the final image size, unless the application requires standard images.

- **Testing and Validation**:
  - **Build Testing**: Encourage testing the Docker image locally to ensure it builds and runs as expected before deployment.
  - **Continuous Integration**: Recommend incorporating the Docker build into a CI pipeline for ongoing validation.
  - **Automated Tests**: Suggest running automated tests within the Docker container as part of the build process.

- **Documentation**:
  - **Comments in Dockerfile**: Include comments within the Dockerfile to explain non-obvious instructions.
  - **Readme Updates**: Suggest updating project documentation to reflect Docker usage and any changes made.
  - **Usage Instructions**: Provide guidance on how to run the Docker container, including any necessary environment variables or setup steps.

---

NOTE< --- THERE SHOULD BE NOOOOOO COMMENTS IN THE JSON THATS RETURNED WHAT SO EVER

**Note**: Please ensure that no part of the output, especially URLs or paths, is truncated at any point.


`;
