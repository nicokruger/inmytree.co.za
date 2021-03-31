#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';


/*
if (!process.env.AWS_ACCOUNT_ID) {
  throw new Error('specify AWS_ACCOUNT_ID');
}
*/

const app = new cdk.App();
new CdkStack(app, 'inmytree-co-za', 
    {
      env:{
        region: 'eu-west-1',
        //account: process.env.AWS_ACCOUNT_ID
      }
    }

);

