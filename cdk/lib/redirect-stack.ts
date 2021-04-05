import * as cdk from '@aws-cdk/core';
import { DomainRedirect } from "@spencerbeggs/aws-cdk-domain-redirect";

if (!process.env.CERT_ARN) {
  throw new Error('specify cert arn.');
}

export class RedirectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const certArnTarget = process.env.CERT_ARN || 'unknown';
    new DomainRedirect(this, "RedirectRotoToWww", {
      zoneName: "inmytree.co.za",
      cert: certArnTarget,
      target: "https://www.inmytree.co.za",
      hostnames: ['inmytree.co.za']
    });

  }
}
