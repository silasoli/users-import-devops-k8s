import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export const options = {
  vus: Number(__ENV.VUS || 30),
  duration: __ENV.DURATION || '90s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const listRes = http.get(`${baseUrl}/users?page=1&limit=20`);
  check(listRes, {
    'GET /users status 200': (r) => r.status === 200,
  });

  const liveRes = http.get(`${baseUrl}/health/live`);
  check(liveRes, {
    'GET /health/live status 200': (r) => r.status === 200,
  });

  sleep(0.2);
}

