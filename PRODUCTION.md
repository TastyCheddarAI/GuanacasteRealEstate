# Production Deployment Notes

## Environment Variables
Set all env vars in Supabase Dashboard > Project Settings > Functions:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- XAI_API_KEY
- OPENAI_API_KEY
- ALLOWED_ADMIN_EMAILS
- REGION_DEFAULT
- LOG_LEVEL

## Security Notes
- Never echo provider errors/IDs to users (already masked)
- Keep temperature low (0.2–0.4) for factuality
- Prefer verified=true docs; keep sensitivity='public' for user-facing KB
- Add more town profiles as you scale

## Scaling Considerations
- For property/listing intelligence, embed descriptions into embeddings_property and enable retrieval path
- Consider Redis caching for hot queries
- Monitor audit logs for usage patterns

## Maintenance
- Run evals before each deploy
- Update KB regularly with new information
- Monitor rate limits and adjust as needed