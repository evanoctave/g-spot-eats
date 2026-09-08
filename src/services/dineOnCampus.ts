export const DINE_ON_CAMPUS_SOURCE_URL = "https://dineoncampus.com/csuf/whats-on-the-menu";

export class DataSourceApprovalRequiredError extends Error {
  constructor() {
    super("Live Dine On Campus ingestion is disabled until written data-use approval is configured.");
    this.name = "DataSourceApprovalRequiredError";
  }
}

export function assertLiveSourceApproved(environment = process.env) {
  if (environment.DATA_SOURCE_APPROVED !== "true") {
    throw new DataSourceApprovalRequiredError();
  }
}
