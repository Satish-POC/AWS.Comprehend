var AWS = require('aws-sdk');

exports.handler =  (event) => {
    console.log('Event : ', event.Records[0].dynamodb);
    console.log('Event simple : ', event);
    var comprehend = new AWS.Comprehend();

    var params = {
      LanguageCode: 'en', /* required */
      Text: event.Records[0].dynamodb.NewImage.fb.S /* required */
    }
    console.log(params);
    comprehend.detectSentiment(params, function(err, data) {
      if (err) {
          console.log(err, err.stack);// an error occurred
          return err;
      }
      else{
          //console.log(data);           // successful response
          updateSentiments( event.Records[0].dynamodb.NewImage, data);
          return data;
      }
      
    });
    
};

//RESPONSE
// {
//   Sentiment: 'POSITIVE',
//   SentimentScore: {
//     Positive: 0.9994576573371887,
//     Negative: 0.00008619420987088233,
//     Neutral: 0.0003661158261820674,
//     Mixed: 0.00009010817302623764
//   }
// }

const updateSentiments = (row, comprehendResponse) => {
  //console.log('updatesentiments called');
   console.log('row',row);
  // console.log(comprehendResponse);
  
  const table = "feedback";
  let senti = {
    txt : comprehendResponse.Sentiment,
    p : comprehendResponse.SentimentScore.Positive,
    n : comprehendResponse.SentimentScore.Negative,
    nu : comprehendResponse.SentimentScore.Neutral,
    m : comprehendResponse.SentimentScore.Mixed
  }
  console.log('senti',senti);
  var params = {
    TableName:table,
    Key:{
          "id": row.id.S,
          "fb": row.fb.S
      },
      UpdateExpression: "set s = :s, p = :p, n = :n, nu = :nu, m = :m",
      ExpressionAttributeValues:{
          ":s": senti.txt=='POSITIVE'?"p":(senti.txt=='NEGATIVE'?"n":(senti.txt=='NEUTRAL'?"nu":"m")),
          //":s": senti.txt,
          ":p": senti.p,
          ":n": senti.n,
          ":nu": senti.nu,
          ":m": senti.m
      },
      ReturnValues:"UPDATED_NEW"
  };
  var docClient = new AWS.DynamoDB.DocumentClient()
  docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  });  
}