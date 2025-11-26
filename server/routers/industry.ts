import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { industries } from "../../drizzle/schema";

/**
 * Industry Router
 * Handles industry-related queries
 */
export const industryRouter = router({
  /**
   * Get list of all industries
   */
  list: publicProcedure.query(async () => {
    const database = await getDb();
    
    const industryList = await database
      .select({
        id: industries.id,
        name: industries.name,
        description: industries.description,
      })
      .from(industries)
      .orderBy(industries.name);
    
    return industryList;
  }),
});
