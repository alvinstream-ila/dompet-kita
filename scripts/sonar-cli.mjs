#!/usr/bin/env node

/**
 * SonarCloud CLI Helper (Low-Gravity Edition)
 * Accesses SonarCloud data via Web API without requiring Java/JRE.
 */

const PROJECT_KEY = 'alvinstream-ila_dompet-kita';
const ORG = 'alvinstream-ila';
const SONAR_TOKEN = process.env.SONAR_TOKEN;

if (!SONAR_TOKEN) {
  console.error('\x1b[31mError: SONAR_TOKEN is not set.\x1b[0m');
  console.log('Please set it in your environment: $env:SONAR_TOKEN="your_token"');
  process.exit(1);
}

async function fetchSonarData() {
  console.log(`\x1b[34m🔍 Fetching SonarCloud status for ${PROJECT_KEY}...\x1b[0m`);
  
  const auth = Buffer.from(`${SONAR_TOKEN}:`).toString('base64');
  const headers = { 'Authorization': `Basic ${auth}` };

  try {
    // 1. Get Quality Gate Status
    const qgResponse = await fetch(
      `https://sonarcloud.io/api/qualitygates/project_status?projectKey=${PROJECT_KEY}`,
      { headers }
    );
    const qgData = await qgResponse.json();

    // 2. Get Main Metrics
    const metrics = 'bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_rating,sqale_rating,reliability_rating';
    const mResponse = await fetch(
      `https://sonarcloud.io/api/measures/component?component=${PROJECT_KEY}&metricKeys=${metrics}`,
      { headers }
    );
    const mData = await mResponse.json();

    displayResults(qgData.projectStatus, mData.component.measures);
  } catch (error) {
    console.error('\x1b[31mFailed to fetch data from SonarCloud:\x1b[0m', error.message);
  }
}

function displayResults(status, measures) {
  const statusColor = status.status === 'OK' ? '\x1b[32m' : '\x1b[31m';
  console.log('\n' + '='.repeat(50));
  console.log(`STATUS: ${statusColor}${status.status}\x1b[0m`);
  console.log('='.repeat(50));

  const measureMap = {};
  measures.forEach(m => measureMap[m.metric] = m.value);

  const getRating = (val) => {
    const ratings = { '1.0': 'A', '2.0': 'B', '3.0': 'C', '4.0': 'D', '5.0': 'E' };
    return ratings[val] || val;
  };

  console.log(`- Reliability:   ${getRating(measureMap.reliability_rating)} (${measureMap.bugs} bugs)`);
  console.log(`- Security:      ${getRating(measureMap.security_rating)} (${measureMap.vulnerabilities} vulns)`);
  console.log(`- Maintainability: ${getRating(measureMap.sqale_rating)} (${measureMap.code_smells} smells)`);
  console.log(`- Coverage:      ${measureMap.coverage}%`);
  console.log(`- Duplications:  ${measureMap.duplicated_lines_density}%`);
  console.log('='.repeat(50) + '\n');
}

fetchSonarData();
