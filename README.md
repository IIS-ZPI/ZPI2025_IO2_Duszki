# CAS - Currency Analysis System

The Currency Analysis System (CAS) is a modern web-based 
analytical tool designed to automate the retrieval, 
processing, and visualization of financial data.

---

## 1. Technology used for project implementation

### Frontend
- React
- TypeScript
- Material Design

### Testing
- Vitest

### Data Source
- NBP Web API: http://api.nbp.pl/

### Version Control
- Git
- GitHub

### Architecture
- Single Page Application (SPA)

### Visualization
- Dynamic histograms and analytical charts rendered in the browser

---

## 2. Software deployment location or how to run the application

### Requirements
- Node.js
- npm
- Internet connection (required for NBP API communication)

### Local setup

```bash
git clone https://github.com/IIS-ZPI/ZPI2025_IO2_Duszki.git
cd frontend
npm install
npm run dev
```

### Run application

```bash
npm run dev
```

### Application will be available at:

http://localhost:5173

---

## 3. Location (folder) of project documentation

# todo

---

## 4. Location of backlogs

Backlog is maintained both in a dedicated project board 
(visual task tracking chart) and in GitHub Issues.

[Gantt chart](https://sharing.clickup.com/90121583604/g/h/2kxumezm-192/80ebfeb8dd14c8e?fbclid=IwY2xjawQ3TgNleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEenlBQNUtZ1mOh8dx0vREOUvwUWMbaSZMrsz_SS8hxSmMGePPZGVtNrd1nwrc_aem_fvWYj1p0EDYrDAG6IYq0dg)

---

## 5. CI implementation and unit test automation

- CI tool: GitHub Actions
- Pipeline name: `CAS Frontend CI`
- Pipeline location: `.github/workflows/`

### CI triggers

The pipeline runs automatically on:

- push to:
    - `main`
    - `develop`
    - `release`

- pull requests targeting:
    - `main`
    - `develop`
    - `release`

### Environment

- Operating system: `ubuntu-latest`
- Node.js version: `20`

### CI process

1. Repository checkout
2. Node.js setup
3. Dependency installation using:

```bash
npm ci
```

### Automated unit test execution using:
```bash
npx vitest run
```

### Unit testing

- Testing framework: Vitest
- Tests are executed automatically in the CI pipeline before merge.

---

## 6. Location of testing documentation

Bug reports and software repair procedures are maintained using GitHub Issues.

# todo