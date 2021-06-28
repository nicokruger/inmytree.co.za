---
title: 'Monitor all your existing deployments with CloudWatch, Step Functions and CDK'
description: "How we are pulling all our important on-premise metrics/KPI's into CloudWatch using a robust, serverless and low-cost approach by leveraging Step Functions, CDK, your VPC and Lambda."
head:
- - meta
  - name: description
    content: "How we are pulling all our important on-premise metrics/KPI's into CloudWatch using a robust, serverless and low-cost approach by leveraging Step Functions, CDK, your VPC and Lambda."

- - meta
  - property: "og:type"
    content: "website"
- - meta
  - property: "og:url"
    content: "https://www.inmytree.co.za/monitor-existing-deployments-cloudwatch-step-functions-cdk/"
- - meta
  - property: "og:title"
    content: 'Monitor all your existing deployments with CloudWatch, Step Functions and CDK'
- - meta
  - property: "og:description"
    content: "Taking advantage of AWS Free Tier, you can host your own blog for free. Using basic AWS services, it can also auto-update whenever you commit markdown to a GitHub repo."
- - meta
  - property: "og:image"
    content: "https://www.inmytree.co.za/social/aws-deploy-blog.png"
- - meta
  - property: "twitter:card"
    content: "summary_large_image"
- - meta
  - property: "twitter:url"
    content: "https://www.inmytree.co.za/monitor-existing-deployments-cloudwatch-step-functions-cdk/"
- - meta
  - property: "twitter:title"
    content: "Deploy a simple blog on Cloudfront/S3 with AWS Pipelines using CDK/Cloudformation"
- - meta
  - property: "twitter:description"
    content: "Taking advantage of AWS Free Tier, you can host your own blog for free. Using basic AWS services, it can also auto-update whenever you commit markdown to a GitHub repo."
- - meta
  - property: "twitter:image"
    content: "https://www.inmytree.co.za/social/aws-deploy-blog.png"
---
<figure>
<img src="../../resources/cloudwatch-cdk-drake.png" class="block mx-auto" alt="Each Customer gets a step function and alarms">
</figure>


So, you have some existing customers. They run on-premise. Either your premises, or in the case of the telecoms industry, on your customers' premises.

Maybe you have a centralised monitoring system already, maybe you're monitoring from each deployment seperately, using something like Zabbix, nagios or such.

You dream of a day where all your deployments run in AWS. Wouldn't that be nice? Then I could just use CloudWatch right?

I'll show you how at [Digitata](https://vaitom.digitata.com), we are pulling all our important on-premise metrics/KPI's into CloudWatch using a robust, serverless and low-cost approach by leveraging Step Functions, CDK, your VPC and Lambda.

## What we built

<figure>
<img src="../../resources/cloudwatch-cdk-customers-array.png" class="block mx-auto" alt="Each Customer gets a step function and alarms">
</figure>

A fully infrastructure-as-code operational monitoring stack that uses AWS Step Functions and your
VPC to run lambda functions that connect to your on-premise databases, runs queries and
stores them as CloudWatch metrics on any time interval you want.

## How did we build it

By combining the following building blocks:
- [Step Functions](https://aws.amazon.com/step-functions/?step-functions.sort-by=item.additionalFields.postDateTime&step-functions.sort-order=desc) is a serverless state machine that allows you to create workflows. These workflows can be triggered manually or automatically - in our case, on a schedule through [Amazon EventBridge](https://aws.amazon.com/eventbridge/)
- [Lambda](https://aws.amazon.com/lambda/) is used to run the queries against the on-prem database (using python in our case.)
- [CloudWatch](https://aws.amazon.com/cloudwatch/) as the monitoring service that stores the metrics received from the on-prem databases, manages the alarms and provides a dashboard.
- [CDK](https://aws.amazon.com/cdk/) allows you to define your infrastrcture as code in your preferred progmming language.

The flow is as follows:
 - Every 5 minutes, a step function state machine is started for each customer.
 - The Step Function state machines check if it is already running. If it is already running, it fails immediately.
 - Otherwise, the Step Function executes all queries for the specific customer in parallel.
 - After each query is completed, the resulting metric is stored in CloudWatch as a metric.

And that's basically it. That covers the main flow. From the stack, you also get the following:

 - Data Loading alarms - if a customer DB is down for example, you get one alarm instead of all alarms firing at the same time.
 - An overview Dashboard showing all customers, alarms and metrics.
 - The ability to configure *quiet times* - during which an alarm will be disabled.


Each entry in the customers array creates a Step Function state machine that runs query for that customer, given details such as IP, port etc. An example of a customer state machine looks like this:

Take advantage of normal CI/CD practices, to also *manage your operational alarms and
metrics*. This means you use IaC to describe your *entire alarming stack*.

To add a new alarm, you change the CDK stack and commit. A pipeline then runs and updates
the CloudFormation Stack. To change the threshold of an alarm, you follow the same
process. You do *not* change anything on the AWS console. No alarms are added or modified
there.

## Why Step Functions?

The two main reasons we settled on using Step Functions are:

  - For observability purposes. If there is a problem during data fetching, it is possible to alarm on this failure as well. Additionally, you can go back end review past executions to why they failed.
  - To block concurrent executions to the same customer. If for whatever reason, the database is taking a long time to execute any of your queries, we immediately fail the following execution so as to not start any more queries.

<figure>
<img src="../../resources/cloudwatch-cdk-step-function-example.png" class="block mx-auto" alt="Each Customer gets a step function and alarms">
</figure>

The combination of these two reasons have proven to be invaluable in terms of false positives and trust in the alarms. When a state machine fails, that also produces a CloudWatch metric which you can alarm on. We then use Composite Alarms to only fire actual alarms when the Data Loading alarm is not active.

This allows us to get one alarm if there are any database / VPN issues, instead of 10's of alarms all firing at the same time.

## Prerequisities

- VPC setup in your AWS account(s) that can connect to your on-premise databases.
- A set of queries that pulls your important metrics. These queries will be run
  in parallel on a schedule through Step Functions.
- (optional, but recommended) a seperate AWS account to house your monitoring
  infrastructure if you are using Organizations.

## CDK

The following CDK modules are utilised to create the stack:

- [aws-cloudwatch](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudwatch-readme.html)
- [aws-cloudwatch-actions](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudwatch-actions-readme.html)
- [aws-stepfunctions](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-readme.html)
- [aws-stepfunctions-tasks](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-tasks-readme.html)
- [aws-dynamodb](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-dynamodb-readme.html)
- [aws-events](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-events-readme.html)
- [aws-events-targets](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-events-targets-readme.html)

## Advantages of this approach

- Serverless - there is no infrastrcture for you to manage.
- Leverages CloudWatch. If you are using AWS chances are good you are familiar with CloudWatch already.
- Easy to add/modify alarms to all of your customers at once. Because it is leveraging IaC, this makes it easy to add/modify alarms to all of your customers at once.

## Example Stack

You can check out an example stack on [my github](https://github.com/cdk-cloudwatch-monitoring). The example stack requires a single dev RDS to be deployed to an account. From there, you can follow the steps in the repo to deploy a starter stack to get started with this approach.

You will get a stack that consists of:

 - Two "customers" - pulling sample data from your RDS.
 - Two metrics - one per customer
 - Two alarms - one per metric
 - 3 Dashboards: Overview + one for each customer


