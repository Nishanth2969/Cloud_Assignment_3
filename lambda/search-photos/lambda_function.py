import json
import boto3
import logging
from requests_aws4auth import AWS4Auth
from opensearchpy import OpenSearch, RequestsHttpConnection

logger = logging.getLogger()
logger.setLevel(logging.INFO)

lex_client = boto3.client('lexv2-runtime')

# OpenSearch configuration
OPENSEARCH_HOST = 'your-opensearch-domain-endpoint'
OPENSEARCH_REGION = 'us-east-1'
OPENSEARCH_INDEX = 'photos'

# Lex Bot configuration
LEX_BOT_ID = 'your-bot-id'
LEX_BOT_ALIAS_ID = 'your-bot-alias-id'
LEX_LOCALE_ID = 'en_US'

def get_opensearch_client():
    """
    Initialize and return OpenSearch client with AWS authentication
    """
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(
        credentials.access_key,
        credentials.secret_key,
        OPENSEARCH_REGION,
        'es',
        session_token=credentials.token
    )
    
    client = OpenSearch(
        hosts=[{'host': OPENSEARCH_HOST, 'port': 443}],
        http_auth=awsauth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )
    
    return client

def disambiguate_query_with_lex(query):
    """
    Use Amazon Lex to extract keywords from natural language query
    Returns a list of keywords
    """
    try:
        response = lex_client.recognize_text(
            botId=LEX_BOT_ID,
            botAliasId=LEX_BOT_ALIAS_ID,
            localeId=LEX_LOCALE_ID,
            sessionId='search-session',
            text=query
        )
        
        logger.info(f"Lex response: {json.dumps(response)}")
        
        keywords = []
        
        # Extract slots from Lex response
        if 'sessionState' in response:
            intent = response['sessionState'].get('intent', {})
            slots = intent.get('slots', {})
            
            # Extract keyword slots
            if 'KeywordOne' in slots and slots['KeywordOne']:
                keyword_one = slots['KeywordOne'].get('value', {}).get('interpretedValue')
                if keyword_one:
                    keywords.append(keyword_one.lower())
            
            if 'KeywordTwo' in slots and slots['KeywordTwo']:
                keyword_two = slots['KeywordTwo'].get('value', {}).get('interpretedValue')
                if keyword_two:
                    keywords.append(keyword_two.lower())
        
        logger.info(f"Extracted keywords: {keywords}")
        return keywords
        
    except Exception as e:
        logger.error(f"Error calling Lex: {str(e)}")
        # Fallback to simple keyword extraction if Lex fails
        return extract_keywords_fallback(query)

def extract_keywords_fallback(query):
    """
    Fallback method to extract keywords if Lex is unavailable
    Simple word tokenization approach
    """
    stop_words = {'show', 'me', 'photos', 'with', 'of', 'a', 'an', 'the', 'in', 'them', 'and'}
    words = query.lower().split()
    keywords = [word.strip('.,!?') for word in words if word.lower() not in stop_words]
    logger.info(f"Fallback keywords: {keywords}")
    return keywords

def search_photos_in_opensearch(keywords):
    """
    Search OpenSearch index for photos matching the keywords
    Returns list of matching photos
    """
    if not keywords:
        return []
    
    try:
        client = get_opensearch_client()
        
        # Build query to search for any of the keywords in labels
        query = {
            'size': 100,
            'query': {
                'bool': {
                    'should': [
                        {'match': {'labels': keyword}} for keyword in keywords
                    ],
                    'minimum_should_match': 1
                }
            }
        }
        
        logger.info(f"OpenSearch query: {json.dumps(query)}")
        
        response = client.search(
            index=OPENSEARCH_INDEX,
            body=query
        )
        
        hits = response['hits']['hits']
        logger.info(f"Found {len(hits)} matching photos")
        
        # Extract photo information from search results
        results = []
        for hit in hits:
            source = hit['_source']
            results.append({
                'url': f"https://{source['bucket']}.s3.amazonaws.com/{source['objectKey']}",
                'labels': source['labels']
            })
        
        return results
        
    except Exception as e:
        logger.error(f"Error searching OpenSearch: {str(e)}")
        return []

def lambda_handler(event, context):
    """
    Main Lambda handler for searching photos
    Called by API Gateway
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract query from API Gateway event
        query_params = event.get('queryStringParameters', {})
        
        if not query_params or 'q' not in query_params:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Missing query parameter q'
                })
            }
        
        query = query_params['q']
        logger.info(f"Search query: {query}")
        
        # Use Lex to disambiguate the query
        keywords = disambiguate_query_with_lex(query)
        
        # Search OpenSearch for matching photos
        results = search_photos_in_opensearch(keywords)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'results': results,
                'query': query,
                'keywords': keywords
            })
        }
        
    except Exception as e:
        logger.error(f"Error processing search: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }

