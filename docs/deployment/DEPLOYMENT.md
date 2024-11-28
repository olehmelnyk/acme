# Deployment Guide

## Overview

Our deployment strategy follows a multi-environment approach with automated CI/CD pipelines.

## Environments

### Development
- Branch: `develop`
- URL: `dev.example.com`
- Auto-deploys on every push
- Feature flags enabled
- Debug logging enabled

### Staging
- Branch: `staging`
- URL: `staging.example.com`
- Deploys after QA approval
- Production-like environment
- Synthetic monitoring

### Production
- Branch: `main`
- URL: `example.com`
- Manual deployment approval
- Zero-downtime updates
- High availability setup

## Infrastructure (IaC)

```terraform
# Example Terraform configuration
provider "aws" {
  region = "us-west-2"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "main"
  cidr   = "10.0.0.0/16"

  azs             = ["us-west-2a", "us-west-2b", "us-west-2c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
}

module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  cluster_name    = "main"
  cluster_version = "1.27"
  subnet_ids      = module.vpc.private_subnets
  vpc_id          = module.vpc.vpc_id
}
```

## Deployment Process

1. **Build Phase**
   ```yaml
   build:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v3
       - uses: oven-sh/setup-bun@v1
       - run: bun install
       - run: bun run build
       - run: docker build -t app .
   ```

2. **Test Phase**
   ```yaml
   test:
     needs: build
     runs-on: ubuntu-latest
     steps:
       - run: bun test
       - run: bun run e2e
   ```

3. **Security Scan**
   ```yaml
   security:
     needs: test
     runs-on: ubuntu-latest
     steps:
       - run: bunx snyk test
       - run: bun update
   ```

4. **Deploy Phase**
   ```yaml
   deploy:
     needs: [test, security]
     runs-on: ubuntu-latest
     steps:
       - uses: aws-actions/configure-aws-credentials@v1
       - run: kubectl apply -f k8s/
   ```

## Kubernetes Configuration

```yaml
# Example deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: app
          image: app:latest
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 200m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
```

## Monitoring Setup

```yaml
# Prometheus configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['localhost:3000']
```

## Rollback Procedure

1. **Automatic Rollback**
   - Triggered by failed health checks
   - Reverts to last stable version
   - Alerts on-call team

2. **Manual Rollback**
   ```bash
   # Get deployment history
   kubectl rollout history deployment/app
   
   # Rollback to previous version
   kubectl rollout undo deployment/app
   
   # Rollback to specific version
   kubectl rollout undo deployment/app --to-revision=2
   ```

## Security Considerations

1. **Secrets Management**
   - AWS Secrets Manager for credentials
   - Kubernetes Secrets for sensitive data
   - Encrypted environment variables

2. **Network Security**
   - Private subnets for applications
   - Security groups for access control
   - WAF for API protection

3. **Compliance**
   - Audit logging enabled
   - Access control monitoring
   - Regular security scans

## Performance Optimization

1. **CDN Configuration**
   - Static assets on Cloudflare
   - Regional edge caching
   - Auto-minification

2. **Database Optimization**
   - Connection pooling
   - Read replicas
   - Query optimization

3. **Caching Strategy**
   - Redis for session data
   - Browser caching headers
   - API response caching
