# CI/CD Pipeline Documentation

## Overview

Our CI/CD pipeline automates:

- Code quality checks
- Testing
- Security scanning
- Building
- Deployment
- Monitoring

## Pipeline Configuration

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Format check
        run: npm run format:check

  test:
    name: Test
    needs: quality
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

  security:
    name: Security Scan
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run SAST
        uses: github/codeql-action/analyze@v2

      - name: Run dependency scan
        run: npm audit

      - name: Run container scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'

  build:
    name: Build
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster staging \
            --service api \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster staging \
            --services api

  deploy-production:
    name: Deploy to Production
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster production \
            --service api \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster production \
            --services api
```

### 2. Docker Configuration

```dockerfile
# Dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

USER node

CMD ["npm", "start"]
```

### 3. Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/org/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: database-url
          resources:
            limits:
              cpu: '1'
              memory: '1Gi'
            requests:
              cpu: '500m'
              memory: '512Mi'
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
```

## Deployment Strategies

### 1. Blue-Green Deployment

```typescript
// scripts/deploy/blue-green.ts
import { ECS } from 'aws-sdk';

async function blueGreenDeploy(cluster: string, service: string, taskDefinition: string): Promise<void> {
  const ecs = new ECS();

  // Update service with new task definition
  await ecs
    .updateService({
      cluster,
      service,
      taskDefinition,
      deploymentConfiguration: {
        deploymentCircuitBreaker: {
          enable: true,
          rollback: true,
        },
        maximumPercent: 200,
        minimumHealthyPercent: 100,
      },
    })
    .promise();

  // Wait for deployment to complete
  await ecs
    .waitFor('servicesStable', {
      cluster,
      services: [service],
    })
    .promise();
}
```

### 2. Canary Deployment

```yaml
# k8s/canary.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: api
spec:
  hosts:
    - api.example.com
  http:
    - route:
        - destination:
            host: api
            subset: v1
          weight: 90
        - destination:
            host: api
            subset: v2
          weight: 10
```

## Monitoring and Rollback

### 1. Deployment Monitoring

```typescript
// src/monitoring/deployment.ts
import { Counter, Gauge } from 'prom-client';

export const deploymentDuration = new Histogram({
  name: 'deployment_duration_seconds',
  help: 'Duration of deployments in seconds',
  labelNames: ['environment', 'status'],
});

export const deploymentStatus = new Gauge({
  name: 'deployment_status',
  help: 'Status of the deployment (1 = success, 0 = failure)',
  labelNames: ['environment'],
});

export const rollbackCount = new Counter({
  name: 'deployment_rollback_total',
  help: 'Total number of deployment rollbacks',
  labelNames: ['environment'],
});
```

### 2. Automated Rollback

```typescript
// scripts/deploy/rollback.ts
async function autoRollback(metrics: DeploymentMetrics, thresholds: Thresholds): Promise<void> {
  if (metrics.errorRate > thresholds.errorRate || metrics.latency > thresholds.latency || metrics.cpuUsage > thresholds.cpuUsage) {
    console.log('Metrics exceeded thresholds, initiating rollback');

    await rollbackDeployment();

    rollbackCount.inc({ environment: process.env.NODE_ENV });
  }
}
```

## Pipeline Optimization

### 1. Caching Strategy

```yaml
# .github/workflows/cache.yml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache build
  uses: actions/cache@v3
  with:
    path: |
      .next
      dist
    key: ${{ runner.os }}-build-${{ github.sha }}
```

### 2. Test Optimization

```typescript
// jest.config.js
module.exports = {
  maxWorkers: '50%',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts', '!src/test/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Best Practices

1. **Environment Management**

   ```yaml
   # .github/workflows/environments.yml
   environments:
     staging:
       deployment_branch: main
       url: https://staging.example.com
       protection_rules:
         - required_reviewers: 1
         - wait_timer: 30

     production:
       deployment_branch: main
       url: https://example.com
       protection_rules:
         - required_reviewers: 2
         - wait_timer: 60
   ```

2. **Secret Management**

   ```yaml
   # .github/workflows/secrets.yml
   - name: Configure secrets
     uses: azure/k8s-set-context@v2
     with:
       secret-type: 'kubernetes.io/dockerconfigjson'
       secret-name: 'registry-credentials'
       namespace: 'default'
       arguments: |
         --from-literal=.dockerconfigjson=${{ secrets.DOCKER_CONFIG_JSON }}
   ```

3. **Pipeline Security**
   ```yaml
   # .github/workflows/security.yml
   - name: Security scan
     uses: aquasecurity/trivy-action@master
     with:
       scan-type: 'fs'
       security-checks: 'vuln,config,secret'
       severity: 'CRITICAL,HIGH'
       timeout: '10m'
   ```

## Deployment Checklist

1. **Pre-deployment**

   - [ ] All tests passing
   - [ ] Security scans passed
   - [ ] Dependencies up to date
   - [ ] Documentation updated

2. **Deployment**

   - [ ] Database migrations ready
   - [ ] Environment variables configured
   - [ ] Backup strategy in place
   - [ ] Rollback plan prepared

3. **Post-deployment**
   - [ ] Health checks passing
   - [ ] Metrics within normal range
   - [ ] Logs showing normal activity
   - [ ] User reports normal
