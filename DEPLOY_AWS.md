# Deploy AWS

## Build local image

```powershell
docker build -t incident-tracking:latest .
```

## Run local container

```powershell
docker run --rm -p 8080:80 incident-tracking:latest
```

App local:

- http://localhost:8080

## Option 1: AWS App Runner from source repository

Use [apprunner.yaml](C:\Users\PC\Documents\New project\apprunner.yaml) only when you create the App Runner service from a GitHub source repository.

1. Connect the GitHub repository to App Runner.
2. Create the service using source code deployment.
3. Let App Runner read `apprunner.yaml`.
4. App Runner will:
   - install dependencies with `npm ci`
   - build the SPA with `npm run build`
   - serve it with `npm start` on port `8080`

Important:

- `apprunner.yaml` is for source-code deployments, not for ECR image deployments.
- The managed runtime must be a supported value such as `nodejs22`.

## Option 2: AWS App Runner from ECR image

1. Push the image to Amazon ECR.
2. Create an App Runner service from that ECR image.
3. Expose port `80`.
4. Do not use `apprunner.yaml` in this flow. App Runner will run the container image directly.

## Option 3: ECS Fargate

1. Push the image to Amazon ECR.
2. Use [ecs-task-definition.json](C:\Users\PC\Documents\New project\ecs-task-definition.json) as the base task definition.
3. Container port: `80`.
4. Run it behind an Application Load Balancer if public access is needed.

## Push image to ECR

Replace placeholders before running:

```powershell
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker tag incident-tracking:latest <account-id>.dkr.ecr.<region>.amazonaws.com/incident-tracking:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/incident-tracking:latest
```

## Register ECS task definition

Replace placeholders in [ecs-task-definition.json](C:\Users\PC\Documents\New project\ecs-task-definition.json), then run:

```powershell
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```
