# State Management Patterns

## Overview

Our application uses a multi-layered state management approach combining:
- Local component state
- Global application state
- Server state management
- CQRS pattern for complex operations

## CQRS Implementation

### Command Handlers

```typescript
// src/commands/user/create-user.command.ts
interface CreateUserCommand {
  type: 'CREATE_USER';
  payload: {
    name: string;
    email: string;
    role: UserRole;
  };
}

// src/commands/user/create-user.handler.ts
class CreateUserHandler implements CommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const user = await this.userRepository.create(command.payload);
    
    await this.eventBus.publish(new UserCreatedEvent(user));
  }
}
```

### Query Handlers

```typescript
// src/queries/user/get-user.query.ts
interface GetUserQuery {
  type: 'GET_USER';
  payload: {
    id: string;
  };
}

// src/queries/user/get-user.handler.ts
class GetUserHandler implements QueryHandler<GetUserQuery, UserDTO> {
  constructor(
    private readonly userReadModel: UserReadModel
  ) {}

  async execute(query: GetUserQuery): Promise<UserDTO> {
    return this.userReadModel.findById(query.payload.id);
  }
}
```

### Event Handlers

```typescript
// src/events/user/user-created.event.ts
class UserCreatedEvent implements Event {
  constructor(public readonly user: User) {}
}

// src/events/user/user-created.handler.ts
class UserCreatedHandler implements EventHandler<UserCreatedEvent> {
  constructor(
    private readonly userReadModel: UserReadModel
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.userReadModel.create(event.user);
  }
}
```

## Client-Side State Management

### React Query for Server State

```typescript
// src/hooks/users/use-user.ts
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.user.get(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// src/hooks/users/use-create-user.ts
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserDTO) => api.user.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Zustand for Global State

```typescript
// src/stores/auth.store.ts
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Usage in components
function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Read Model Synchronization

```typescript
// src/read-models/user.read-model.ts
class UserReadModel {
  constructor(
    private readonly redis: Redis,
    private readonly db: PrismaClient
  ) {}

  async create(user: User): Promise<void> {
    await this.redis.set(
      `user:${user.id}`,
      JSON.stringify(user),
      'EX',
      3600
    );
    
    await this.db.userView.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  async findById(id: string): Promise<UserDTO | null> {
    // Try cache first
    const cached = await this.redis.get(`user:${id}`);
    if (cached) return JSON.parse(cached);
    
    // Fall back to database
    const user = await this.db.userView.findUnique({
      where: { id },
    });
    
    if (user) {
      await this.redis.set(
        `user:${user.id}`,
        JSON.stringify(user),
        'EX',
        3600
      );
    }
    
    return user;
  }
}
```

## Event Sourcing

```typescript
// src/events/event-store.ts
interface EventStore {
  append(streamId: string, events: Event[]): Promise<void>;
  read(streamId: string): Promise<Event[]>;
}

// src/aggregates/user.aggregate.ts
class UserAggregate {
  private events: Event[] = [];
  
  constructor(private readonly eventStore: EventStore) {}
  
  async load(id: string): Promise<void> {
    this.events = await this.eventStore.read(`user-${id}`);
  }
  
  async save(): Promise<void> {
    await this.eventStore.append(`user-${id}`, this.events);
    this.events = [];
  }
  
  createUser(data: CreateUserDTO): void {
    // Validate
    if (!isValidEmail(data.email)) {
      throw new ValidationError('Invalid email');
    }
    
    // Apply event
    this.events.push(new UserCreatedEvent({
      id: generateId(),
      ...data,
    }));
  }
}
```

## Best Practices

1. **Command Validation**
   - Validate commands before processing
   - Use strong typing for command payloads
   - Implement command middleware for cross-cutting concerns

2. **Query Optimization**
   - Use dedicated read models
   - Implement caching strategies
   - Optimize read model schema for queries

3. **Event Handling**
   - Make events immutable
   - Store events in event store
   - Use event sourcing for audit trails

4. **State Management**
   - Keep global state minimal
   - Use server state management for remote data
   - Implement optimistic updates

5. **Performance**
   - Cache read models
   - Use materialized views
   - Implement query denormalization

## Anti-patterns to Avoid

1. **Command-Query Mixing**
   ```typescript
   // Bad
   async function createUser(data: CreateUserDTO): Promise<User> {
     const user = await db.user.create({ data });
     return user;
   }
   
   // Good
   async function createUser(data: CreateUserDTO): Promise<void> {
     await db.user.create({ data });
     // Return void, let queries handle reading
   }
   ```

2. **Direct State Mutation**
   ```typescript
   // Bad
   function updateUser(id: string, data: UpdateUserDTO) {
     store.users[id] = { ...store.users[id], ...data };
   }
   
   // Good
   function updateUser(id: string, data: UpdateUserDTO) {
     commandBus.dispatch(new UpdateUserCommand(id, data));
   }
   ```

3. **Complex Read Models**
   ```typescript
   // Bad
   class UserReadModel {
     async getUser(id: string) {
       const user = await db.user.findUnique({
         where: { id },
         include: { 
           posts: true,
           comments: true,
           followers: true,
           // Too much included
         },
       });
     }
   }
   
   // Good
   class UserReadModel {
     async getUser(id: string) {
       return db.userView.findUnique({
         where: { id },
         // Only necessary fields for this view
       });
     }
   }
   ```
