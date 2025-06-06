data "aws_route53_zone" "techbeans_jp" {
  name         = var.route53_zone_name
  private_zone = false
}

resource "aws_route53_record" "tool_techbeans_jp" {
  zone_id = data.aws_route53_zone.techbeans_jp.zone_id
  name    = "${var.domain_name}."
  type    = "CNAME"
  ttl     = "300"
  records = [aws_cloudfront_distribution.site_distribution.domain_name]
}