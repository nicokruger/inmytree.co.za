#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';
import { RedirectStack } from '../lib/redirect-stack';

const app = new cdk.App();
new CdkStack(app, 'inmytree-co-za',
    {
      env:{
        region: 'eu-west-1'
      }
    }

);

new RedirectStack(app, 'inmytree-redirect', {
  env:{
    region: 'us-east-1',
    account: process.env.AWS_ACCOUNT_ID
  }
});

