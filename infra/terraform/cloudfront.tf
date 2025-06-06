# -----------------------------
# CloudFront Distribution
# -----------------------------

resource "aws_cloudfront_distribution" "site_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Site distribution for ${var.domain_name}"
  default_root_object = "index.html"
  aliases             = [var.domain_name]

  origin {
    domain_name = "${var.s3_bucket_name}.s3.ap-northeast-1.amazonaws.com"
    origin_id   = "s3-origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }
}
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "Access Identity for S3 origin"
}
