variable "domain_name" {
  description = "The custom domain name for the CloudFront distribution"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN in us-east-1 for CloudFront"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket containing the built Next.js artifacts"
  type        = string
}

variable "region" {
  description = "Region for Lambda and API Gateway"
  type        = string
  default     = "ap-northeast-1"
}

variable "route53_zone_name" {
  description = "Route53 zone name"
  type        = string
}
