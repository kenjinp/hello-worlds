import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as synced_folder from "@pulumi/synced-folder";

// Import the program's configuration settings.
const config = new pulumi.Config();
const includeWWW = config.get('includeWWW')
const domainName = config.get("targetDomain")!;
const path = config.get("path")!;
const indexDocument = config.get("indexDocument") || "index.html";
const errorDocument = config.get("errorDocument") || "error.html";


// Create an S3 bucket and configure it as a website.
const bucket = new aws.s3.Bucket("bucket", {
    acl: "public-read",
    website: {
        indexDocument: indexDocument,
        errorDocument: errorDocument,
    },
});

// Use a synced folder to manage the files of the website.
const bucketFolder = new synced_folder.S3BucketFolder("bucket-folder", {
    path: path,
    bucketName: bucket.bucket,
    acl: "public-read",
});


let certificateArn: pulumi.Input<string>;


// BEGIN provision ACM certificate
// this will be used to verify we own the domain and can secure it with SSL
const tenMinutes = 60 * 10;

const eastRegion = new aws.Provider("east", {
    profile: aws.config.profile,
    region: "us-east-1", // Per AWS, ACM certificate must be in the us-east-1 region.
});

// if includeWWW include required subjectAlternativeNames to support the www subdomain
const certificateConfig: aws.acm.CertificateArgs = {
    domainName,
    validationMethod: "DNS",
    subjectAlternativeNames: includeWWW ? [`www.${domainName}`] : [],
};

const certificate = new aws.acm.Certificate("certificate", certificateConfig, { provider: eastRegion });

const domainParts = {
    subdomain: '',
    parentDomain:  domainName
}
const hostedZoneId = aws.route53.getZone({ name: domainParts.parentDomain }, { async: true }).then(zone => zone.zoneId);

/**
 *  Create a DNS record to prove that we _own_ the domain we're requesting a certificate for.
 *  See https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html for more info.
 */
const certificateValidationDomain = new aws.route53.Record(`${domainName}-validation`, {
    name: certificate.domainValidationOptions[0].resourceRecordName,
    zoneId: hostedZoneId,
    type: certificate.domainValidationOptions[0].resourceRecordType,
    records: [certificate.domainValidationOptions[0].resourceRecordValue],
    ttl: tenMinutes,
});

// if includeWWW ensure we validate the www subdomain as well
let subdomainCertificateValidationDomain;
if (includeWWW) {
    subdomainCertificateValidationDomain = new aws.route53.Record(`${domainName}-validation2`, {
        name: certificate.domainValidationOptions[1].resourceRecordName,
        zoneId: hostedZoneId,
        type: certificate.domainValidationOptions[1].resourceRecordType,
        records: [certificate.domainValidationOptions[1].resourceRecordValue],
        ttl: tenMinutes,
    });
}

// if includeWWW include the validation record for the www subdomain
const validationRecordFqdns = subdomainCertificateValidationDomain === undefined ?
    [certificateValidationDomain.fqdn] : [certificateValidationDomain.fqdn, subdomainCertificateValidationDomain.fqdn];

/**
 * This is a _special_ resource that waits for ACM to complete validation via the DNS record
 * checking for a status of "ISSUED" on the certificate itself. No actual resources are
 * created (or updated or deleted).
 *
 * See https://www.terraform.io/docs/providers/aws/r/acm_certificate_validation.html for slightly more detail
 * and https://github.com/terraform-providers/terraform-provider-aws/blob/master/aws/resource_aws_acm_certificate_validation.go
 * for the actual implementation.
 */
const certificateValidation = new aws.acm.CertificateValidation("certificateValidation", {
    certificateArn: certificate.arn,
    validationRecordFqdns: validationRecordFqdns,
}, { provider: eastRegion });

certificateArn = certificateValidation.certificateArn;


// Create a CloudFront CDN to distribute and cache the website.
const cdn = new aws.cloudfront.Distribution("cdn", {
    enabled: true,
    aliases: [domainName],
    origins: [{
        originId: bucket.arn,
        domainName: bucket.websiteEndpoint,
        customOriginConfig: {
            originProtocolPolicy: "http-only",
            httpPort: 80,
            httpsPort: 443,
            originSslProtocols: ["TLSv1.2"],
        },
    }],
    defaultCacheBehavior: {
        targetOriginId: bucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
        ],
        cachedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
        ],
        defaultTtl: 600,
        maxTtl: 600,
        minTtl: 600,
        forwardedValues: {
            queryString: true,
            cookies: {
                forward: "all",
            },
        },
    },
    priceClass: "PriceClass_100",
    customErrorResponses: [{
        errorCode: 404,
        responseCode: 404,
        responsePagePath: `/${errorDocument}`,
    }],
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        sslSupportMethod: "sni-only",
        acmCertificateArn: certificateArn,
        cloudfrontDefaultCertificate: true,
    },
});


// Finally create an A record for our domain that directs to our custom domain.
const webDnsRecord = new aws.route53.Record(
    "webDnsRecord",
    {
      name: domainName,
      type: "A",
      zoneId: hostedZoneId,
      aliases: [
        {
          evaluateTargetHealth: true,
          name: cdn.domainName,
          zoneId: cdn.hostedZoneId,
        },
      ],
    }
  );

// Export the URLs and hostnames of the bucket and distribution.
export const originURL = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
export const originHostname = bucket.websiteEndpoint;
export const cdnURL = pulumi.interpolate`https://${cdn.domainName}`;
export const cdnHostname = cdn.domainName;
export const website = `https://${domainName}`;