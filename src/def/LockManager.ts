import { locks as baseLocks } from "web-locks";
// library doesnt have typing because it implements the "real" weblocks API, so this does the job
// screams in bachelors thesis
export const locks = baseLocks as LockManager;
