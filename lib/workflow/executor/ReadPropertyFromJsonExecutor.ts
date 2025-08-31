/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import { ReadPropertyFromJsonTask } from "../task/ReadPropertyFromJson";

export async function ReadPropertyFromJsonExecutor(
  environment: ExecutionEnvironment<typeof ReadPropertyFromJsonTask>
): Promise<boolean> {
  try {
    const jsonData = await environment.getInput("JSON");
    if (!jsonData) {
      environment.log.error("input=>jsonData not defined");
    }
    const propertyName = await environment.getInput("Property name");
    if (!propertyName) {
      environment.log.error("input=>propertyName not defined");
    }

    const json = JSON.parse(jsonData);
    const propertyValue = json[propertyName];
    if (propertyValue === undefined) {
      environment.log.error("property not defined");
      return false;
    }

    await environment.setOutput("Property value", propertyValue.selector);
    return true;
  } catch (err: any) {
    environment.log.error(err.message);
    return false;
  }
}
