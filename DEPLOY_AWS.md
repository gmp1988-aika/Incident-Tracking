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

## Option 1: AWS App Runner

1. Push the image to Amazon ECR.
2. Create an App Runner service from that ECR image.
3. Expose port `80`.
4. Reference [apprunner.yaml](C:\Users\PC\Documents\New project\apprunner.yaml) only as a base template if you later automate service creation from source tooling.

## Option 2: ECS Fargate

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
