# sam local invoke -e ./src/test/event.json SubmitVideo
# sam local start-api
sam build
sam deploy --s3-bucket palette-scraper-bucket \
            --stack-name palette-scraper \
            --capabilities CAPABILITY_IAM

# docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack