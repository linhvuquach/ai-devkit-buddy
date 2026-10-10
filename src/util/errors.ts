import { ui } from "./terminal-ui";

export class CliError extends Error {
  constructor(message: string, readonly code: string = "CLI_ERROR") {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends CliError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends CliError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
  }
}

export class ConfigNotFoundError extends CliError {
  constructor(message: string) {
    super(message, "CONFIG_NOT_FOUND");
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function withErrorHandler<A extends unknown[]>(
  handler: (...args: A) => Promise<void>
): (...args: A) => Promise<void> {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (error) {
      ui.error(errorMessage(error));
      process.exitCode = 1;
    }
  };
}
