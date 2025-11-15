# Smart Photo Album

A cloud-based photo album application with intelligent search capabilities using natural language processing. Built for Cloud Computing and Big Data Systems - Fall 2025 Assignment 3.

## Overview

This application allows users to upload photos and search for them using natural language queries. It leverages AWS services including Lambda, API Gateway, S3, Rekognition, Lex, and OpenSearch to provide intelligent photo indexing and retrieval.

## Architecture

The application consists of the following components:

- **Frontend (S3 + CloudFront)**: Static website for user interface
- **API Gateway**: RESTful API endpoints for upload and search
- **Lambda Functions**: 
  - `index-photos` (LF1): Processes uploaded photos and indexes metadata
  - `search-photos` (LF2): Handles search queries with NLP
- **S3 Buckets**:
  - Frontend bucket for hosting the web application
  - Photos bucket for storing uploaded images
- **AWS Rekognition**: Automatic image label detection
- **Amazon Lex**: Natural language query disambiguation
- **OpenSearch**: Full-text search index for photo metadata
- **CodePipeline**: CI/CD for automated deployment

## Features

- Upload photos with custom labels
- Automatic label detection using AWS Rekognition
- Natural language search (e.g., "show me dogs and cats")
- Support for single and multiple keyword searches
- Responsive web interface
- RESTful API with authentication

## Project Structure

```
Assign_3/
├── lambda/
│   ├── index-photos/
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   └── search-photos/
│       ├── lambda_function.py
│       └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── config.js
├── cloudformation/
│   └── template.yaml
├── lex-bot-config/
│   ├── utterances.txt
│   └── bot-setup-instructions.md
└── README.md
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Python 3.9 or higher
- Git repository for CodePipeline integration

## Deployment Instructions

### Step 1: Create OpenSearch Domain

1. Navigate to AWS OpenSearch Service console
2. Create a new domain named `photos`
3. Choose development configuration or customize as needed
4. Note the domain endpoint for later use

### Step 2: Deploy CloudFormation Stack

1. Update the parameters in `cloudformation/template.yaml`:
   - `OpenSearchDomainEndpoint`: Your OpenSearch endpoint
   - `LexBotId`: Your Lex bot ID (create bot first)
   - `LexBotAliasId`: Your Lex bot alias ID

2. Deploy the stack:

```bash
aws cloudformation create-stack \
  --stack-name photo-album-stack \
  --template-body file://cloudformation/template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=OpenSearchDomainEndpoint,ParameterValue=your-domain.us-east-1.es.amazonaws.com \
    ParameterKey=LexBotId,ParameterValue=your-bot-id \
    ParameterKey=LexBotAliasId,ParameterValue=your-alias-id
```

3. Wait for stack creation to complete:

```bash
aws cloudformation wait stack-create-complete \
  --stack-name photo-album-stack
```

### Step 3: Setup Amazon Lex Bot

1. Navigate to Amazon Lex V2 console
2. Create a new bot named `PhotoSearchBot`
3. Create an intent named `SearchIntent`
4. Add slots:
   - `KeywordOne` (AMAZON.AlphaNumeric)
   - `KeywordTwo` (AMAZON.AlphaNumeric)
5. Add sample utterances from `lex-bot-config/utterances.txt`
6. Build and test the bot
7. Create an alias and note the Bot ID and Alias ID

### Step 4: Update Lambda Functions

The CloudFormation template creates basic Lambda functions. For full functionality:

1. Package the Lambda functions with dependencies:

```bash
cd lambda/index-photos
pip install -r requirements.txt -t .
zip -r index-photos.zip .

cd ../search-photos
pip install -r requirements.txt -t .
zip -r search-photos.zip .
```

2. Update the Lambda functions:

```bash
aws lambda update-function-code \
  --function-name index-photos \
  --zip-file fileb://lambda/index-photos/index-photos.zip

aws lambda update-function-code \
  --function-name search-photos \
  --zip-file fileb://lambda/search-photos/search-photos.zip
```

### Step 5: Configure Frontend

1. Get the API Gateway URL and API Key from CloudFormation outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name photo-album-stack \
  --query 'Stacks[0].Outputs'
```

2. Update `frontend/config.js` with your values:
   - `BASE_URL`: API Gateway endpoint
   - `API_KEY`: API key from AWS console
   - `PHOTOS_BUCKET`: Photos bucket name

3. Upload frontend files to the frontend S3 bucket:

```bash
aws s3 sync frontend/ s3://photo-album-frontend-YOUR-ACCOUNT-ID/
```

### Step 6: Setup CodePipeline (Optional)

Create two pipelines for automated deployment:

#### Pipeline 1: Backend (Lambda Functions)

1. Create a GitHub repository for Lambda code
2. Create CodePipeline with:
   - Source: GitHub repository
   - Build: AWS CodeBuild to package Lambda functions
   - Deploy: Deploy to Lambda functions

#### Pipeline 2: Frontend

1. Create a GitHub repository for frontend code
2. Create CodePipeline with:
   - Source: GitHub repository
   - Deploy: Sync to S3 frontend bucket

## Usage

### Uploading Photos

1. Navigate to the frontend URL
2. Click "Choose a photo" and select an image
3. Optionally add custom labels (comma-separated)
4. Click "Upload Photo"
5. The photo will be automatically indexed with Rekognition labels

### Searching Photos

1. Enter a search query in the search box
   - Single keyword: "dogs"
   - Multiple keywords: "dogs and cats"
   - Natural language: "show me photos with mountains"
2. Click "Search"
3. Matching photos will be displayed with their labels

## API Documentation

### GET /search

Search for photos using natural language query.

**Parameters:**
- `q` (required): Search query string

**Headers:**
- `X-Api-Key`: API key for authentication

**Response:**
```json
{
  "results": [
    {
      "url": "https://bucket.s3.amazonaws.com/photo.jpg",
      "labels": ["dog", "cat", "outdoor"]
    }
  ],
  "query": "show me dogs",
  "keywords": ["dogs"]
}
```

### PUT /photos/{filename}

Upload a photo to the album.

**Parameters:**
- `filename` (path): Name of the file

**Headers:**
- `X-Api-Key`: API key for authentication
- `Content-Type`: Image MIME type
- `x-amz-meta-customLabels` (optional): Comma-separated custom labels

**Body:** Binary image data

## Configuration

### Lambda Environment Variables

**index-photos (LF1):**
- `OPENSEARCH_HOST`: OpenSearch domain endpoint
- `OPENSEARCH_REGION`: AWS region
- `OPENSEARCH_INDEX`: Index name (default: photos)

**search-photos (LF2):**
- `OPENSEARCH_HOST`: OpenSearch domain endpoint
- `OPENSEARCH_REGION`: AWS region
- `OPENSEARCH_INDEX`: Index name (default: photos)
- `LEX_BOT_ID`: Lex bot ID
- `LEX_BOT_ALIAS_ID`: Lex bot alias ID
- `LEX_LOCALE_ID`: Locale (default: en_US)

## Troubleshooting

### Lambda Not Triggered

- Check S3 bucket notification configuration
- Verify Lambda has permission to be invoked by S3
- Check CloudWatch logs for errors

### Search Returns No Results

- Verify OpenSearch domain is accessible
- Check Lambda logs for OpenSearch connection errors
- Ensure photos have been indexed (check OpenSearch index)

### Upload Fails

- Verify API Gateway S3 proxy configuration
- Check API key is valid
- Ensure S3 bucket has correct CORS configuration

### Lex Not Extracting Keywords

- Verify Lex bot is built and deployed
- Check bot ID and alias ID in Lambda configuration
- Review bot utterances and slot configuration

## Cleanup

To delete all resources:

```bash
# Empty S3 buckets first
aws s3 rm s3://photo-album-frontend-YOUR-ACCOUNT-ID/ --recursive
aws s3 rm s3://photo-album-storage-YOUR-ACCOUNT-ID/ --recursive

# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name photo-album-stack

# Delete OpenSearch domain manually from console
```

## Development

### Local Testing

Test Lambda functions locally:

```bash
cd lambda/index-photos
python -c "from lambda_function import lambda_handler; import json; print(lambda_handler({'Records': []}, {}))"
```

### Adding New Features

1. Update Lambda function code
2. Test locally
3. Deploy using CodePipeline or manual update
4. Update CloudFormation template if infrastructure changes

## Security Considerations

- API key authentication for all endpoints
- S3 bucket policies restrict access
- Lambda execution roles follow least privilege principle
- OpenSearch domain should use fine-grained access control
- Consider adding CloudFront with WAF for production

## Performance Optimization

- Lambda functions use appropriate memory allocation
- S3 objects use proper content types for caching
- OpenSearch queries optimized for label matching
- Consider adding CloudFront CDN for global distribution

## License

This project is created for educational purposes as part of Cloud Computing and Big Data Systems course.

## Acknowledgments

- Columbia University Cloud Computing Course
- AWS Documentation and Best Practices
- OpenSearch Documentation

