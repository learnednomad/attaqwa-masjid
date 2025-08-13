# Database Performance Optimization Guide

## Overview
This document outlines the performance optimizations implemented in the Islamic education database schema, designed to handle millions of educational interactions efficiently.

## Index Strategy

### Primary Indexes

#### 1. Education Content Indexes
```sql
-- Composite index for filtering (most common query pattern)
CREATE INDEX education_content_filter_idx 
ON education_content(contentType, subject, ageTier, difficultyLevel)
WHERE isPublished = true;

-- Covering index for listing queries
CREATE INDEX education_content_listing_idx 
ON education_content(isPublished, contentType) 
INCLUDE (title, description, estimatedDuration, viewCount);

-- Text search optimization (PostgreSQL specific)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX education_content_search_idx 
ON education_content USING gin(
  (title || ' ' || description) gin_trgm_ops
);
```

#### 2. User Progress Indexes
```sql
-- Hot path: User dashboard queries
CREATE INDEX user_progress_dashboard_idx 
ON user_progress(userId, status) 
INCLUDE (progress, lastAccessed)
WHERE status != 'COMPLETED';

-- Analytics queries
CREATE INDEX user_progress_analytics_idx 
ON user_progress(contentId, completedAt) 
WHERE completedAt IS NOT NULL;
```

#### 3. Quiz Performance Indexes
```sql
-- Quiz attempt retrieval
CREATE INDEX quiz_attempts_user_recent_idx 
ON quiz_attempts(userId, completedAt DESC NULLS LAST)
INCLUDE (score, isPassed);

-- Leaderboard queries
CREATE INDEX quiz_attempts_leaderboard_idx 
ON quiz_attempts(quizId, score DESC)
WHERE isPassed = true;
```

### Partial Indexes for Common Filters

```sql
-- Active content only (reduces index size by ~30%)
CREATE INDEX education_content_active_idx 
ON education_content(subject, ageTier) 
WHERE isPublished = true;

-- In-progress learning
CREATE INDEX user_progress_active_learning_idx 
ON user_progress(userId, lastAccessed DESC) 
WHERE status = 'IN_PROGRESS';

-- Recent quiz attempts (last 30 days)
CREATE INDEX quiz_attempts_recent_idx 
ON quiz_attempts(userId, quizId) 
WHERE completedAt > CURRENT_DATE - INTERVAL '30 days';
```

## Query Optimization Patterns

### 1. Content Discovery Query
```sql
-- Optimized query for content discovery
WITH ranked_content AS (
  SELECT 
    ec.*,
    COUNT(DISTINCT up.userId) as learner_count,
    AVG(up.score) as avg_score,
    ROW_NUMBER() OVER (
      PARTITION BY ec.subject 
      ORDER BY ec.viewCount DESC, ec.rating DESC
    ) as rank
  FROM education_content ec
  LEFT JOIN user_progress up ON ec.id = up.contentId
  WHERE 
    ec.isPublished = true
    AND ec.ageTier = $1
    AND ec.subject = ANY($2)
  GROUP BY ec.id
)
SELECT * FROM ranked_content 
WHERE rank <= 10
ORDER BY subject, rank;
```

### 2. User Progress Dashboard
```sql
-- Materialized view for user dashboard
CREATE MATERIALIZED VIEW user_education_stats AS
SELECT 
  u.id as userId,
  COUNT(DISTINCT up.contentId) FILTER (WHERE up.status = 'COMPLETED') as completed_content,
  COUNT(DISTINCT up.contentId) FILTER (WHERE up.status = 'IN_PROGRESS') as in_progress_content,
  SUM(up.timeSpent) as total_time_spent,
  AVG(up.score) FILTER (WHERE up.score IS NOT NULL) as avg_score,
  COUNT(DISTINCT DATE(up.lastAccessed)) as active_days,
  MAX(up.lastAccessed) as last_activity,
  jsonb_object_agg(
    ec.subject, 
    jsonb_build_object(
      'completed', COUNT(*) FILTER (WHERE up.status = 'COMPLETED'),
      'total', COUNT(*)
    )
  ) as progress_by_subject
FROM users u
LEFT JOIN user_progress up ON u.id = up.userId
LEFT JOIN education_content ec ON up.contentId = ec.id
GROUP BY u.id;

-- Refresh strategy
CREATE INDEX ON user_education_stats(userId);
REFRESH MATERIALIZED VIEW CONCURRENTLY user_education_stats;
```

### 3. Quiz Analytics
```sql
-- Optimized quiz performance query
WITH quiz_stats AS (
  SELECT 
    q.id,
    q.title,
    COUNT(DISTINCT qa.userId) as attempt_count,
    AVG(qa.score) as avg_score,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY qa.score) as median_score,
    COUNT(*) FILTER (WHERE qa.isPassed) * 100.0 / COUNT(*) as pass_rate,
    AVG(qa.timeSpent) as avg_time_spent
  FROM quizzes q
  LEFT JOIN quiz_attempts qa ON q.id = qa.quizId
  WHERE qa.completedAt > CURRENT_DATE - INTERVAL '30 days'
  GROUP BY q.id
)
SELECT * FROM quiz_stats
ORDER BY attempt_count DESC, avg_score DESC
LIMIT 20;
```

## Partitioning Strategy

### Time-Based Partitioning for Historical Data

```sql
-- Partition quiz_attempts by month for better performance
CREATE TABLE quiz_attempts_partitioned (
  LIKE quiz_attempts INCLUDING ALL
) PARTITION BY RANGE (completedAt);

-- Create monthly partitions
CREATE TABLE quiz_attempts_2024_01 
PARTITION OF quiz_attempts_partitioned 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Automatic partition creation
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  partition_date date;
  partition_name text;
BEGIN
  partition_date := date_trunc('month', CURRENT_DATE);
  partition_name := 'quiz_attempts_' || to_char(partition_date, 'YYYY_MM');
  
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I 
    PARTITION OF quiz_attempts_partitioned 
    FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    partition_date,
    partition_date + interval '1 month'
  );
END;
$$ LANGUAGE plpgsql;
```

## Caching Strategy

### Redis Cache Keys

```typescript
// Content caching (TTL: 1 hour)
`education:content:${contentId}` 
`education:content:list:${ageTier}:${subject}:${page}`

// User progress caching (TTL: 5 minutes)
`user:${userId}:progress:summary`
`user:${userId}:achievements`

// Quiz caching (TTL: 30 minutes)
`quiz:${quizId}:questions`
`quiz:${quizId}:leaderboard`

// Analytics caching (TTL: 1 hour)
`analytics:popular:${ageTier}`
`analytics:trending:${timeframe}`
```

### Query Result Caching

```typescript
// Prisma with Redis caching
async function getCachedEducationContent(filters: any) {
  const cacheKey = `content:${JSON.stringify(filters)}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query with optimized includes
  const result = await prisma.educationContent.findMany({
    where: filters,
    select: {
      id: true,
      title: true,
      description: true,
      contentType: true,
      subject: true,
      ageTier: true,
      difficultyLevel: true,
      estimatedDuration: true,
      viewCount: true,
      rating: true,
      _count: {
        select: {
          userProgress: true,
          quizzes: true
        }
      }
    },
    orderBy: [
      { viewCount: 'desc' },
      { rating: 'desc' }
    ],
    take: 20
  });
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(result));
  return result;
}
```

## Database Connection Pooling

### Optimal Pool Configuration

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  connection_limit: 25,  // Max connections
  connect_timeout: 10,   // Connection timeout (seconds)
  pool_timeout: 10,      // Pool timeout (seconds)
  socket_timeout: 10,    // Socket timeout (seconds)
  
  // Query optimization
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Middleware for query timing
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  if (after - before > 1000) {
    console.warn(`Slow query (${after - before}ms):`, params);
  }
  
  return result;
});
```

## Performance Monitoring

### Key Metrics to Track

1. **Query Performance**
   - Average query time by operation
   - Slow query log (>1s)
   - N+1 query detection

2. **Index Effectiveness**
   - Index hit ratio
   - Index scan vs sequential scan ratio
   - Unused indexes

3. **Connection Pool Health**
   - Active connections
   - Idle connections
   - Connection wait time

### Monitoring Queries

```sql
-- Find slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100  -- queries averaging >100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Table size and bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup,
  n_dead_tup,
  n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0) AS dead_percentage
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Optimization Checklist

### Before Production
- [ ] Run EXPLAIN ANALYZE on all critical queries
- [ ] Verify all foreign keys have indexes
- [ ] Check for N+1 queries in application code
- [ ] Implement query result caching
- [ ] Set up connection pooling
- [ ] Configure database backup strategy
- [ ] Implement monitoring and alerting

### Regular Maintenance
- [ ] Weekly: VACUUM ANALYZE on high-traffic tables
- [ ] Monthly: Review slow query log
- [ ] Monthly: Update table statistics
- [ ] Quarterly: Review and optimize indexes
- [ ] Quarterly: Archive old quiz attempts
- [ ] Annually: Review partitioning strategy

## Expected Performance Metrics

With these optimizations, the system should achieve:

- **Content Listing**: <50ms for 20 items
- **User Dashboard**: <100ms for full stats
- **Quiz Loading**: <75ms with questions
- **Progress Update**: <25ms per operation
- **Search Queries**: <100ms for text search
- **Analytics Queries**: <200ms for complex aggregations

## Scaling Considerations

### At 1M+ Users
1. Implement read replicas for analytics queries
2. Use pgBouncer for connection pooling
3. Consider sharding by userId
4. Move analytics to a data warehouse

### At 10M+ Educational Interactions
1. Partition quiz_attempts and user_progress tables
2. Implement CDC for real-time analytics
3. Use Elasticsearch for full-text search
4. Consider microservices for quiz engine