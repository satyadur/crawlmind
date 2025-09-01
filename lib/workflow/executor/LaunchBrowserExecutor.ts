/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
import { LaunchBrowserTask } from "../task/LaunchBroser";

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");

    // Use chrome-aws-lambda for serverless environments
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
    });

    environment.log.info("Browser started successfully");
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