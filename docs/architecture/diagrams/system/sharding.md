# Database Sharding Architecture

This diagram illustrates our database sharding strategy, including the shard router, individual shards, and metadata management.

```mermaid
graph TB
    subgraph "Application"
        App[Application]
        Router[Shard Router]
    end

    subgraph "Shards"
        S1[(Shard 1)]
        S2[(Shard 2)]
        S3[(Shard 3)]
    end

    subgraph "Metadata"
        MS[(Metadata Store)]
        Config[Shard Config]
    end

    App --> Router
    Router --> MS
    MS --> Config

    Router --> S1
    Router --> S2
    Router --> S3
```

## Components

### Shard Router

- Routes queries to appropriate shards
- Handles shard key calculation
- Manages cross-shard queries

### Shards

- Independent database instances
- Horizontally partitioned data
- Consistent schema across shards

### Metadata Store

- Stores shard mapping information
- Manages shard configuration
- Handles shard rebalancing

## Sharding Strategy

### Shard Key Selection

- Based on business requirements
- Ensures even data distribution
- Minimizes cross-shard queries

### Data Distribution

- Hash-based sharding
- Range-based sharding
- Directory-based sharding

### Rebalancing

- Automatic shard rebalancing
- Data migration between shards
- Zero-downtime rebalancing
