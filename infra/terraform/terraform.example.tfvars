# サイトを公開するFQDN名
domain_name = "subdomain.techbeans.jp"
# `us-east-1`に置いてあるワイルドカード証明書等のARNになります。
acm_certificate_arn = "arn:aws:acm:us-east-1:164933021637:certificate/3db1b489-12e5-4c17-90fb-271c008f50f7"
# サイトのコンテンツを置くS3バケット名
s3_bucket_name = "name-of-site-bucket"
# S3バケットの配置先リージョン
region = "ap-northeast-1"
# 公開するドメイン名が属しているRoute53のホストゾーン名
route53_zone_name = "techbeans.jp"