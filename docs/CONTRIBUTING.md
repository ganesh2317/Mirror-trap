# Contributing to MirrorTrap

Thank you for your interest in contributing to **MirrorTrap**! We welcome bug reports, security enhancements, feature proposals, and documentation improvements.

---

## 📜 Code of Conduct

Maintain a professional, safe, and collaborative environment. All interactions in issues, pull requests, and discussions must adhere to open-source community standards.

---

## 🛠️ Local Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Mirror-trap.git
   cd Mirror-trap
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Verify Quality Checks**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 🌿 Branch & Commit Conventions

- Use short, descriptive branch names:
  - `feat/feature-name`
  - `fix/bug-description`
  - `docs/topic-name`
  - `perf/optimization-description`

- Follow Semantic Commit Messages:
  - `feat(scope): add new capability`
  - `fix(scope): resolve bug or runtime fault`
  - `docs(scope): update developer documentation`
  - `perf(scope): optimize render execution`

---

## 🚀 Pull Request Checklist

Before submitting a Pull Request:
- [ ] Run `npm run lint` with 0 errors and 0 warnings.
- [ ] Run `npm run build` to verify clean TypeScript compilation.
- [ ] Ensure no secret keys or private credentials are included.
- [ ] Provide a clear summary of changes and manual test results.
