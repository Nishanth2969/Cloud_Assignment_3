import json
import boto3
import logging
from datetime import datetime
from urllib.parse import unquote_plus
from requests_aws4auth import AWS4Auth
from opensearchpy import OpenSearch, RequestsHttpConnection

logger = logging.getLogger()
logger.setLevel(logging.INFO)

rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')

# OpenSearch configuration
OPENSEARCH_HOST = 'search-photos-ts2i64orwoedpcgg26fppjkprm.us-east-1.es.amazonaws.com'
OPENSEARCH_REGION = 'us-east-1'
OPENSEARCH_INDEX = 'photos'


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


def detect_labels_from_image(bucket, key):
    """
    Use AWS Rekognition to detect labels in the image
    Returns a list of label names
    """
    try:
        response = rekognition.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': key
                }
            },
            MaxLabels=12,
            MinConfidence=70
        )

        labels = [label['Name'].lower() for label in response['Labels']]
        logger.info(f"Detected labels: {labels}")
        return labels

    except Exception as e:
        logger.error(f"Error detecting labels: {str(e)}")
        raise


def get_custom_labels(bucket, key):
    try:
        response = s3.head_object(Bucket=bucket, Key=key)
        metadata = response.get('Metadata', {})

        custom_labels_str = metadata.get('customlabels', '')

        if custom_labels_str:
            # Remove any surrounding quotes
            custom_labels = [label.strip().strip('"').lower()
                             for label in custom_labels_str.split(',')
                             if label.strip()]

            return custom_labels

        return []

    except Exception as e:
        logger.error(f"Error retrieving custom labels: {str(e)}")
        return []


def index_photo_to_opensearch(photo_data):
    """
    Index the photo document into OpenSearch
    """
    try:
        client = get_opensearch_client()

        response = client.index(
            index=OPENSEARCH_INDEX,
            body=photo_data,
            refresh=True
        )

        logger.info(f"Successfully indexed photo: {photo_data['objectKey']}")
        return response

    except Exception as e:
        logger.error(f"Error indexing to OpenSearch: {str(e)}")
        raise


def lambda_handler(event, context):
    """
    Main Lambda handler for indexing photos
    Triggered by S3 PUT events
    """
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        # Parse S3 event
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            key = unquote_plus(record['s3']['object']['key'])

            logger.info(f"Processing file: {key} from bucket: {bucket}")

            # Get timestamp from event or use current time
            timestamp = record['eventTime']
            created_timestamp = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%S.%fZ').isoformat()

            # Detect labels using Rekognition
            rekognition_labels = detect_labels_from_image(bucket, key)

            # Get custom labels from S3 metadata
            custom_labels = get_custom_labels(bucket, key)

            # Combine all labels
            all_labels = list(set(rekognition_labels + custom_labels))

            # Build the JSON object for OpenSearch
            photo_document = {
                'objectKey': key,
                'bucket': bucket,
                'createdTimestamp': created_timestamp,
                'labels': all_labels
            }

            logger.info(f"Photo document: {json.dumps(photo_document)}")

            # Index the photo document
            index_photo_to_opensearch(photo_document)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Photo indexed successfully'
            })
        }

    except Exception as e:
        logger.error(f"Error processing event: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

