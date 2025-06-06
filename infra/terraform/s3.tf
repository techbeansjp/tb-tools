# S3バケットを作成
resource "aws_s3_bucket" "origin_bucket" {
  bucket = var.s3_bucket_name
}

# S3バケットのパブリックアクセスをブロック
resource "aws_s3_bucket_public_access_block" "origin_block" {
  bucket = aws_s3_bucket.origin_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3バケットのポリシーを作成
# CloudFrontからのみアクセス可能
resource "aws_s3_bucket_policy" "origin_policy" {
  bucket = aws_s3_bucket.origin_bucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal",
        Effect    = "Allow",
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        },
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.origin_bucket.arn}/*"
      }
    ]
  })
}