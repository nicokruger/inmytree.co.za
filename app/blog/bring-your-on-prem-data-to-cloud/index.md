---
title: "Monitor your existing on-prem customers in AWS"
description: 'you can do this i promise'
head:
- - meta
  - name: description
    content: "evs"
---
<figure>
<img src="../../resources/cloudwatch-cdk-drake.png" class="block mx-auto" alt="Each Customer gets a step function and alarms">
</figure>


So, you have some existing customers. They run on-premise. Either your premises, or in the
case of the telecoms industry, on your customers' premises.

Maybe you have a centralised monitoring system already, maybe you're monitoring from each deployment 
seperately, using something like Zabbix, nagios or such.

You dream of a day where all your deployments run in AWS. Wouldn't that be nice? Then I could just use
CloudWatch right? 

Stop dreaming, you can pull all your important on-premise metrics/KPI's into CloudWatch
using a robust, serverless and low-cost approach by leveraging Step Functions, CDK, your
VPC and Lambda.

## What we built

<figure>
<img src="../../resources/cloudwatch-cdk-customers-array.png" class="block mx-auto" alt="Each Customer gets a step function and alarms">
</figure>

A fully infrastructure-as-code operational monitoring stack that uses AWS Step Functions and your
VPC to run lambda functions that connect to your on-premise databases, runs queries and
stores them as CloudWatch metrics on any time interval you want.

Each entry in the customers array creates a Step Function state machine that runs query for that customer, given details such as IP, port etc. An example of a customer state machine looks like this:

<figure>
<img src="../../resources/cloudwatch-cdk-step-function-example.png" class="block mx-auto" alt="Each Customer gets a step function and alarms">
</figure>

Take advantage of normal CI/CD practices, to also *manage your operational alarms and
metrics*. This means you use IaC to describe your *entire alarming stack*.

To add a new alarm, you change the CDK stack and commit. A pipeline then runs and updates
the CloudFormation Stack. To change the threshold of an alarm, you follow the same
process. You do *not* change anything on the AWS console. No alarms are added or modified
there.

## Prerequisities

- VPC setup in your AWS account(s) that can connect to your on-premise databases.
- A set of queries that pulls your important metrics. These queries will be run
  in parallel on a schedule through Step Functions.
- (optional, but recommended) a seperate AWS account to house your monitoring
  infrastructure if you are using Organizations.

## How does it work

By combining the following building blocks:
- [Step Functions](https://aws.amazon.com/step-functions/?step-functions.sort-by=item.additionalFields.postDateTime&step-functions.sort-order=desc) is a serverless state machine that allows you to create workflows. These workflows can be triggered manually or automatically - in our case, on a schedule through [Amazon EventBridge](https://aws.amazon.com/eventbridge/)
- [Lambda](https://aws.amazon.com/lambda/) is used to run the queries against the on-prem database (using python in our case.)
- [CloudWatch](https://aws.amazon.com/cloudwatch/) as the monitoring service that stores the metrics received from the on-prem databases, manages the alarms and provides a dashboard.
- [CDK](https://aws.amazon.com/cdk/) allows you to define your infrastrcture as code in your preferred progmming language.

## CDK

The following CDK modules are utilised to create the stack:

- [aws-cloudwatch](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudwatch-readme.html)
- [aws-cloudwatch-actions](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-cloudwatch-actions-readme.html)
- [aws-stepfunctions](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-readme.html)
- [aws-stepfunctions-tasks](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-tasks-readme.html)
- [aws-dynamodb](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-dynamodb-readme.html)
- [aws-events](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-events-readme.html)
- [aws-events-targets](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-events-targets-readme.html)

### Customers
```ts
enum Version {
  v1 = "1",
  v2 = "2"
}

type Customer = {
  opname: string;
  ip: string;
  port: string;
  database: string;
  version: Version;
  threshold: number;
}

const customers: Customer[] = [
  {
    opname: "Customer 1",
    ip: "192.168.0.1",
    port: "5432",
    database: "postgres",
    version: Version.v2,
    threshold: 100
  },
  {
    opname: "Customer 2",
    ip: "192.168.0.2",
    port: "5432",
    database: "postgres",
    version: Version.v1,
    threshold: 100
  }
]

export {
  Version,
  Customer,
  customers
}

```

```ts
import { Version } from './customers';

interface MetricsQuery {
  name: string;
  description: string;
  versions: Version[];
  query: string;
  cloudwatchDimension: string;
  tags: string[];
}

export const queries: MetricsQuery[] = [
  {
    name: 'demo-query',
    description: 'A query for demo purposes',
    tags: ['demo'],
    versions: [Version.v1],
    query: `
    select row_to_json(row) from (
       select random() as test_metric
    ) row
    `,
    cloudwatchDimension: 'demo',
  },
  {
    name: 'demo-query',
    description: 'A query for demo purposes',
    tags: ['demo'],
    versions: [Version.v2],
    query: `
    select row_to_json(row) from (
       select 5 + random() as test_metric
    ) row
    `,
    cloudwatchDimension: 'demo',
  },

]

```

## Advantages of this approach

- Serverless - there is no infrastrcture for you to manage.
- Leverages CloudWatch. If you are using AWS chances are good you are familiar with CloudWatch already.
- Easy to add/modify alarms to all of your customers at once. Because it is leveraging IaC, this makes it easy to add/modify alarms to all of your customers at once.

## Future

You have 


### Lal



Hello
