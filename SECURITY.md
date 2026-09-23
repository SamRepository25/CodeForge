# Security Policy

## Supported Versions

Security updates are provided for the currently deployed version of CodeForge and the latest version available in the `main` branch.

Older versions may not receive security fixes.

## Reporting a Security Vulnerability

If you discover a security vulnerability in CodeForge, please report it privately rather than opening a public GitHub issue.

### Please include

- A clear description of the vulnerability
- The affected page, feature, endpoint, or component
- Steps to reproduce the issue
- The potential security impact
- Relevant screenshots, logs, or proof-of-concept details, if available
- Any suggested remediation, if you have one

Please avoid including passwords, authentication tokens, API keys, personal data, or other sensitive information in your report.

### Where to report

Please use the repository owner's available private contact method or GitHub's private vulnerability reporting features, if enabled for this repository.

Do **not** disclose the vulnerability publicly until it has been investigated and, where appropriate, a fix or mitigation has been released.

## Response Process

Security reports will be reviewed as soon as reasonably possible.

Depending on the severity and complexity of the issue, the response process may include:

1. Acknowledging receipt of the report.
2. Reproducing and validating the reported issue.
3. Assessing its security impact.
4. Developing and testing a fix or mitigation.
5. Deploying the fix where applicable.
6. Closing the report and documenting the resolution when appropriate.

Response and remediation timelines may vary depending on severity, available information, and the complexity of the affected component.

## Security Scope

Examples of issues that may be considered security vulnerabilities include:

- Authentication or authorization bypasses
- Improper access to private or administrative data
- SQL injection or other injection vulnerabilities
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Insecure direct object references or broken access controls
- Exposure of secrets, credentials, or sensitive configuration
- Security issues involving file uploads or storage
- Significant security misconfigurations

Please note that a vulnerability report does not guarantee that an issue will be accepted as a security vulnerability. Reports are assessed based on the actual security impact and affected functionality.

## Out of Scope

The following are generally not considered security vulnerabilities unless they demonstrate a meaningful security impact:

- Spam or content-quality issues
- Self-XSS requiring extensive social engineering
- Denial-of-service testing against production services
- Automated scanning that generates excessive traffic
- Issues affecting unsupported or obsolete browsers
- Vulnerabilities in third-party services that are outside CodeForge's control

Please do not perform destructive testing or intentionally disrupt the availability of CodeForge.

## Responsible Disclosure

Please give the project maintainers a reasonable opportunity to investigate and address a reported vulnerability before publicly disclosing it.

Thank you for helping keep CodeForge and its users secure.
