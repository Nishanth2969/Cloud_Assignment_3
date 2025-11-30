import json
import boto3
import logging
from requests_aws4auth import AWS4Auth
from opensearchpy import OpenSearch, RequestsHttpConnection

logger = logging.getLogger()
logger.setLevel(logging.INFO)

lex_client = boto3.client('lexv2-runtime', region_name="us-east-1")

# OpenSearch configuration
OPENSEARCH_HOST = 'search-photos-ts2i64orwoedpcgg26fppjkprm.us-east-1.es.amazonaws.com'
OPENSEARCH_REGION = 'us-east-1'
OPENSEARCH_INDEX = 'photos'

# Lex Bot configuration
LEX_BOT_ID = '7IXHBBLFQO'
LEX_BOT_ALIAS_ID = 'TSTALIASID'
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
    try:
        response = lex_client.recognize_text(
            botId=LEX_BOT_ID,
            botAliasId=LEX_BOT_ALIAS_ID,
            localeId=LEX_LOCALE_ID,
            sessionId='search-session',
            text=query
        )
        logger.info(f"Lex response: {json.dumps(response, default=str)}")

        keywords = []
        slots = response.get('sessionState', {}).get('intent', {}).get('slots', {})
        for slot_name in ['KeywordOne', 'KeywordTwo']:
            if slots.get(slot_name):
                kw = slots[slot_name].get('value', {}).get('interpretedValue')
                if kw:
                    keywords.append(kw.lower())

        if not keywords:
            keywords = extract_keywords_fallback(query)

        logger.info(f"Extracted keywords: {keywords}")
        return keywords
    except Exception as e:
        logger.error(f"Error calling Lex: {str(e)}")
        return extract_keywords_fallback(query)


def extract_keywords_fallback(query):
    """
    Fallback method to extract keywords if Lex is unavailable
    """
    stop_words = {'show', 'me', 'photos', 'with', 'of', 'a', 'an', 'the', 'in', 'them', 'and', 'find', 'get'}
    words = query.lower().split()
    keywords = [word.strip('.,!?"\'') for word in words if word.lower() not in stop_words and len(word) > 1]
    logger.info(f"Fallback keywords: {keywords}")
    return keywords


def search_photos_in_opensearch(keywords):
    """
    Search OpenSearch for photos matching the keywords
    Returns unique results only
    """
    if not keywords:
        return []

    try:
        client = get_opensearch_client()
        norm_keywords = [kw.strip().strip('"').lower() for kw in keywords if kw.strip()]

        if not norm_keywords:
            return []

        query = {
            "size": 100,
            "query": {
                "bool": {
                    "should": [
                        {"match": {"labels": kw}} for kw in norm_keywords
                    ],
                    "minimum_should_match": 1
                }
            },
            "_source": ["objectKey", "bucket", "labels", "createdTimestamp"]
        }

        logger.info(f"OpenSearch query: {json.dumps(query)}")
        response = client.search(index=OPENSEARCH_INDEX, body=query)
        hits = response['hits']['hits']
        logger.info(f"Found {len(hits)} total hits from OpenSearch")

        # Deduplicate results by objectKey
        seen_keys = set()
        results = []

        for hit in hits:
            source = hit['_source']
            object_key = source.get('objectKey')
            
            # Skip if we've already seen this object
            if object_key in seen_keys:
                continue
                
            seen_keys.add(object_key)
            
            bucket = source.get('bucket', '')
            url = f"https://{bucket}.s3.amazonaws.com/{object_key}"
            
            results.append({
                'url': url,
                'labels': source.get('labels', []),
                'objectKey': object_key,
                'createdTimestamp': source.get('createdTimestamp', '')
            })

        logger.info(f"Returning {len(results)} unique results")
        return results

    except Exception as e:
        logger.error(f"Error searching OpenSearch: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return []


def lambda_handler(event, context):
    """
    Main Lambda handler for searching photos
    """
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        query_params = event.get('queryStringParameters', {})

        if not query_params or 'q' not in query_params:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,x-api-key',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Missing query parameter q'
                })
            }

        query = query_params['q']
        logger.info(f"Search query: {query}")

        keywords = disambiguate_query_with_lex(query)
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
        import traceback
        logger.error(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Internal server error'
            })
        }

