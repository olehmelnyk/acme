# Component State Patterns

This document outlines our component state management patterns and best practices.

## State Management Architecture

```mermaid
graph TD
    subgraph Global State
        Store[Redux Store]
        Context[React Context]
    end

    subgraph Local State
        Component[Component State]
        Form[Form State]
    end

    subgraph Cache Layer
        Query[Query Cache]
        Storage[Local Storage]
    end

    Store --> Component
    Context --> Component
    Component --> Form
    Store --> Query
    Query --> Storage
```

## State Categories

### 1. Application State

- Global configuration
- User preferences
- Authentication state
- Theme settings

### 2. Navigation State

- Current route
- Navigation history
- Active tabs/panels
- Modal states

### 3. Domain State

- Entity data
- Relationships
- Cached responses
- Derived state

### 4. UI State

- Loading states
- Error states
- Form values
- UI element states

## State Management Patterns

### Global State Pattern

```typescript
// Redux slice example
const slice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    action: (state, action) => {
      // state updates
    },
  },
});

// Context example
const FeatureContext = createContext<FeatureState>(initialState);
```

### Local State Pattern

```typescript
// Component state
const [state, setState] = useState<ComponentState>(initialState);

// Form state
const form = useForm<FormData>({
  defaultValues,
  resolver: zodResolver(schema),
});
```

### Cache Pattern

```typescript
// Query cache
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
});

// Storage cache
const storage = new StorageService();
await storage.set('key', value);
```

## State Update Patterns

### 1. Immutable Updates

```typescript
// Correct
setState((prev) => ({
  ...prev,
  value: newValue,
}));

// Incorrect
state.value = newValue;
```

### 2. Batch Updates

```typescript
// Batch related changes
batch(() => {
  dispatch(action1());
  dispatch(action2());
});
```

### 3. Optimistic Updates

```typescript
// Update UI immediately, revert on error
const optimisticUpdate = async () => {
  const previousData = queryClient.getQueryData(['key']);
  queryClient.setQueryData(['key'], newData);

  try {
    await mutation.mutateAsync(newData);
  } catch (error) {
    queryClient.setQueryData(['key'], previousData);
  }
};
```

## Best Practices

1. **State Location**

   - Keep state as close as possible to where it's used
   - Lift state up only when necessary
   - Use appropriate state management solution for the use case

2. **Performance**

   - Minimize state updates
   - Use selective re-rendering
   - Implement proper memoization
   - Batch related updates

3. **Type Safety**
   - Define clear state interfaces
   - Use strict type checking
   - Implement proper error boundaries
   - Validate state updates

## Related Diagrams

- [Component Interactions](interactions.md)
- [Data Flow](../data-flow/state-management.md)
- [Error Handling](../system/error-flow.md)
