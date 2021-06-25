---
title: "Monitor your existing on-prem customers in AWS"
description: 'you can do this i promise'
head:
- - meta
  - name: description
    content: "evs"
---

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
stores them as CloudWatch metrics on any time interval you want. We use 5-minute and 30-minute intervals.

Each entry in the customers array creates a Step Function state machine that runs query for that customer, given details such as IP, port etc. An example of a customer state machine looks like this:

<figure>
<img src="../../resources/cloudwatch-cdk-step-function-example.png" class="block mx-auto" alt="Each Customer gets a step function and alarms">
</figure>

Take advantage of normal CI/CD practices, to also *manage your operational alarms and
metrics*. This means you use IaC to describe your *entire alarming stack*.

(drake no to changes on console, yes to changes in CDK meme)

To add a new alarm, you change the CDK stack and commit. A pipeline then runs and updates
the CloudFormation Stack. To change the threshold of an alarm, you follow the same
process. You do *not* change anything on the AWS console. No alarms are added or modified
there.

## Prerequisities

- VPC setup in your AWS account(s) that can connect to your on-premise databases.
- A consistent set of queries that pulls your important metrics. These queries will be run
  in parallel on a schedule through Step Functions.
- (optional, but recommended) a seperate AWS account to house your monitoring
  infrastructure if you are using Organizations.

## How do it work

(image of new architecture here)

```
code
```

## Advantages of this approach

- Serverless. There is nothing for you to manage.
- Leverages CloudWatch. If you are using AWS chances are good you are familiar
  with CloudWatch already.
- Incredibly easy to add/modify alarms to all of your customers at once. You just change
  the IaC and redeploy.

## Future

You have 


### Lal



Hello
