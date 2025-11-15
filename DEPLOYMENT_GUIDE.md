# Deployment Guide - Smart Photo Album

This guide provides step-by-step instructions for deploying the Smart Photo Album application.

## Quick Start

### Prerequisites Checklist

- [ ] AWS Account with administrator access
- [ ] AWS CLI installed and configured
- [ ] Python 3.9+ installed
- [ ] Git installed
- [ ] Text editor or IDE

## Detailed Deployment Steps

### Phase 1: OpenSearch Setup

#### 1.1 Create OpenSearch Domain

```bash
aws opensearch create-domain \
  --domain-name photos \
  --engine-version OpenSearch_2.5 \
  --cluster-config InstanceType=t3.small.search,InstanceCount=1 \
  --ebs-options EBSEnabled=true,VolumeType=gp3,VolumeSize=10 \
  --access-policies '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"AWS": "*"},
      "Action": "es:*",
      "Resource": "arn:aws:es:us-east-1:YOUR-ACCOUNT-ID:domain/photos/*"
    }]
  }'
```

#### 1.2 Wait for Domain Creation

```bash
aws opensearch describe-domain --domain-name photos --query 'DomainStatus.Processing'
```

Wait until it returns `false`, then get the endpoint:

```bash
aws opensearch describe-domain \
  --domain-name photos \
  --query 'DomainStatus.Endpoint' \
  --output text
```

Save this endpoint for later use.

#### 1.3 Create OpenSearch Index

```bash
curl -X PUT "https://YOUR-OPENSEARCH-ENDPOINT/photos" \
  -H 'Content-Type: application/json' \
  -d '{
    "mappings": {
      "properties": {
        "objectKey": {"type": "keyword"},
        "bucket": {"type": "keyword"},
        "createdTimestamp": {"type": "date"},
        "labels": {"type": "keyword"}
      }
    }
  }'
```

### Phase 2: Lex Bot Configuration

#### 2.1 Create Lex Bot via Console

1. Go to Amazon Lex console
2. Click "Create bot"
3. Select "Create a blank bot"
4. Bot name: `PhotoSearchBot`
5. IAM role: Create new role
6. Language: English (US)
7. Click "Done"

#### 2.2 Create Intent

1. Click "Add intent" > "Add empty intent"
2. Intent name: `SearchIntent`
3. Click "Add"

#### 2.3 Add Slots

Add first slot:
1. Scroll to "Slots" section
2. Click "Add slot"
3. Name: `KeywordOne`
4. Slot type: `AMAZON.AlphaNumeric`
5. Required: No
6. Click "Add"

Add second slot:
1. Click "Add slot"
2. Name: `KeywordTwo`
3. Slot type: `AMAZON.AlphaNumeric`
4. Required: No
5. Click "Add"

#### 2.4 Add Sample Utterances

Copy from `lex-bot-config/utterances.txt` and add:

```
{KeywordOne}
show me {KeywordOne}
{KeywordOne} and {KeywordTwo}
show me {KeywordOne} and {KeywordTwo}
show me photos with {KeywordOne}
show me photos with {KeywordOne} and {KeywordTwo}
find {KeywordOne}
find photos of {KeywordOne}
I want to see {KeywordOne}
```

#### 2.5 Build and Test

1. Click "Save intent"
2. Click "Build"
3. Wait for build to complete
4. Test with: "show me dogs"

#### 2.6 Create Alias

1. Click "Aliases" in left menu
2. Click "Create alias"
3. Alias name: `prod`
4. Version: Use latest
5. Click "Create"

#### 2.7 Get Bot IDs

```bash
# List bots to get Bot ID
aws lexv2-models list-bots --query 'botSummaries[?botName==`PhotoSearchBot`]'

# Get Alias ID
aws lexv2-models list-bot-aliases \
  --bot-id YOUR-BOT-ID \
  --query 'botAliasSummaries[?botAliasName==`prod`]'
```

Save both IDs for CloudFormation deployment.

### Phase 3: CloudFormation Deployment

#### 3.1 Update Template Parameters

Edit `cloudformation/template.yaml` and update default values:

```yaml
Parameters:
  OpenSearchDomainEndpoint:
    Default: 'your-actual-endpoint.us-east-1.es.amazonaws.com'
  LexBotId:
    Default: 'your-actual-bot-id'
  LexBotAliasId:
    Default: 'your-actual-alias-id'
```

#### 3.2 Deploy Stack

```bash
aws cloudformation create-stack \
  --stack-name photo-album-stack \
  --template-body file://cloudformation/template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

#### 3.3 Monitor Deployment

```bash
aws cloudformation describe-stack-events \
  --stack-name photo-album-stack \
  --query 'StackEvents[0:10].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId]' \
  --output table
```

#### 3.4 Get Stack Outputs

```bash
aws cloudformation describe-stacks \
  --stack-name photo-album-stack \
  --query 'Stacks[0].Outputs' \
  --output table
```

Save all output values.

### Phase 4: Lambda Function Updates

#### 4.1 Update Index Photos Lambda

The basic Lambda is deployed by CloudFormation. To add full OpenSearch functionality:

1. Create deployment package:

```bash
cd lambda/index-photos
pip install -r requirements.txt -t package/
cd package
zip -r ../index-photos.zip .
cd ..
zip -g index-photos.zip lambda_function.py
```

2. Update function:

```bash
aws lambda update-function-code \
  --function-name index-photos \
  --zip-file fileb://index-photos.zip
```

3. Update environment variables:

```bash
aws lambda update-function-configuration \
  --function-name index-photos \
  --environment Variables="{
    OPENSEARCH_HOST='your-opensearch-endpoint',
    OPENSEARCH_REGION='us-east-1',
    OPENSEARCH_INDEX='photos'
  }"
```

#### 4.2 Update Search Photos Lambda

1. Create deployment package:

```bash
cd lambda/search-photos
pip install -r requirements.txt -t package/
cd package
zip -r ../search-photos.zip .
cd ..
zip -g search-photos.zip lambda_function.py
```

2. Update function:

```bash
aws lambda update-function-code \
  --function-name search-photos \
  --zip-file fileb://search-photos.zip
```

3. Update environment variables:

```bash
aws lambda update-function-configuration \
  --function-name search-photos \
  --environment Variables="{
    OPENSEARCH_HOST='your-opensearch-endpoint',
    OPENSEARCH_REGION='us-east-1',
    OPENSEARCH_INDEX='photos',
    LEX_BOT_ID='your-bot-id',
    LEX_BOT_ALIAS_ID='your-alias-id',
    LEX_LOCALE_ID='en_US'
  }"
```

### Phase 5: API Gateway Configuration

#### 5.1 Get API Key Value

```bash
aws apigateway get-api-keys --include-values --query 'items[0].value' --output text
```

Save this value for frontend configuration.

#### 5.2 Test API Endpoints

Test search endpoint:

```bash
curl -X GET \
  "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/search?q=test" \
  -H "X-Api-Key: YOUR-API-KEY"
```

### Phase 6: Frontend Deployment

#### 6.1 Update Frontend Configuration

Edit `frontend/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod',
    API_KEY: 'YOUR-API-KEY-VALUE',
    PHOTOS_BUCKET: 'photo-album-storage-YOUR-ACCOUNT-ID',
    REGION: 'us-east-1'
};
```

#### 6.2 Upload Frontend Files

```bash
aws s3 sync frontend/ s3://photo-album-frontend-YOUR-ACCOUNT-ID/ \
  --exclude ".git/*" \
  --exclude ".DS_Store"
```

#### 6.3 Verify Website

Get the website URL:

```bash
aws cloudformation describe-stacks \
  --stack-name photo-album-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendWebsiteURL`].OutputValue' \
  --output text
```

Open this URL in your browser.

### Phase 7: Testing

#### 7.1 Test Upload

1. Navigate to frontend URL
2. Select a test image
3. Add custom label: "test"
4. Click "Upload Photo"
5. Check S3 bucket for uploaded file
6. Check CloudWatch logs for index-photos Lambda

#### 7.2 Test Search

1. Wait 30 seconds for indexing
2. Search for "test"
3. Verify the uploaded photo appears in results

#### 7.3 Test Rekognition Labels

1. Upload an image without custom labels
2. Wait for indexing
3. Check CloudWatch logs to see detected labels
4. Search for one of the detected labels
5. Verify the photo appears

### Phase 8: CodePipeline Setup (Optional)

#### 8.1 Create GitHub Repositories

```bash
# Backend repository
mkdir photo-album-backend
cd photo-album-backend
git init
cp -r ../lambda/* .
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/photo-album-backend.git
git push -u origin main

# Frontend repository
cd ..
mkdir photo-album-frontend
cd photo-album-frontend
git init
cp -r ../frontend/* .
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/photo-album-frontend.git
git push -u origin main
```

#### 8.2 Create Backend Pipeline

Create `buildspec.yml` for backend:

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      python: 3.9
  build:
    commands:
      - cd index-photos
      - pip install -r requirements.txt -t .
      - zip -r ../index-photos.zip .
      - cd ../search-photos
      - pip install -r requirements.txt -t .
      - zip -r ../search-photos.zip .
artifacts:
  files:
    - index-photos.zip
    - search-photos.zip
```

#### 8.3 Create Frontend Pipeline

Create `buildspec.yml` for frontend:

```yaml
version: 0.2
phases:
  build:
    commands:
      - echo "Frontend build"
artifacts:
  files:
    - '**/*'
  base-directory: .
```

## Validation Checklist

- [ ] OpenSearch domain is active and accessible
- [ ] Lex bot responds correctly to test queries
- [ ] CloudFormation stack created successfully
- [ ] Lambda functions have correct environment variables
- [ ] S3 trigger invokes index-photos Lambda
- [ ] API Gateway returns responses (not 403/500)
- [ ] Frontend loads without console errors
- [ ] Photo upload works
- [ ] Photo indexing works (check CloudWatch logs)
- [ ] Search returns results
- [ ] Custom labels work

## Common Issues and Solutions

### Issue: OpenSearch Access Denied

**Solution:** Update OpenSearch access policy to allow Lambda execution roles.

### Issue: Lambda Timeout

**Solution:** Increase Lambda timeout and memory in CloudFormation template.

### Issue: CORS Errors

**Solution:** Verify OPTIONS methods are configured in API Gateway.

### Issue: Photos Not Indexing

**Solution:** Check S3 event notification configuration and Lambda permissions.

### Issue: Search Returns Empty

**Solution:** Verify OpenSearch index exists and has documents using:

```bash
curl "https://YOUR-OPENSEARCH-ENDPOINT/photos/_search?pretty"
```

## Rollback Procedures

### Rollback CloudFormation

```bash
aws cloudformation delete-stack --stack-name photo-album-stack
```

### Delete OpenSearch Domain

```bash
aws opensearch delete-domain --domain-name photos
```

### Delete Lex Bot

```bash
aws lexv2-models delete-bot --bot-id YOUR-BOT-ID --skip-resource-in-use-check
```

## Next Steps

1. Configure custom domain name
2. Add CloudFront distribution
3. Implement user authentication with Cognito
4. Add CloudWatch dashboards for monitoring
5. Set up alerts for errors
6. Configure backup for OpenSearch
7. Implement CI/CD with CodePipeline

## Support

For issues or questions:
- Check CloudWatch Logs for Lambda functions
- Review API Gateway execution logs
- Verify IAM permissions
- Check OpenSearch domain health

