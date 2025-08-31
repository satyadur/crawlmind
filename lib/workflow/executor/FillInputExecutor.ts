/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import { FillInputTask } from "../task/FillInput";

export async function FillInputExecutor(
  environment: ExecutionEnvironment<typeof FillInputTask>
): Promise<boolean> {
  try {
    const selector = await environment.getInput("Selector");
    if (!selector) {
      environment.log.error("input=>selector not defined");
    }
    const value = await environment.getInput("Value");
    if (!value) {
      environment.log.error("input=>value not defined");
    }
    await environment.getPage()!.type(selector, value);
    return true;
  } catch (err: any) {
    environment.log.error(err.message);
    return false;
  }
}
