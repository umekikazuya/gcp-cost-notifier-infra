terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}

# 1. BigQuery Dataset for Billing Export
resource "google_bigquery_dataset" "costor_billing" {
  dataset_id = "costor_billing_export"
  location   = var.region
}

# 2. Secret Manager - discord Channel Token
resource "google_secret_manager_secret" "costor_discord_webhook_url" {
  secret_id = "costor-discord-token"
  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "costor_discord_webhook_url_version" {
  secret      = google_secret_manager_secret.costor_discord_webhook_url.id
  secret_data = var.discord_webhook_url
}


# 3. Cloud Scheduler - Runs daily at 9:00 AM JST
resource "google_cloud_scheduler_job" "costor_scheduler" {
  name      = "costor-scheduler"
  schedule  = "0 9 * * *"
  time_zone = "Asia/Tokyo"


  http_target {
    http_method = "GET"
    uri         = "https://REGION-PROJECT_ID.cloudfunctions.net/costor-notify"
  }

}
