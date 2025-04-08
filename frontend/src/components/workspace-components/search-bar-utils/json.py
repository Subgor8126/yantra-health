jsonData = {
    "Records": [
    {
        "eventVersion": "2.1", 
        "eventSource": "aws:s3", 
        "awsRegion": "us-east-1", 
        "eventTime": "2025-02-19T08:15:43.037Z", 
        "eventName": "ObjectCreated:Put",
        "userIdentity": {
            "principalId": "AWS:AIDA6GBMICYNKRCJROJFO"
        },
        "requestParameters": {
            "sourceIPAddress": "106.215.178.80"
        },
        "responseElements": {
            "x-amz-request-id": "FR8GQDE6KS82BTTG",
            "x-amz-id-2": "RalZGjKnWE1TrT6O62/uTyYBCBQ1ZDjpMZ5szYSnolhA0ll3+rYVvwe0rdDq0IIq9CXLEHgiYlTFukNY7/ynq3g62L1ze0nDIqfzBX2CBXI="
        },
        "s3": {
            "s3SchemaVersion": "1.0",
            "configurationId": "f0be015d-631f-430c-88e3-7ffa38059ac6",
            "bucket": {
                "name": "yantra-healthcare-imaging",
                "ownerIdentity": {
                    "principalId": "A17MXEOWHMGOFQ"
                },
                "arn": "arn:aws:s3:::yantra-healthcare-imaging"
            },
            "object": {
                "key": "04989458-2081-70ba-7740-7ec9c9f34b66/D97258/11053/0012.DCM",
                "size": 1364618,
                "eTag": "b6edd0f843c5f4c957e7a0e34ceb09ab",
                "sequencer": "0067B5932ED778DB6A"
            }
        }
    }
]
}

print(jsonData["Records"][0]["s3"]["key"])
