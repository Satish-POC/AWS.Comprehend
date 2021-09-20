# AWS Comprehend service
A Lambda function get trigger by a dynamodb table (called feedback) when a new record is added. Lambda function reads the feedback and generates the sentiment score using aws comprehend api. Sentiment score is again saved back to the table against record with new attributes.
