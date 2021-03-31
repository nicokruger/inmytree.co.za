const aws = require('aws-sdk');
const cloudfront = new aws.CloudFront();
const codepipeline = new aws.CodePipeline();

exports.handler = async (event, context, callback) => {
const UserParameters = JSON.parse(event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters);
const distributionId = UserParameters.cloudfrontDistributionId;
const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
    CallerReference: 'codepipeline-' + (new Date().getTime()),
    Paths: {
        Quantity: 1,
        Items: [
        '/index.html'
        ]
    }
    }
}
await cloudfront.createInvalidation(params).promise();
const jobId = event["CodePipeline.job"].id;
console.log('marking', jobId);
await codepipeline.putJobSuccessResult({jobId}).promise();
callback(null, "success");
}
      
