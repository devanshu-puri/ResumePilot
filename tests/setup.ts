// Global test environment configuration
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://mock_user:mock_pass@localhost:5432/mock_test_db";
process.env.LLM_PROVIDER = "fake";
