# Costor - GCP Cost Notifier

Costor is a lightweight, automated GCP billing reporter that sends daily cost summaries to a Discord channel via Cloud Functions. The infrastructure is managed using Terraform and the deployment is automated through Cloud Build.

## Project Structure

```
costor/
├── infrastructure/         # Terraform configuration
│   └── main.tf
├── functions/              # Cloud Function source code (TypeScript)
│   ├── index.ts
│   ├── package.json
│   └── tsconfig.json
├── cloudbuild.yaml         # CI/CD pipeline for deploying Cloud Function
└── README.md
```

## Features

* Daily GCP cost summary
* BigQuery billing export integration
* Discord notification via webhook
* Fully managed via Terraform
* Auto-deployment with Cloud Build on GitHub push

## Setup

### 1. Prerequisites

* GCP project with billing export enabled to BigQuery
* Discord server and webhook URL
* GitHub repository access

### 2. Environment Variables

Defined via Terraform:

* `DISCORD_WEBHOOK_URL` (stored in Secret Manager)
* `DATASET_ID` (set from Terraform to Cloud Function)

### 3. Deployment Steps

#### a. Clone the Repository

```bash
git clone https://github.com/your-username/costor.git
cd costor
```

#### b. Configure Terraform

Edit `infrastructure/terraform.tfvars`:

```hcl
project           = "your-gcp-project-id"
region            = "asia-northeast1"
zone              = "asia-northeast1-a"
discord_webhook_url = "YOUR_DISCORD_WEBHOOK_URL"
github_owner      = "your-github-username"
github_repo       = "costor"
```

#### c. Apply Infrastructure

```bash
cd infrastructure
terraform init
terraform apply
```

#### d. Setup GitHub Trigger

Push to `main` branch will automatically deploy:

```bash
git add .
git commit -m "Initialize Costor"
git push origin main
```

## CI/CD: Cloud Build

* Automatically runs on `main` branch push
* Builds and deploys Cloud Functions from `functions/`

## License

Apache License 2.0
