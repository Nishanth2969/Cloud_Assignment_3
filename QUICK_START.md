# Quick Start Guide

Get the Smart Photo Album up and running quickly.

## For Local Development and Testing

### Step 1: Install React Frontend

```bash
cd frontend-react
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your AWS configuration (or use defaults for testing UI):

```
REACT_APP_API_BASE_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod
REACT_APP_API_KEY=your-api-key
REACT_APP_PHOTOS_BUCKET=your-bucket-name
REACT_APP_REGION=us-east-1
```

### Step 3: Run Development Server

```bash
npm start
```

Application opens at `http://localhost:3000`

### Step 4: Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## For AWS Deployment

### Prerequisites

1. AWS CLI configured
2. AWS account with permissions
3. OpenSearch domain created
4. Lex bot configured

### Quick Deploy

1. **Deploy Infrastructure:**

```bash
cd cloudformation
aws cloudformation create-stack \
  --stack-name photo-album \
  --template-body file://template.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

2. **Update Lambda Functions:**

```bash
# Package and deploy LF1
cd lambda/index-photos
pip install -r requirements.txt -t package/
cd package && zip -r ../function.zip . && cd ..
zip -g function.zip lambda_function.py

aws lambda update-function-code \
  --function-name index-photos \
  --zip-file fileb://function.zip

# Package and deploy LF2
cd ../search-photos
pip install -r requirements.txt -t package/
cd package && zip -r ../function.zip . && cd ..
zip -g function.zip lambda_function.py

aws lambda update-function-code \
  --function-name search-photos \
  --zip-file fileb://function.zip
```

3. **Deploy Frontend:**

```bash
cd frontend-react
npm install
npm run build

aws s3 sync build/ s3://photo-album-frontend-YOUR-ACCOUNT-ID/
```

## Testing the Application

### Test Search

1. Navigate to the frontend URL
2. Enter a search query: "show me dogs"
3. Verify results appear

### Test Upload

1. Click "Choose a photo"
2. Select an image file
3. Add custom labels: "test, demo"
4. Click "Upload Photo"
5. Wait 30 seconds for indexing
6. Search for "test" to find the photo

## Verify Everything Works

### Checklist

- [ ] Frontend loads without errors
- [ ] Search input accepts text
- [ ] Search button is clickable
- [ ] File upload works
- [ ] Custom labels can be added
- [ ] Upload button triggers upload
- [ ] Photos appear in search results
- [ ] Labels display correctly
- [ ] All tests pass

### Check CloudWatch Logs

```bash
# Check LF1 logs
aws logs tail /aws/lambda/index-photos --follow

# Check LF2 logs
aws logs tail /aws/lambda/search-photos --follow
```

### Check OpenSearch

```bash
# Count documents
curl -X GET "https://your-opensearch-domain/photos/_count"

# Search all documents
curl -X GET "https://your-opensearch-domain/photos/_search?pretty"
```

## Common Commands

### Frontend

```bash
npm start          # Start dev server
npm test           # Run tests
npm run build      # Build for production
npm run test:coverage  # Test coverage
```

### AWS

```bash
# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name photo-album \
  --query 'Stacks[0].Outputs'

# Get API key value
aws apigateway get-api-keys --include-values

# List Lambda functions
aws lambda list-functions

# View logs
aws logs tail /aws/lambda/FUNCTION-NAME --follow
```

### Deployment

```bash
# Update Lambda
aws lambda update-function-code \
  --function-name FUNCTION-NAME \
  --zip-file fileb://function.zip

# Sync frontend
aws s3 sync build/ s3://BUCKET-NAME/

# Update stack
aws cloudformation update-stack \
  --stack-name photo-album \
  --template-body file://template.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

## Troubleshooting

### Frontend won't start

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Tests fail

```bash
npm install
npm test -- --clearCache
npm test
```

### API calls fail

- Check API Gateway URL in config
- Verify API key is correct
- Check CORS configuration
- View browser console for errors

### Upload fails

- Verify S3 bucket permissions
- Check API Gateway S3 proxy setup
- Ensure file size < 5MB
- Check CloudWatch logs

### Search returns no results

- Wait 30 seconds after upload for indexing
- Check Lambda LF1 logs
- Verify OpenSearch has documents
- Check Lex bot configuration

## Development Workflow

1. Make code changes
2. Run tests: `npm test`
3. Check locally: `npm start`
4. Build: `npm run build`
5. Deploy: `aws s3 sync build/ s3://bucket/`
6. Test in production

## Need Help?

- Check `README.md` for detailed documentation
- See `DEPLOYMENT_GUIDE.md` for step-by-step deployment
- Read `TESTING_GUIDE.md` for testing details
- Review `PROJECT_SUMMARY.md` for overview

## Quick Reference

### File Locations

- Lambda code: `lambda/*/lambda_function.py`
- Frontend: `frontend-react/src/`
- Tests: `frontend-react/src/**/*.test.js`
- CloudFormation: `cloudformation/template.yaml`
- Config: `frontend-react/src/config.js`

### Important URLs

- Frontend: `http://bucket-name.s3-website-region.amazonaws.com`
- API: `https://api-id.execute-api.region.amazonaws.com/prod`
- OpenSearch: `https://domain-endpoint.region.es.amazonaws.com`

### Key Configuration

- API Gateway: REST API with PUT/GET methods
- Lambda: Python 3.9 runtime
- OpenSearch: Index name "photos"
- S3: Two buckets (frontend + photos)

Happy coding!

