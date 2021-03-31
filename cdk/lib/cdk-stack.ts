import * as fs from 'fs';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as aws_lambda from '@aws-cdk/aws-lambda';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'inmytree-co-za', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../app/.vitepress/dist')],
      destinationBucket: websiteBucket,
    });

    /*
    const webTarget = 'inmytree.co.za';
    const certArnTarget = 'arn:aws:acm:us-east-1:xxx:certificate/xxxxxx';
    const certificate = acm.Certificate.fromCertificateArn(this, 'digitatatestcert', certArnTarget);
    */

    const cloudfrontDistribution = new cloudfront.Distribution(this, 'inmytree-co-za-distribution', {
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket)
      },
      //domainNames: [webTarget],
      //certificate
    });

    const invalidateCloudfrontLambda = new aws_lambda.Function(this, 'InvalidateCloudfront', {
      runtime: aws_lambda.Runtime.NODEJS_12_X,
      code: aws_lambda.Code.fromInline(fs.readFileSync('InvalidateCloudfront.js').toString()),
      handler: "index.handler"
    });

    const policy = new iam.PolicyStatement();
    policy.addResources('arn:aws:cloudfront::*:distribution/' + cloudfrontDistribution.distributionId);
    policy.addActions('cloudfront:*');
    invalidateCloudfrontLambda.addToRolePolicy(policy);


    const webappBuild = new codebuild.PipelineProject(this, 'inmytree-build', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            runtimeVersions: {
              nodejs: '12'
            },
            commands: [
              'ls',
              'apt-get install libxml2 libxml2-dev',
              'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -',
              'echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list',
              'apt update',
              'apt install yarn',
              'ls',
              'yarn install',
            ],
          },
          build: {
            commands: [
              'yarn build',
            ]
          },
          post_build: {
            commands: [
              'echo hi'
            ]
          }
        },
        artifacts: {
          'base-directory': 'app/.vitepress/dist',
          files: [
            '**/*'
          ],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });


    const sourceOutput = new codepipeline.Artifact();
    const webappFilesOutput = new codepipeline.Artifact('webapp');

    let stages: codepipeline.StageProps[] = [
    {
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: 'GitHub',
          owner: 'nicokruger',
          repo: 'inmytree.co.za',
          oauthToken: cdk.SecretValue.secretsManager('github-api-key', { jsonField: 'oauthToken' }),
          output: sourceOutput,
          branch: 'master',
        })
      ],
    },
    {
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Webapp_Build',
          project: webappBuild,
          input: sourceOutput,
          outputs: [webappFilesOutput]
        }),
      ],
    },
    {
      stageName: 'Deploy',
      actions: [

        new codepipeline_actions.S3DeployAction({
          actionName: 'Webapp_S3_Deploy',
          bucket: websiteBucket,
          input: webappFilesOutput,
        }),
      ],
    },
    {
      stageName: 'InvalidateCloudfront',
      actions: [
        new codepipeline_actions.LambdaInvokeAction({
          actionName: "InvalidateCloudFront",
          lambda: invalidateCloudfrontLambda,
          userParameters: {
            cloudfrontDistributionId: cloudfrontDistribution.distributionId
          }
        }),
      ]
    },
  ];

   new codepipeline.Pipeline(
     this,
     'inmytree-co-za-pipeline',
     {
       pipelineName: 'inmytree-co-za',
       stages
     });

    new cdk.CfnOutput(this, 'CloudfrontDomain', {
      value: cloudfrontDistribution.domainName
    });

  }
}
