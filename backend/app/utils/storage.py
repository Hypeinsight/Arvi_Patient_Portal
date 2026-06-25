import os
import boto3
from botocore.exceptions import ClientError


def _client():
    return boto3.client("s3")


def upload_to_storage(bucket: str, key: str, file_obj, content_type: str) -> int:
    file_obj.seek(0, 2)
    size = file_obj.tell()
    file_obj.seek(0)
    _client().upload_fileobj(
        file_obj, bucket, key,
        ExtraArgs={"ContentType": content_type}
    )
    return size


def delete_from_storage(bucket: str, key: str):
    try:
        _client().delete_object(Bucket=bucket, Key=key)
    except ClientError:
        pass