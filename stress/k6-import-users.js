import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3000';
const filename = __ENV.FILENAME || 'import-users.csv';
const rowsPerJob = Number(__ENV.ROWS_PER_JOB || 10);

const csvRows = new SharedArray('import users csv', () => {
  const raw = open('./data/import-users.csv');
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const dataLines = lines.slice(1);
  return dataLines.map((line) => {
    const [name, document, emailPrefix] = line.split(',').map((part) => part.trim());
    return { name, document, emailPrefix };
  });
});

export const options = {
  scenarios: {
    import_jobs: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.JOBS_PER_SECOND || 2),
      timeUnit: '1s',
      duration: __ENV.DURATION || '90s',
      preAllocatedVUs: Number(__ENV.PREALLOCATED_VUS || 20),
      maxVUs: Number(__ENV.MAX_VUS || 100),
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
};

function buildRows(vu, iter) {
  const result = [];
  const limit = Math.min(rowsPerJob, csvRows.length);

  for (let i = 0; i < limit; i += 1) {
    const base = csvRows[i];
    const suffix = `${vu}_${iter}_${i}`;
    result.push({
      name: base.name,
      document: base.document,
      external_ref: `ref_${suffix}`,
      email: `${base.emailPrefix}+${suffix}@stress.local`,
    });
  }

  return result;
}

export default function () {
  const rows = buildRows(__VU, __ITER);
  const body = JSON.stringify({
    filename,
    rows,
  });

  const res = http.post(`${baseUrl}/imports/users`, body, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'POST /imports/users status 201 or 200': (r) => r.status === 200 || r.status === 201,
  });

  sleep(0.1);
}
