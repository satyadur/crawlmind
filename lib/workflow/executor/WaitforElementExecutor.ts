/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import { WaitForElementTask } from "../task/WaitForElement";

export async function WaitforElementExecutor(
  environment: ExecutionEnvironment<typeof WaitForElementTask>
): Promise<boolean> {
  try {
    const selector = await environment.getInput("Selector");
    if (!selector) {
      environment.log.error("input=>selector not defined");
    }
    const visibility = await environment.getInput("Visibility");
    if (!visibility) {
      environment.log.error("input=>visibility not defined");
    }
    await environment.getPage()!.waitForSelector(selector, {
      visible: visibility === "visible",
      hidden: visibility === "hidden",
    });
    environment.log.info(`Element ${selector} became: ${visibility}`);
    return true;
  } catch (err: any) {
    environment.log.error(err.message);
    return false;
  }
}
