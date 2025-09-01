/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import puppeteer, { Browser } from "puppeteer";
import chromium from "chrome-aws-lambda";
import { LaunchBrowserTask } from "../task/LaunchBroser";

// ✅ Convert env string ("true"/"false") to boolean
const isVercelEnv = process.env.VERCEL === "true" || !!process.env.VERCEL;
const isAwsEnv = process.env.AWS_REGION === "true" || !!process.env.AWS_REGION;

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");
    let browser: Browser;

    if (isVercelEnv || isAwsEnv) {
      // ✅ Use chrome-aws-lambda for serverless (Vercel / AWS Lambda)
      browser = await puppeteer.launch({
        executablePath: await chromium.executablePath || undefined,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
      });
      environment.log.info("Launched browser with chrome-aws-lambda (serverless mode)");
    } else {
      // ✅ Use normal puppeteer locally
      browser = await puppeteer.launch({
        headless: true,
      });
      environment.log.info("Launched browser with local Puppeteer (dev mode)");
    }

    environment.setBrowser(browser);
    const page = await browser.newPage();
    await page.goto(websiteUrl, { waitUntil: "networkidle2" });
    environment.setPage(page);

    environment.log.info(`Opened page at: ${websiteUrl}`);
    return true;
  } catch (err: any) {
    environment.log.error(`LaunchBrowserExecutor: Failed to launch browser - ${err.message}`);
    return false;
  }
}
