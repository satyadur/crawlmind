/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionEnvironment } from "@/types/executor";
import { AddPropertyToJsonTask } from "../task/AddPropertyToJson";

export async function AddPropertyToExecutor(
  environment: ExecutionEnvironment<typeof AddPropertyToJsonTask>
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
    const propertyValue = await environment.getInput("Property value");
    if (!propertyName) {
      environment.log.error("input=>propertyValue not defined");
    }
    const json = JSON.parse(jsonData);
    json[propertyName] = propertyValue;

    await environment.setOutput("Update JSON value", JSON.stringify(json));
    return true;
  } catch (err: any) {
    environment.log.error(err.message);
    return false;
  }
}
