import "reflect-metadata";
import { container } from "tsyringe";
import { registerRepositories } from "./repositories";
import { registerServices } from "./services";
import { registerControllers } from "./controllers";
import { registerModels } from "./models";


registerRepositories();
registerServices();
registerControllers();
registerModels();

export { container };
