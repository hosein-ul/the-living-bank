import https from "https";
import http from "http";

const URL = "https://bank-jet-tau.vercel.app";

interface VerifyResult {
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: string;
  durationMs: number;
}

function fetchUrl(targetUrl: string): Promise<VerifyResult> {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const req = https.get(targetUrl, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: data,
          durationMs: Date.now() - t0,
        });
      });
    });
    req.on("error", (err) => reject(err));
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timed out after 10000ms"));
    });
  });
}

async function main() {
  console.log("================================================================================");
  console.log("VERIFYING LIVE VERCEL DEPLOYMENT:", URL);
  console.log("================================================================================");

  try {
    const res = await fetchUrl(URL);
    console.log(`HTTP Status Code: ${res.statusCode}`);
    console.log(`Latency / TTFB:   ${res.durationMs}ms`);
    console.log(`Content-Type:     ${res.headers["content-type"]}`);
    console.log(`Server:           ${res.headers["server"]}`);
    console.log(`Body Length:      ${res.body.length} bytes`);

    // 1. Status code check
    if (res.statusCode !== 200) {
      throw new Error(`Expected HTTP 200, got ${res.statusCode}`);
    }

    // 2. Content-Type check
    const contentType = res.headers["content-type"] || "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Expected text/html content-type, got ${contentType}`);
    }

    // 3. HTML Document Checks
    const titleMatch = res.body.match(/<title>([^<]*)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : "";

    const checks = [
      { name: "DOCTYPE declaration", test: (b: string) => /<!DOCTYPE\s+html>/i.test(b) },
      { name: "HTML root tag", test: (b: string) => /<html[^>]*>/i.test(b) },
      { name: "Head section", test: (b: string) => /<head[^>]*>/i.test(b) },
      { name: "Body section", test: (b: string) => /<body[^>]*>/i.test(b) },
      { name: "Title is 'The Living Bank — Standard Reserve'", test: () => pageTitle.includes("The Living Bank — Standard Reserve") },
      { name: "Protocol ticker $STANDARD present", test: (b: string) => b.includes("$STANDARD") },
      { name: "Contains cover and chapter sections", test: (b: string) => b.includes("cover") && b.includes("chapter-1") && b.includes("chapter-10") },
      { name: "Next.js script/asset hydration bundle present", test: (b: string) => b.includes("/_next/static/") },
      { name: "Title is not 404 or 500", test: () => !pageTitle.includes("404") && !pageTitle.includes("500") },
    ];

    let passedChecks = 0;
    for (const check of checks) {
      if (check.test(res.body)) {
        console.log(`✓ PASS: ${check.name}`);
        passedChecks++;
      } else {
        console.error(`✗ FAIL: ${check.name}`);
      }
    }

    console.log("\n================================================================================");
    if (passedChecks === checks.length) {
      console.log(`DEPLOYMENT VERIFICATION PASSED: ${passedChecks}/${checks.length} checks succeeded.`);
      process.exit(0);
    } else {
      console.error(`DEPLOYMENT VERIFICATION FAILED: Only ${passedChecks}/${checks.length} checks passed.`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Verification failed with exception:", err.message);
    process.exit(1);
  }
}

main();
